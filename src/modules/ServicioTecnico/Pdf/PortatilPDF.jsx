import React from "react";
import { PdfBaseService } from "../../../utils/PdfBaseService";
import logo from "../../../assets/logo.png";
import logo2 from "../../../assets/logo2.png";
import portada from '../../../assets/ferxxo.png';
import imgData from '../../../assets/final-reporte.jpg';
import { ApiWebURL } from "../../../utils/index.jsx";

function PortatilPDF({ servicio }) {
    // Función auxiliar para validar datos en los filtros
    const tieneDato = (valor) => {
        return valor !== undefined && valor !== null && valor !== "" && valor !== "---" && valor !== "-";
    };

    const generarPDF = async () => {
        try {
            const pdf = new PdfBaseService(servicio, {
                assets: { logo, logo2, portada }
            });
            const { doc, margin, pageWidth, pageHeight } = pdf;

            const cargarImagen = (src) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = src;
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                });
            };

            const [imgLogo1, imgLogo2, footerImg] = await Promise.all([
                cargarImagen(logo),
                cargarImagen(logo2),
                cargarImagen(imgData)
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
            aplicarDisenoPagina();
            pdf.y = 35;


            // FECHA Y DATOS CLIENTE
            const fechaBackend = new Date(servicio.fechainicio + 'T00:00:00');

            const formattedDate = `Lima, ${fechaBackend.getDate()} de ${fechaBackend.toLocaleDateString('es-ES', { month: 'long' })} de ${fechaBackend.getFullYear()}`;

            doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(0);
            doc.text(formattedDate, pageWidth - margin - 50, pdf.y);
            pdf.y += 10;

            const clienteData = [
                `Cliente: ${servicio.razon_social || "---"}`,
                `Contacto: ${servicio.contacto || "---"}`,
                `Asunto: ${servicio.tipoServicio || "---"}`,
                `Tengo a bien hacerle llegar nuestro informe de servicio técnico N.° IST-${servicio.id_servicio || '---'}/2026, correspondiente al servicio de`,
                `${servicio.tipoServicio || "Mantenimiento Técnico"}`,
            ];

            clienteData.forEach((line) => {
                doc.text(line, margin, pdf.y);
                pdf.y += 6;
            });

            pdf.y += 10;

            // --- I. DATOS GENERALES DEL COMPRESOR ---
            const bodyEquipo = [
                ["Marca", servicio.marca || "---", "Nivel de Aceite", servicio.nivelAceite || "---"],
                ["Modelo", servicio.modelo || "---", "Tipo de Aceite", servicio.tipoAceite || "---"],
                ["N° de Serie", servicio.serie || "---", "Temperatura Descarga", servicio.tempdescarga || "---"],
                ["Horómetro", servicio.horometro ? `${servicio.horometro} H` : "---", "Presión Carga", servicio.presionCarga ? `${servicio.presionCarga} Psi` : "---"],
                ["Unidad P/N", servicio.unidadPN || "---", "Presión Descarga", servicio.presionDescarga ? `${servicio.presionDescarga} Psi` : "---"],
                ["Unidad S/N", servicio.unidadSN || "---", "", ""] // Fila ajustada o eliminada si prefieres
            ].filter(fila => tieneDato(fila[1]) || tieneDato(fila[3]));

            if (bodyEquipo.length > 0) {
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("I. DATOS GENERALES DEL COMPRESOR", margin, pdf.y);
                doc.autoTable({
                    startY: pdf.y + 5,
                    theme: 'grid',
                    head: [["DESCRIPCIÓN", "VALOR", "DESCRIPCIÓN", "VALOR"]],
                    body: bodyEquipo,
                    headStyles: { fillColor: [41, 128, 185] },
                    styles: { fontSize: 9 }
                });
                pdf.y = doc.lastAutoTable.finalY + 10;
            }

            // --- II. DATOS MOTOR DE COMBUSTIÓN ---
            const MotorCombustion = [
                ["Marca", servicio.marcaCombu || "---", "Modelo", servicio.modeloCombu || "---"],
                ["Serie", servicio.serieCombu || "---", "Voltaje", servicio.voltajeCombu ? `${servicio.voltajeCombu} Volt` : "---"],
                ["Presión de Aceite", servicio.presionAceiteCombu ? `${servicio.presionAceiteCombu} Psi` : "---", "Nivel de Aceite", servicio.nivelAceiteCombu || "---"],
                ["RPM Máximo", servicio.rpmMaximoCombu ? `${servicio.rpmMaximoCombu} RPM` : "---", "RPM Mínimo", servicio.rpmMinimoCombu ? `${servicio.rpmMinimoCombu} RPM` : "---"],
                ["Nivel Refrigerante", servicio.nivelRefrigeranteCombu || "---", "Tipo de Aceite", servicio.tipoAceiteCombu || "---"]
            ].filter(fila => tieneDato(fila[1]) || tieneDato(fila[3]));

            if (MotorCombustion.length > 0) {
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("II. DATOS GENERAL DE MOTOR DE COMBUSTIÓN", margin, pdf.y);
                doc.autoTable({
                    startY: pdf.y + 5,
                    theme: 'grid',
                    head: [["DESCRIPCIÓN", "VALOR", "DESCRIPCIÓN", "VALOR"]],
                    body: MotorCombustion,
                    headStyles: { fillColor: [41, 128, 185] },
                    styles: { fontSize: 9 }
                });
                pdf.y = doc.lastAutoTable.finalY + 10;
            }

            // --- III. ACTIVIDADES (Lógica de filtrado) ---
            const todasLasActividades = [
                ["Filtro de aire primario", servicio.filtroAirePrim],
                ["Kit válvula de presión mínima", servicio.kitPresMin],
                ["Kit válvula termostática", servicio.kitValvTerm],
                ["Mangueras de lubricación", servicio.mangLub],
                ["Filtro de aire secundario", servicio.filtroAireSec],
                ["Kit válvula de parada de aceite", servicio.kitParAceite],
                ["Kit de reparación de válvula espiral", servicio.kitRepEsp],
                ["Drenaje automático del tanque", servicio.drenAutoTanque],
                ["Filtro de aceite", servicio.filtroAceite],
                ["Kit regulador de admisión", servicio.kitRegAdm],
                ["Drenaje automático pre-filtro", servicio.drenAutoPref],
                ["Filtro separador primario", servicio.filtroSepPrim],
                ["Kit regulador de espiral", servicio.kitRegEsp],
                ["Válvula de alivio", servicio.valvAlivio],
                ["Drenaje automático del secador", servicio.drenAutoSeca],
                ["Filtro separador secundario", servicio.filtroSepSec],
                ["Kit válvula de admisión", servicio.kitValvAdm],
                ["Válvula check de descarga", servicio.valvChkDesc],
                ["Anillo de tapa del tanque", servicio.anilloTanque],
                ["Lubricante", servicio.lubricante],
                ["Kit válvula de sullicon", servicio.kitSullicon],
                ["Válvula check 1/4 de control", servicio.valvChkCtrl],
                ["Filtro de línea de control", servicio.filtLineCtrl],
                ["Orificio de línea de retorno", servicio.orifRet],
                ["Kit válvula solenoide de 2 vías", servicio.kitSol2Vias],
                ["Válvula check 1/2", servicio.valvChk1],
                ["Trampas de agua", servicio.trampAgua],
                ["Filtros de línea de retorno", servicio.filtRet],
                ["Kit válvula solenoide de 3 vías", servicio.kitSol3Vias],
                ["Acople flexible", servicio.acopFlex],
                ["Carbón activo en línea de aire", servicio.carbonActAir],
                ["Enfriador de aceite/aire", servicio.enfrAceite],
                ["Pre-filtro coalescente", servicio.preFiltCoal],
                ["Post-filtro coalescente", servicio.postFiltCoal],
                ["Tablero eléctrico", servicio.tableroEquip],
                ["Conex. motor principal", servicio.conexMotor],
                ["Ventilador motor prin.", servicio.ventMotorPrin],
                ["Conex. motor sec.", servicio.conexMotorSec],
                ["Ventilador motor sec.", servicio.ventMotorSec],
                ["Condensador Secador", servicio.Condensador],
                ["Evaporador Secador", servicio.Evaporador]
            ];

            // 1. Filtramos los datos (Esto ya lo tienes bien)
            const actividadesConDato = todasLasActividades.filter(act => act[1] && act[1] !== "-");

            let bodyFinal = [];
            let columnasHead = [['Descripción', 'Valor']]; // Por defecto 2 columnas

            // 2. Lógica Dinámica: ¿2 o 4 columnas?
            if (actividadesConDato.length <= 10) {
                // Si son 10 o menos, mantenemos la estructura simple de 2 columnas
                bodyFinal = actividadesConDato;
            } else {
                // Si son más de 10, reestructuramos a 4 columnas (Descripción, Valor, Descripción, Valor)
                columnasHead = [['Descripción', 'Valor', 'Descripción', 'Valor']];

                // Calculamos la mitad para dividir la lista
                const mitad = Math.ceil(actividadesConDato.length / 2);

                for (let i = 0; i < mitad; i++) {
                    const filaIzquierda = actividadesConDato[i];
                    const filaDerecha = actividadesConDato[i + mitad]; // Tomamos el elemento de la segunda mitad

                    bodyFinal.push([
                        filaIzquierda[0],
                        filaIzquierda[1],
                        filaDerecha ? filaDerecha[0] : "", // Si no hay más datos a la derecha, celda vacía
                        filaDerecha ? filaDerecha[1] : ""
                    ]);
                }
            }

            // --- III. ACTIVIDADES REALIZADAS DURANTE EL SERVICIO ---
            doc.setFont("helvetica", "bold").setFontSize(11);
            doc.text("III. ACTIVIDADES REALIZADAS DURANTE EL SERVICIO", margin, pdf.y);

            doc.autoTable({
                startY: pdf.y + 5,
                margin: { top: 35 }, // Evita encimarse con el logo en saltos de página
                head: columnasHead,
                body: bodyFinal,
                theme: "grid",
                styles: { fontSize: 7, cellPadding: 1.5 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
                columnStyles: {
                    1: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] },
                    3: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] }
                },
                didDrawPage: (_data) => {
                    if (self?.drawHeader) self.drawHeader();
                }
            });

            pdf.y = doc.lastAutoTable.finalY + 12;



            // --- IV, V, VI, VII. SECCIONES DE TEXTO ---
            // --- SECCIONES DE TEXTO ---
            const maxWidth = pageWidth - (margin * 2); // Ajustado para márgenes simétricos
            const lineSpacing = 7; // Aumentado de 5 a 7 para dar más aire entre líneas de texto
            const sectionGap = 2; // Espacio extra después de cada sección

            const secciones = [
                { titulo: "IV. INSPECCIÓN DE FILTRO DE ACEITE:", contenido: servicio.inspeccionfiltroaceite },
                { titulo: "V. DESCRIPCIÓN DEL TRABAJO:", contenido: servicio.descripcionTrabajo },
                { titulo: "VI. RECOMENDACIONES:", contenido: servicio.recomendaciones },
                { titulo: "VII. CONCLUSIONES:", contenido: servicio.conclusiones }
            ];

            secciones.forEach(sec => {

                // Dividir el texto con el nuevo ancho máximo
                const lines = doc.splitTextToSize(sec.contenido || "No aplica", maxWidth);

                // Calcular altura necesaria: (Nº líneas * interlineado) + espacio del título + margen de seguridad
                const contentHeight = (lines.length * lineSpacing);
                const totalSectionHeight = contentHeight + 20;

                // Salto de página preventivo
                if (pdf.y + totalSectionHeight > pageHeight - 40) {
                    doc.addPage();
                    pdf.y = 35;
                }

                // Dibujar Título
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text(sec.titulo, margin, pdf.y);

                // Espacio entre título y contenido
                pdf.y += 8;

                // Dibujar Contenido con interlineado mejorado
                doc.setFont("helvetica", "normal").setFontSize(10);
                // El tercer parámetro de doc.text puede ser un objeto con el interlineado (lineHeightFactor)
                doc.text(lines, margin, pdf.y, { lineHeightFactor: 2 });

                // Actualizar la posición Y para la siguiente sección
                pdf.y += contentHeight + sectionGap;
            });

            // --- VIII. EVIDENCIA FOTOGRÁFICA ---
            if (servicio.imagenes && servicio.imagenes.length > 0) {
                // 1. Asegurar orden por fecha (Opcional, si tu objeto tiene un campo 'fecha')
                // servicio.imagenes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                if (pdf.y > pageHeight - 60) { doc.addPage(); pdf.y = 35; }
                doc.setFont("helvetica", "bold").setFontSize(11);
                doc.text("VIII. EVIDENCIA FOTOGRÁFICA", margin, pdf.y);
                pdf.y += 10;

                // Promise.all garantiza que el array resultante (processedImages) 
                // siga el mismo orden que el array de entrada (servicio.imagenes)
                const processedImages = await Promise.all(servicio.imagenes.map((imgObj, index) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.src = imgObj.url;
                        img.onload = () => {
                            const canvas = document.createElement("canvas");
                            const escalaNitidez = 2;
                            canvas.width = 600 * escalaNitidez;
                            canvas.height = 800 * escalaNitidez;
                            const ctx = canvas.getContext("2d");
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            // Resolvemos con un objeto que incluya la data y el título para no perder la referencia
                            resolve({
                                data: canvas.toDataURL("image/jpeg", 0.8),
                                titulo: imgObj.titulo || `Imagen ${index + 1}`
                            });
                        };
                        img.onerror = () => resolve(null);
                    });
                }));

                const imgW = (pageWidth - (margin * 4)) / 3;
                const imgH = imgW * 1.1;
                let xPos = margin;

                // Filtrar nulos pero manteniendo la lógica de la cuadrícula
                const validImages = processedImages.filter(img => img !== null);

                for (let i = 0; i < validImages.length; i++) {
                    const currentImg = validImages[i];

                    // Verificar si cabe en la página actual
                    if (pdf.y + imgH + 20 > pageHeight - 40) {
                        doc.addPage();
                        pdf.y = 35;
                        xPos = margin; // Reiniciar xPos en nueva página
                    }

                    // Insertar Imagen
                    doc.addImage(currentImg.data, 'JPEG', xPos, pdf.y, imgW, imgH, undefined, 'FAST');

                    // Insertar Título
                    doc.setFontSize(8).setFont("helvetica", "normal");
                    doc.text(currentImg.titulo, xPos + imgW / 2, pdf.y + imgH + 5, {
                        align: 'center',
                        maxWidth: imgW
                    });

                    // Calcular posición de la siguiente imagen
                    if ((i + 1) % 3 === 0) {
                        xPos = margin;
                        pdf.y += imgH + 18; // Salto de fila
                    } else {
                        xPos += imgW + margin; // Siguiente columna
                    }
                }

                // Ajustar pdf.y final si la última fila no se completó
                if (validImages.length % 3 !== 0) {
                    pdf.y += imgH + 18;
                }
            }

            // --- FIRMA Y CIERRE ---
            // Verificamos espacio suficiente para nombre + firma + pie (aprox 80 unidades)
            if (pdf.y > pageHeight - 80) { doc.addPage(); pdf.y = 35; }

            doc.setFontSize(10).setFont("helvetica", "normal").text("Quedamos atentos a cualquier consulta.", margin, pdf.y);
            pdf.y += 10;

            // --- SECCIÓN: FIRMA / RESPONSABLE ---

            // 1. Configuración de etiquetas y valores
            const label = "Persona Encargada: ";
            const nombreEncargado = servicio.encargado || "No especificado";

            doc.setFont("helvetica", "bold").setFontSize(10);

            // 2. Dibujar la etiqueta "Persona Encargada:"
            doc.text(label, margin, pdf.y);

            // 3. Calcular el ancho del texto de la etiqueta para saber dónde empezar el nombre
            // Esto evita que el nombre se encime sobre la etiqueta
            const labelWidth = doc.getTextWidth(label);

            // 4. Dibujar el nombre justo al costado con fuente normal
            doc.setFont("helvetica", "normal");
            doc.text(nombreEncargado, margin + labelWidth, pdf.y);

            // 5. Espacio para lo que sigue debajo
            pdf.y += 10;

            // 2. FIRMA (Debajo del nombre)
            if (servicio.firma) {
                const firmaUrl = servicio.firma.startsWith('http')
                    ? servicio.firma
                    : `${ApiWebURL.replace(/\/api\/?$/, '')}/uploads/${servicio.firma.replace(/^\/?uploads\//, '')}`;
                const fImg = await cargarImagen(firmaUrl);
                if (fImg) {
                    // La firma se coloca justo debajo del cargo
                    doc.addImage(fImg, 'PNG', margin, pdf.y, 40, 15);
                    pdf.y += 20;
                }
            } else {
                // Si no hay imagen, dejamos un espacio vacío para firma manual
                pdf.y += 20;
            }

            // --- FOOTER / IMAGEN ADICIONAL ---
            if (footerImg) {
                pdf.y += 10;
                // Verificación de seguridad por si el footer ya no cabe
                if (pdf.y + 40 > pageHeight - 10) { doc.addPage(); pdf.y = 35; }
                doc.addImage(footerImg, 'JPEG', margin, pdf.y, 120, 40);
            }

            doc.save(`Reporte_Saircom_${servicio.id_servicio || '000'}.pdf`);

        } catch (error) {
            console.error("Error al generar PDF:", error);
        }
    };
    return (
        <button onClick={generarPDF} className="btn btn-primary">
            Generar PDF Portatil
        </button>
    );
}

export default PortatilPDF;
