import jsPDF from "jspdf";
import "jspdf-autotable";

export class PdfBaseService {
    constructor(servicio, config = {}) {
        this.doc = new jsPDF();
        this.servicio = servicio;
        this.margin = 15;
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.y = 30;
        this.assets = config.assets || {};
        this.usableHeight = this.pageHeight - 35;
    }

    async loadImage(src) {
        if (!src) return null;
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });
    }

    async drawCover() {
        const { doc, pageWidth, pageHeight, servicio } = this;
        const currentDate = new Date();

        // Imagen de fondo
        if (this.assets.portada) {
            const portImg = await this.loadImage(this.assets.portada);

            if (portImg) {
                doc.addImage(portImg, "PNG", 0, 0, pageWidth, pageHeight);
            }
        }

        const idFormateado = String(servicio.id_servicio || 0).padStart(6, "0");
        const numeracion = `IST-${idFormateado} / ${currentDate.getFullYear()}`;
        const maxTextWidth = pageWidth - 60;

        const ajustarTexto = (texto, fontSize, maxWidth) => {
            doc.setFontSize(fontSize);
            return doc.splitTextToSize(texto || "", maxWidth);
        };

        const clienteLines = ajustarTexto(
            servicio.razon_social || "CLIENTE NO ESPECIFICADO",
            22,
            maxTextWidth
        );

        const modelo = `Modelo: ${servicio.modelo || "No especificado"}`;
        const serie = `Serie: ${servicio.serie || "No especificado"}`;
        const mantenimiento = servicio.tipoServicio || "Mantenimiento no especificado";
        const mantenimientoLines = ajustarTexto(
            mantenimiento,
            18,
            maxTextWidth
        );

        // 1. Obtenemos el nombre completo del técnico principal
        const tecnicoPrincipal = `${servicio.tecnico || ""} ${servicio.tecnico_apellidos || ""}`.trim();

        // 2. Mapeamos los técnicos adicionales para obtener sus nombres (ajusta 'nombre' y 'apellidos' según la estructura real de tu objeto)
        const adicionales = (servicio.tecnicos_adicionales || [])
            .map(t => `${t.nombres || ""} ${t.apellidos || ""}`.trim())
            .filter(t => t !== ""); // Filtramos por si algún técnico adicional está vacío

        // 3. Combinamos todo en un solo array y unimos con comas
        const todosLosTecnicos = [...new Map(
            [tecnicoPrincipal, ...adicionales]
                .filter(nombre => nombre !== "")
                .map(nombre => [nombre.toLocaleLowerCase('es'), nombre])
        ).values()];

        // La fecha del informe corresponde a la programación original de la OT.
        let fechaFormateada = "No especificada";
        const fechaProgramada = servicio.fecha_programada || servicio.orden?.fecha_programada;

        if (fechaProgramada) {
            const fechaDoc = new Date(fechaProgramada);
            if (!Number.isNaN(fechaDoc.getTime())) fechaFormateada = fechaDoc.toLocaleDateString("es-PE", {
                timeZone: "America/Lima",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        const SAIRCOM_AZUL = "#002C53";

        const titleText = [
            {
                text: numeracion,
                fontSize: 22,
                extraSpace: 12,
                color: SAIRCOM_AZUL
            },
            ...clienteLines.map((line) => ({
                text: line,
                fontSize: 22,
                extraSpace: 4,
                color: SAIRCOM_AZUL
            })),
            {
                text: modelo,
                fontSize: 18,
                extraSpace: 4,
                color: SAIRCOM_AZUL
            },
            {
                text: serie,
                fontSize: 18,
                extraSpace: 4,
                color: SAIRCOM_AZUL
            },
            ...mantenimientoLines.map((line, index) => ({
                text: line,
                fontSize: 18,
                extraSpace: index === mantenimientoLines.length - 1 ? 0 : 2,
                color: SAIRCOM_AZUL
            }))
        ];

        const titleSpacing = 6;

        const totalTitleHeight = titleText.reduce(
            (acc, line) =>
                acc +
                line.fontSize * 0.5 +
                (line.extraSpace || 0) +
                titleSpacing,
            0
        );

        let currentY = (pageHeight - totalTitleHeight) / 2;

        doc.setFont("times", "bold");
        doc.setTextColor(255, 255, 255);

        titleText.forEach((line) => {
            doc.setFontSize(line.fontSize);

            doc.text(line.text, pageWidth / 2, currentY, {
                align: "center"
            });

            currentY +=
                line.fontSize * 0.5 +
                titleSpacing +
                (line.extraSpace || 0);
        });

        currentY += 48;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);

        if (todosLosTecnicos.length <= 1) {
            // Solo un técnico
            doc.text(
                `TÉCNICO : ${todosLosTecnicos[0] || "No asignado"}`,
                20,
                currentY
            );
            currentY += 8;
        } else {
            // Varios técnicos
            doc.text("TÉCNICOS :", 20, currentY);
            currentY += 7;

            doc.setFont("helvetica", "normal");

            todosLosTecnicos.forEach((nombre, index) => {
                doc.text(`${index + 1}. ${nombre}`, 28, currentY);
                currentY += 6;
            });

            currentY += 2; // Espacio adicional después de la lista
        }
        doc.text(`FECHA PROGRAMADA : ${fechaFormateada}`, 20, currentY + 12);
    }

    drawHeader() {
        const { doc, margin, pageWidth, assets } = this;

        // 1. Logo Principal (Izquierda)
        if (assets.logo) {
            doc.addImage(assets.logo, "PNG", margin, 10, 35, 12);
        }

        // 2. Logo Secundario (Derecha)
        // Calculamos: Ancho Total - Margen - Ancho del Logo (30)
        if (assets.logo2) {
            doc.addImage(assets.logo2, "PNG", pageWidth - margin - 30, 8, 30, 15);
        }

        // Línea divisoria
        doc.setDrawColor(200).line(margin, 24, pageWidth - margin, 24);
    }

    save(name) {
        const total = this.doc.internal.getNumberOfPages();
        for (let i = 2; i <= total; i++) {
            this.doc.setPage(i);
            this.drawHeader();
            this.doc.setFontSize(8).setTextColor(150).text(`Página ${i} de ${total}`, this.pageWidth - 30, this.pageHeight - 10);
        }
        this.doc.save(`${name}.pdf`);
    }
}
