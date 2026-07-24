import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const dinero = valor => `S/ ${Number(valor || 0).toFixed(2)}`;
const fecha = valor => valor ? new Date(valor).toLocaleDateString('es-PE') : '-';

export const crearPdfViaticos = (gastos = [], filtros = {}) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const total = gastos.reduce((suma, gasto) => suma + Number(gasto.monto || 0), 0);

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 297, 27, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE VIATICOS POR ORDEN DE TRABAJO', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 20);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    const rango = filtros.desde || filtros.hasta
        ? `Rango: ${filtros.desde || 'inicio'} a ${filtros.hasta || 'hoy'}`
        : 'Rango: todas las fechas';
    doc.text(rango, 14, 34);
    doc.setFont('helvetica', 'bold');
    doc.text(`Registros: ${gastos.length}`, 14, 40);
    doc.text(`Total filtrado: ${dinero(total)}`, 65, 40);

    doc.autoTable({
        startY: 46,
        head: [['Fecha', 'OT', 'Cliente', 'Tecnico lider', 'Categoria', 'Subcategoria', 'Estado', 'Importe']],
        body: gastos.map(gasto => [
            fecha(gasto.fecha_gasto),
            `OT-${gasto.id_ot}`,
            gasto.razon_social || '-',
            gasto.tecnico_lider || '-',
            gasto.nombre_categoria || '-',
            gasto.nombre_subcategoria || '-',
            String(gasto.estado || '').toUpperCase(),
            dinero(gasto.monto)
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.4, overflow: 'linebreak', valign: 'middle' },
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            0: { cellWidth: 20 }, 1: { cellWidth: 16 }, 2: { cellWidth: 48 },
            3: { cellWidth: 38 }, 4: { cellWidth: 30 }, 5: { cellWidth: 38 },
            6: { cellWidth: 22 }, 7: { cellWidth: 24, halign: 'right' }
        },
        margin: { left: 10, right: 10, bottom: 14 },
        tableWidth: 'wrap',
        didDrawPage: () => {
            const numero = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Pagina ${numero}`, 282, 202, { align: 'right' });
            doc.text('SAIRCOM - Control de viaticos', 10, 202);
        }
    });

    return doc;
};

export const exportarPdfViaticos = (gastos, filtros) => {
    const nombre = `reporte-viaticos-${filtros.desde || 'inicio'}-${filtros.hasta || 'hoy'}.pdf`;
    crearPdfViaticos(gastos, filtros).save(nombre);
};
