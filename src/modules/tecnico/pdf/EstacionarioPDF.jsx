/* eslint-disable react/prop-types */
import { PdfBaseService } from "../../../utils/PdfBaseService";
import logo from "../../../assets/logo.png";
import logo2 from "../../../assets/logo2.png";
import portada from '../../../assets/ferxxo.png';
// import portada from '../../../assets/Portada-2026.png';
import imgData from '../../../assets/final-reporte.jpg';
import { Download } from "lucide-react";

function EstacionarioPDF({ servicio }) {
    const tieneDato = (val) => {
        return val !== null && val !== undefined && val.toString().trim() !== "" && val.toString().trim() !== "-";
    };

    const generar = async () => {
        try {
            const pdf = new PdfBaseService(servicio, {
                assets: { logo, logo2, portada }
            });
            const { doc, margin, pageWidth, pageHeight } = pdf;

            // NUEVA FUNCIÓN DE CARGA: Convierte la imagen a Base64 vía fetch para saltar el bloqueo de Canvas
            const cargarImagenCloudinaryABase64 = async (url) => {
                try {
                    if (!url) return null;
                    if (typeof url === "string" && url.startsWith("data:image")) return url;

                    // Aseguramos que la URL use HTTPS (Cloudinary a veces da problemas en HTTP)
                    const secureUrl = url.replace("http://", "https://");

                    const respuesta = await fetch(secureUrl, { method: 'GET' });
                    const blob = await respuesta.blob();

                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    });
                } catch (error) {
                    console.error("Error obteniendo imagen de Cloudinary mediante Fetch (CORS):", error);
                    return null;
                }
            };

            // Para los assets locales seguimos usando Image tradicional
            const cargarImagenLocal = (src) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                });
            };

            // Cargamos los logos locales
            const [imgLogo1, imgLogo2, footerImg] = await Promise.all([
                cargarImagenLocal(logo),
                cargarImagenLocal(logo2),
                cargarImagenLocal(imgData)
            ]);

            const aplicarDisenoPagina = () => {
                if (imgLogo1) doc.addImage(imgLogo1, 'PNG', margin, 10, 40, 15);
                if (imgLogo2) doc.addImage(imgLogo2, 'PNG', pageWidth - margin - 40, 10, 40, 15);
            };

            doc.internal.events.subscribe("addPage", () => {
                aplicarDisenoPagina();
            });

            // 1. PORTADA
            await pdf.drawCover();

            // 2. CONTENIDO PRINCIPAL
            doc.addPage();
            pdf.y = 35;

            // FECHA Y DATOS CLIENTE
            const fechaBackend = servicio.fechainicio ? new Date(servicio.fechainicio) : new Date();
            const fechaValida = Number.isNaN(fechaBackend.getTime()) ? new Date() : fechaBackend;
            const formattedDate = `Lima, ${fechaValida.getDate()} de ${fechaValida.toLocaleDateString('es-ES', { month: 'long' })} de ${fechaValida.getFullYear()}`;

            doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(0);
            doc.text(formattedDate, pageWidth - margin - 50, pdf.y);
            pdf.y += 10;

            const clienteData = [
                `Cliente: ${servicio.razon_social || "---"}`,
                `Contacto: ${servicio.encargado_equipo || "---"}`,
                `Asunto: ${servicio.tipoServicio || "---"}`,
                `Tengo a bien hacerle llegar nuestro informe de servicio técnico N.° IST-${servicio.id_servicio || '---'}/2026, correspondiente al servicio de`,
                `${servicio.tipoServicio || "Mantenimiento Técnico"}`,
            ];

            clienteData.forEach((line) => {
                doc.setFont("helvetica", "normal");
                doc.text(line, margin, pdf.y);
                pdf.y += 6;
            });

            pdf.y += 10;

        


            // --- I. DATOS DEL EQUIPO COMPRESOR ---
            const lectura = (servicio.lecturas_compresor && servicio.lecturas_compresor.length > 0)
                ? servicio.lecturas_compresor[0]
                : {};

            const bodyEquipo = [
                ["Marca", servicio.marca || "---", "Presión Descarga", tieneDato(lectura.presion_descarga) ? `${lectura.presion_descarga} PSI` : "---"],
                ["Modelo", servicio.modelo || "---", "Temp. Descarga", tieneDato(lectura.temp_descarga) ? `${lectura.temp_descarga} °C` : "---"],
                ["N° de Serie", servicio.serie || "---", "Amp. Motor Principal", tieneDato(lectura.amp_motor) ? `${lectura.amp_motor} AMP` : "---"],
                ["Unidad P/N", lectura.unidadpn || "---", "Unidad S/N", lectura.unidadsn || "---"],
                ["Horómetro", tieneDato(lectura.horometro) ? `${lectura.horometro} H` : "---", "Amp. Motor Ventilador", tieneDato(lectura.amp_motor_ventilador) ? `${lectura.amp_motor_ventilador} AMP` : "---"],
                ["Voltaje Equipo", lectura.volt_equipo || "---", "Tipo de Aceite", lectura.tipo_aceite || "---"],
                ["Tipo de Arranque", lectura.tipo_arranque || "---", "Nivel de Aceite", lectura.nivel_aceite || "---"],
                ["Presión Carga", tieneDato(lectura.presion_carga) ? `${lectura.presion_carga} PSI` : "---", "Equipo en Operación", lectura.equipo_operacion || "---"]
            ].filter(fila => fila[1] !== "---" || fila[3] !== "---");

            if (bodyEquipo.length > 0) {
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("I. DATOS DEL EQUIPO COMPRESOR", margin, pdf.y);
                doc.autoTable({
                    startY: pdf.y + 5,
                    theme: 'grid',
                    head: [["DESCRIPCIÓN", "VALOR", "DESCRIPCIÓN", "VALOR"]],
                    body: bodyEquipo,
                    headStyles: { fillColor: [41, 128, 185] },
                    styles: { fontSize: 8 }
                });
                pdf.y = doc.lastAutoTable.finalY + 10;
            }

            // --- II. DATOS GENERALES DEL SECADOR ---
            const secador = (servicio.lecturas_secador && servicio.lecturas_secador.length > 0)
                ? servicio.lecturas_secador[0]
                : {};

            const dataSecador = [
                ["Marca", secador.marca_secador],
                ["Modelo", secador.modelo_secador],
                ["N° de Serie", secador.serie_secador],
                ["Voltaje Equipo", tieneDato(secador.voltaje_secador) ? `${secador.voltaje_secador}` : null],
                ["Amperaje Equipo", tieneDato(secador.amperaje_secador) ? `${secador.amperaje_secador} Amp` : null],
                ["Punto de rocío", tieneDato(secador.punto_rocio) ? `${secador.punto_rocio} °C` : null],
                ["Tipo de refrigerante", secador.tipo_refrigeracion]
            ].filter(fila => tieneDato(fila[1]));

            if (dataSecador.length > 0) {
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("II. DATOS GENERALES DEL SECADOR DE REFRIGERACIÓN", margin, pdf.y);

                doc.autoTable({
                    startY: pdf.y + 5,
                    theme: 'grid',
                    head: [["DESCRIPCIÓN", "VALOR"]],
                    body: dataSecador,
                    headStyles: { fillColor: [41, 128, 185], halign: 'center' },
                    styles: { fontSize: 8 }
                });

                pdf.y = doc.lastAutoTable.finalY + 10;
            }

            // --- III. ACTIVIDADES REALIZADAS ---
            const filtros = (servicio.filtros_y_componentes && servicio.filtros_y_componentes.length > 0)
                ? servicio.filtros_y_componentes[0]
                : {};

            const todasLasActividades = [
                ["Filtro de aire primario", filtros.filtroAirePrim],
                ["Kit válvula de presión mínima", filtros.kitPresMin],
                ["Kit válvula termostática", filtros.kitValvTerm],
                ["Mangueras de lubricación", filtros.mangLub],
                ["Filtro de aire secundario", filtros.filtroAireSec],
                ["Kit válvula de parada de aceite", filtros.kitParAceite],
                ["Kit de reparación de válvula espiral", filtros.kitRepEsp],
                ["Drenaje automático del tanque", filtros.drenAutoTanque],
                ["Filtro de aceite", filtros.filtroAceite],
                ["Kit regulador de admisión", filtros.kitRegAdm],
                ["Drenaje automático pre-filtro", filtros.drenAutoPref],
                ["Filtro separador primario", filtros.filtroSepPrim],
                ["Kit regulador de espiral", filtros.kitRegEsp],
                ["Válvula de alivio", filtros.valvAlivio],
                ["Drenaje automático del secador", filtros.drenAutoSeca],
                ["Filtro separador secundario", filtros.filtroSepSec],
                ["Kit válvula de admisión", filtros.kitValvAdm],
                ["Válvula check de descarga", filtros.valvChkDesc],
                ["Anillo de tapa del tanque", filtros.anilloTanque],
                ["Lubricante", filtros.lubricante],
                ["Kit válvula de sullicon", filtros.kitSullicon],
                ["Válvula check 1/4 de control", filtros.valvChkCtrl],
                ["Filtro de línea de control", filtros.filtLineCtrl],
                ["Orificio de línea de retorno", filtros.orifRet],
                ["Kit válvula solenoide de 2 vías", filtros.kitSol2Vias],
                ["Válvula check 1/2", filtros.valvChk1],
                ["Trampas de agua", filtros.trampAgua],
                ["Filtros de línea de retorno", filtros.filtRet],
                ["Kit válvula solenoide de 3 vías", filtros.kitSol3Vias],
                ["Acople flexible", filtros.acopFlex],
                ["Carbón activo en línea de aire", filtros.carbonActAir],
                ["Enfriador de aceite/aire", filtros.enfrAceite],
                ["Pre-filtro coalescente", filtros.preFiltCoal],
                ["Post-filtro coalescente", filtros.postFiltCoal],
                ["Tablero eléctrico", filtros.tableroEquip],
                ["Conex. motor principal", filtros.conexMotor],
                ["Ventilador motor prin.", filtros.ventMotorPrin],
                ["Conex. motor sec.", filtros.conexMotorSec],
                ["Ventilador motor sec.", filtros.ventMotorSec],
                ["Condensador Secador", filtros.Condensador],
                ["Evaporador Secador", filtros.Evaporador],
                ["Válvula tres vías shuttle 1/4", filtros.valvShut1],
                ["Elemento acople", filtros.Elementoacople],
                ["Faja de acoplamiento", filtros.fajaAccionamiento],
                ["Sistema de lubricación", filtros.sistemaLubricacion]
            ];

            const actividadesConDato = todasLasActividades.filter(act => tieneDato(act[1]));

            let bodyFinal = [];
            let columnasHead = [['N°', 'Descripción', 'Valor', 'N°', 'Descripción', 'Valor']];

            if (actividadesConDato.length <= 10) {
                columnasHead = [['N°', 'Descripción', 'Valor']];
                bodyFinal = actividadesConDato.map((act, index) => [index + 1, act[0], act[1]]);
            } else {
                const mitad = Math.ceil(actividadesConDato.length / 2);
                for (let i = 0; i < mitad; i++) {
                    const izq = actividadesConDato[i];
                    const der = actividadesConDato[i + mitad];

                    bodyFinal.push([
                        i + 1,
                        izq[0],
                        izq[1],
                        der ? i + mitad + 1 : "",
                        der ? der[0] : "",
                        der ? der[1] : ""
                    ]);
                }
            }

            doc.setFont("helvetica", "bold").setFontSize(11);
            doc.text("III. ACTIVIDADES REALIZADAS DURANTE EL SERVICIO", margin, pdf.y);

            doc.autoTable({
                startY: pdf.y + 5,
                margin: { top: 35 },
                head: columnasHead,
                body: bodyFinal,
                theme: "grid",
                styles: { fontSize: 7, cellPadding: 1.5 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
                columnStyles: {
                    1: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] },
                    3: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] }
                }
            });

            pdf.y = doc.lastAutoTable.finalY + 12;

            // --- IV. LECTURAS DE VOLTAJE Y AMPERAJE ---
            doc.setFont("helvetica", "bold").setFontSize(11);
            const currentY = pdf.y || 20;
            doc.text("IV. LECTURAS DE VOLTAJE Y AMPERAJE", margin, currentY);

            const voltaje_amperaje = (servicio.voltaje_amperaje && servicio.voltaje_amperaje.length > 0)
                ? servicio.voltaje_amperaje[0]
                : {};

            doc.autoTable({
                startY: currentY + 5,
                margin: { top: 35 },
                theme: 'grid',
                head: [["FASE", "AMPERAJE (CARGA)", "AMP. (VACÍO)", "LÍNEA", "VOLTAJE (CARGA)", "VOLT. (VACÍO)"]],
                body: [
                    ["L1", `${voltaje_amperaje?.amp1 || 0} A`, `${voltaje_amperaje?.amp_vacio_minimo_l1 || 0} A`, "L1-L2", `${voltaje_amperaje?.volt1 || 0} V`, `${voltaje_amperaje?.vacio_minimo_l1 || 0} V`],
                    ["L2", `${voltaje_amperaje?.amp2 || 0} A`, `${voltaje_amperaje?.amp_vacio_minimo_l2 || 0} A`, "L2-L3", `${voltaje_amperaje?.volt2 || 0} V`, `${voltaje_amperaje?.vacio_minimo_l2 || 0} V`],
                    ["L3", `${voltaje_amperaje?.amp3 || 0} A`, `${voltaje_amperaje?.amp_vacio_minimo_l3 || 0} A`, "L1-L3", `${voltaje_amperaje?.volt3 || 0} V`, `${voltaje_amperaje?.vacio_minimo_l3 || 0} V`]
                ],
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 8, halign: 'center' },
            });

            pdf.y = doc.lastAutoTable.finalY + 12;

            // --- SECCIONES DE TEXTO ---
            const maxWidth = pageWidth - (margin * 2);
            const fontSizeContenido = 10;
            const factorInterlineado = 1.5;
            const marginBottom = 30;
            const marginTopNewPage = 45;
            const lineHeightMm = (fontSizeContenido / 2.8346) * factorInterlineado;

            const informeTecnico = servicio.detalle_informe || {};

            const secciones = [
                { titulo: "V. INSPECCIÓN DE FILTRO DE ACEITE:", contenido: lectura.inspfiltroaceite || "No aplica" },
                { titulo: "VI. DESCRIPCIÓN DEL TRABAJO:", contenido: informeTecnico.descripcionTrabajo },
                { titulo: "VII. RECOMENDACIONES:", contenido: informeTecnico.recomendaciones },
                { titulo: "VIII. CONCLUSIONES:", contenido: informeTecnico.conclusiones }
            ];

            secciones.forEach(sec => {
                if (pdf.y + 15 > pageHeight - marginBottom) {
                    doc.addPage();
                    pdf.y = marginTopNewPage;
                }

                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text(sec.titulo, margin, pdf.y);
                pdf.y += 6;

                doc.setFont("helvetica", "normal").setFontSize(fontSizeContenido);

                const textoFinal = sec.contenido || "No aplica";
                const lines = doc.splitTextToSize(textoFinal, maxWidth);

                lines.forEach(linea => {
                    if (pdf.y + lineHeightMm > pageHeight - marginBottom) {
                        doc.addPage();
                        pdf.y = marginTopNewPage;

                        doc.setFont("helvetica", "bold").setFontSize(11);
                        doc.text(sec.titulo + " (continuación)", margin, pdf.y);
                        pdf.y += 6;
                        doc.setFont("helvetica", "normal").setFontSize(fontSizeContenido);
                    }

                    doc.text(linea, margin, pdf.y);
                    pdf.y += lineHeightMm;
                });

                pdf.y += 5;
            });

            // --- IX. EVIDENCIA FOTOGRÁFICA (MÉTODO CLOUDINARY BASE64) ---
            const listaImagenes = servicio.imagenes_servicio || [];

            if (listaImagenes.length > 0) {
                if (pdf.y > pageHeight - 60) { doc.addPage(); pdf.y = 35; }
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("IX. EVIDENCIA FOTOGRÁFICA", margin, pdf.y);
                pdf.y += 10;

                // Usamos la nueva función fetch para evitar problemas de Canvas
                const processedImages = await Promise.all(listaImagenes.map((imgObj) =>
                    cargarImagenCloudinaryABase64(imgObj.url_imagen)
                ));

                const gap = 10;
                const imgW = (pageWidth - (margin * 2) - (gap * 2)) / 3;
                const imgH = imgW * 1.1;
                let xPos = margin;
                let imagenesDibujadas = 0;

                for (let i = 0; i < processedImages.length; i++) {
                    if (!processedImages[i]) continue;

                    if (pdf.y + imgH + 15 > pageHeight - 30) {
                        doc.addPage();
                        pdf.y = 35;
                        xPos = margin;
                    }

                    // Insertamos el Base64 directamente sin compresión extra de canvas local
                    doc.addImage(processedImages[i], 'JPEG', xPos, pdf.y, imgW, imgH, undefined, 'FAST');

                    const tituloImg = listaImagenes[i].titulo || `Imagen ${i + 1}`;

                    doc.setFontSize(7).text(
                        tituloImg,
                        xPos + imgW / 2,
                        pdf.y + imgH + 4,
                        { align: 'center', maxWidth: imgW }
                    );

                    imagenesDibujadas++;

                    if (imagenesDibujadas % 3 === 0) {
                        xPos = margin;
                        pdf.y += imgH + 15;
                    } else {
                        xPos += imgW + gap;
                    }
                }
                if (imagenesDibujadas % 3 !== 0) {
                    pdf.y += imgH + 15;
                }
            }

            if (pdf.y > pageHeight - 80) { doc.addPage(); pdf.y = 35; }

            doc.setFontSize(10).setFont("helvetica", "normal").text("Quedamos atentos a cualquier consulta.", margin, pdf.y);
            pdf.y += 10;

            // --- SECCIÓN: FIRMA / RESPONSABLE ---
            const FirmaResponsable = (servicio.servicio_responsable && servicio.servicio_responsable.length > 0)
                ? servicio.servicio_responsable[0]
                : {};

            const label = "Persona Encargada: ";
            const nombreEncargado = FirmaResponsable.encargado || servicio.encargado_equipo || servicio.encargado || "No especificado";

            doc.setFont("helvetica", "bold").setFontSize(10);
            doc.text(label, margin, pdf.y);

            const labelWidth = doc.getTextWidth(label);

            doc.setFont("helvetica", "normal");
            doc.text(nombreEncargado, margin + labelWidth, pdf.y);

            pdf.y += 10;

            const firmaValue = FirmaResponsable.firma || servicio.firma;
            if (firmaValue) {
                let firmaSource = firmaValue;

                if (typeof firmaSource === "string" && firmaSource.startsWith("/uploads/")) {
                    firmaSource = `${window.location.origin}${firmaSource}`;
                } else if (typeof firmaSource === "string" && !firmaSource.startsWith("data:image") && !firmaSource.startsWith("http")) {
                    firmaSource = `http://localhost:5000/uploads/${firmaSource}`;
                }

                const fImgData = await cargarImagenCloudinaryABase64(firmaSource);
                if (fImgData) {
                    doc.addImage(fImgData, 'PNG', margin, pdf.y, 40, 15);
                    pdf.y += 20;
                }
            } else {
                pdf.y += 20;
            }

            if (footerImg) {
                pdf.y += 10;
                if (pdf.y + 40 > pageHeight - 10) { doc.addPage(); pdf.y = 35; }
                doc.addImage(footerImg, 'JPEG', margin, pdf.y, 120, 40);
            }

            doc.save(`Reporte_Saircom_${servicio.id_servicio || '000'}.pdf`);

        } catch (error) {
            console.error("Error al generar PDF:", error);
        }
    };

    return (
        <button
            onClick={generar}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
            <Download size={20} />
            Descargar PDF
        </button>
    );
}

export default EstacionarioPDF;
