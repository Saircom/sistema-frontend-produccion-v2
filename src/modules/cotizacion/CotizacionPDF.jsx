import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Printer } from 'lucide-react';
import logo from '../../assets/logo.png';

const AZUL = [0, 67, 99];
const GRIS = [71, 85, 105];
const moneda = valor => `USD $ ${(Number(valor) || 0).toFixed(2)}`;
const texto = valor => String(valor ?? '').trim() || '-';

const fechaLima = fecha => {
    const valor = fecha ? new Date(fecha) : new Date();
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima', day: '2-digit', month: 'long', year: 'numeric'
    }).format(Number.isNaN(valor.getTime()) ? new Date() : valor);
};

const cargarImagen = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
});

const descripcionEquipo = equipo => {
    if (equipo.sin_equipo) return 'SERVICIOS SIN EQUIPO ASOCIADO';
    return [equipo.tipo_equipo, equipo.marca, equipo.modelo, equipo.serie ? `SERIE: ${equipo.serie}` : null]
        .filter(Boolean).join(' - ').toUpperCase();
};

const generarCotizacion = async cotizacion => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const imagenLogo = await cargarImagen(logo);
    const subtotalServicios = (cotizacion.equipos || []).reduce(
        (total, equipo) => total + (equipo.servicios || []).reduce(
            (subtotal, servicio) => subtotal + (Number(servicio.precio) || 0), 0
        ), 0
    );
    const adicional = Number(cotizacion.movilidad) || 0;
    const subtotal = subtotalServicios + adicional;
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    if (imagenLogo) doc.addImage(imagenLogo, 'PNG', 14, 12, 58, 19);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRIS);
    doc.text([
        'RUC 20548439111',
        'Av. El Sol 127 - Urb. La Campina - Chorrillos, Lima',
        'www.saircomperu.com.pe',
        'postventa2@saircomperu.com.pe'
    ], 14, 35, { lineHeightFactor: 1.35 });

    doc.setFillColor(...AZUL).roundedRect(125, 13, 70, 9, 1, 1, 'F');
    doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(12);
    doc.text('COTIZACION', 160, 19.3, { align: 'center' });
    doc.setTextColor(...AZUL).setFontSize(11);
    doc.text(texto(cotizacion.numero_cotizacion), 160, 29, { align: 'center' });
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRIS);
    doc.text(`Fecha: ${fechaLima(cotizacion.fecha_registro)}`, 125, 36);

    doc.setDrawColor(203, 213, 225).line(14, 50, 196, 50);
    doc.setFontSize(8).setTextColor(...GRIS);
    const datosCliente = [
        ['CLIENTE', cotizacion.nombre_cliente],
        ['RUC', cotizacion.ruc],
        ['DIRECCION', cotizacion.direccion],
        ['CONTACTO', cotizacion.contacto],
        ['TELEFONO', cotizacion.celular],
        ['CORREO', cotizacion.correo]
    ];
    let y = 56;
    datosCliente.forEach(([etiqueta, valor]) => {
        doc.setFont('helvetica', 'bold').setTextColor(...AZUL).text(etiqueta, 14, y);
        doc.setFont('helvetica', 'normal').setTextColor(30, 41, 59);
        const lineas = doc.splitTextToSize(texto(valor), 145);
        doc.text(lineas, 43, y);
        y += Math.max(5, lineas.length * 4);
    });

    y += 2;
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...AZUL);
    doc.text('DETALLE DE SERVICIOS COTIZADOS', 14, y);

    const filas = [];
    let item = 1;
    (cotizacion.equipos || []).forEach(equipo => {
        filas.push([{ content: descripcionEquipo(equipo), colSpan: 5, styles: {
            fillColor: [232, 242, 247], textColor: AZUL, fontStyle: 'bold', cellPadding: 2.2
        }}]);
        (equipo.servicios || []).forEach(servicio => {
            const precio = Number(servicio.precio) || 0;
            filas.push([
                String(item++),
                texto(servicio.nombre_subtipo),
                '1',
                moneda(precio),
                moneda(precio)
            ]);
        });
    });
    if (adicional > 0) {
        filas.push([String(item++), 'COSTO ADICIONAL', '1', moneda(adicional), moneda(adicional)]);
    }

    doc.autoTable({
        startY: y + 3,
        margin: { left: 14, right: 14, bottom: 25 },
        head: [['ITEM', 'DESCRIPCION', 'CANT.', 'P. UNITARIO', 'TOTAL']],
        body: filas,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.4, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.15 },
        headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
            0: { cellWidth: 14, halign: 'center' },
            1: { cellWidth: 100 },
            2: { cellWidth: 17, halign: 'center' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
        },
        didDrawPage: data => {
            const alto = doc.internal.pageSize.getHeight();
            doc.setFontSize(7).setTextColor(100);
            doc.text(`Cotizacion ${texto(cotizacion.numero_cotizacion)} - Pagina ${data.pageNumber}`, 14, alto - 9);
            doc.text('SAIRCOM - Air and Energy Equipment', pageWidth - 14, alto - 9, { align: 'right' });
        }
    });

    let finalY = doc.lastAutoTable.finalY + 7;
    if (finalY > 235) { doc.addPage(); finalY = 20; }
    const cajaX = 126;
    doc.setFontSize(8.5);
    [['SUBTOTAL', subtotal], ['IGV 18%', igv], ['TOTAL', total]].forEach(([etiqueta, valor], indice) => {
        const yy = finalY + indice * 7;
        doc.setFillColor(...(indice === 2 ? AZUL : [241, 245, 249]));
        doc.rect(cajaX, yy, 70, 7, 'F');
        doc.setTextColor(...(indice === 2 ? [255, 255, 255] : GRIS));
        doc.setFont('helvetica', indice === 2 ? 'bold' : 'normal');
        doc.text(etiqueta, cajaX + 3, yy + 4.7);
        doc.text(moneda(valor), cajaX + 67, yy + 4.7, { align: 'right' });
    });

    doc.setFont('helvetica', 'bold').setTextColor(...AZUL).setFontSize(8);
    doc.text('CONDICIONES COMERCIALES', 14, finalY + 4);
    doc.setFont('helvetica', 'normal').setTextColor(...GRIS);
    doc.text([
        `Forma de pago: ${texto(cotizacion.tipo_pago).toUpperCase()}`,
        'Tiempo de atencion: Previa programacion.',
        'Validez de oferta: 15 dias.',
        'Los precios estan expresados en dolares estadounidenses (USD).'
    ], 14, finalY + 10, { lineHeightFactor: 1.45 });
    if (cotizacion.nota) {
        doc.setFont('helvetica', 'bold').setTextColor(...AZUL).text('NOTA:', 14, finalY + 31);
        doc.setFont('helvetica', 'normal').setTextColor(...GRIS);
        doc.text(doc.splitTextToSize(cotizacion.nota, 105), 14, finalY + 36);
    }

    return doc;
};

const CotizacionPDF = ({ cotizacion }) => {
    const imprimir = async () => {
        const doc = await generarCotizacion(cotizacion);
        doc.autoPrint();
        const url = doc.output('bloburl');
        const ventana = window.open(url, '_blank', 'noopener,noreferrer');
        if (!ventana) doc.save(`${cotizacion.numero_cotizacion || 'cotizacion'}.pdf`);
    };

    return (
        <button type="button" onClick={imprimir} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Printer className="h-4 w-4" /> Imprimir cotización
        </button>
    );
};

export { generarCotizacion };
export default CotizacionPDF;
