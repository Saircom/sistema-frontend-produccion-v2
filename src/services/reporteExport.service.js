import Swal from 'sweetalert2';
import { ApiWebURL } from '../utils/index';

/**
 * Servicio para descargar el reporte consolidado de servicios
 * con los 19 campos solicitados.
 */
export const descargarReporteServiciosCSV = async ({ fechaDesde = '', fechaHasta = '' } = {}) => {
    try {
        const token = localStorage.getItem('token') || '';
        const params = new URLSearchParams();
        if (fechaDesde) params.append('fechaDesde', fechaDesde);
        if (fechaHasta) params.append('fechaHasta', fechaHasta);
        const queryStr = params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(`${ApiWebURL}/informe-tecnico/reporte-servicios-export${queryStr}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const json = await response.json();
        const data = json.data || [];

        if (!data || data.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: fechaDesde || fechaHasta
                    ? `No se encontraron servicios registrados en el rango ${fechaDesde || 'inicio'} al ${fechaHasta || 'hoy'}.`
                    : 'No se encontraron servicios registrados para exportar.'
            });
            return false;
        }

        // Columnas completas con Técnico Líder, Apoyo y Conteo de Servicios
        const headers = [
            'OT',
            'F. PROGRAMADA',
            'TALLER/CAMPO',
            'H. PROGRAMADA',
            'CLIENTE',
            'CENTRO DE COSTO',
            'EQUIPO',
            'MARCA',
            'MODELO',
            'POTENCIA',
            'CANTIDAD SERVICIOS',
            'SERVICIO',
            'TIPO DE SERVICIO',
            'ENCARGADO/A',
            'ZONA',
            'TECNICO LIDER',
            'TECNICOS DE APOYO',
            'TECNICO ASIGNADO',
            'HORA DE LLEGADA AL CLIENTE',
            'HORA DE INICIO DE SERVICIO',
            'HORA DE CULMINACION DE SERVICIO',
            'HORA DE SERVIVIO COMPLETADO'
        ];

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = data.map((item) => [
            escapeCSV(item.ot),
            escapeCSV(item.fecha_programada),
            escapeCSV(item.taller_campo),
            escapeCSV(item.hora_programada),
            escapeCSV(item.cliente),
            escapeCSV(item.centro_costo),
            escapeCSV(item.equipo),
            escapeCSV(item.marca),
            escapeCSV(item.modelo),
            escapeCSV(item.potencia),
            escapeCSV(item.total_servicios_equipo || 1),
            escapeCSV(item.servicio),
            escapeCSV(item.tipo_de_servicio),
            escapeCSV(item.encargado),
            escapeCSV(item.zona),
            escapeCSV(item.tecnico_lider || item.tecnico_asignado),
            escapeCSV(item.tecnicos_apoyo || 'Sin apoyo'),
            escapeCSV(item.tecnico_asignado),
            escapeCSV(item.hora_llegada_cliente),
            escapeCSV(item.hora_inicio_servicio),
            escapeCSV(item.hora_culminacion_servicio),
            escapeCSV(item.hora_servicio_completado)
        ].join(','));

        const csvContent = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const fechaActual = new Date().toISOString().slice(0, 10);
        const nombreArchivo = (fechaDesde || fechaHasta)
            ? `Reporte_Servicios_${fechaDesde || 'inicio'}_al_${fechaHasta || fechaActual}.csv`
            : `Reporte_Servicios_${fechaActual}.csv`;
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'Reporte descargado',
            text: `Se descargaron exitosamente ${data.length} registros.`,
            timer: 2500,
            showConfirmButton: false
        });
        return true;
    } catch (error) {
        console.error('Error al exportar reporte de servicios:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al descargar',
            text: error.message || 'No se pudo generar el reporte de servicios.'
        });
        return false;
    }
};
