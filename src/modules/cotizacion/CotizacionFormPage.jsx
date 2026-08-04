import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CotizacionService from '../../services/cotizaciones.service.js';
import CotizacionForm from './CotizacionForm.jsx';

const obtenerCotizacion = respuesta => respuesta?.data?.data ?? respuesta?.data ?? respuesta ?? null;

const CotizacionFormPage = () => {
    const { idCotizacion } = useParams();
    const navigate = useNavigate();
    const esEdicion = Boolean(idCotizacion);
    const [cotizacion, setCotizacion] = useState(null);
    const [loading, setLoading] = useState(esEdicion);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!esEdicion) return;
        let activo = true;
        const cargar = async () => {
            try {
                setLoading(true);
                setError('');
                const data = obtenerCotizacion(await CotizacionService.getById(idCotizacion));
                if (!data?.id_cotizacion) throw new Error('La cotización solicitada no existe.');
                if (activo) setCotizacion(data);
            } catch (err) {
                if (activo) setError(err?.response?.data?.message || err?.message || 'No se pudo cargar la cotización.');
            } finally {
                if (activo) setLoading(false);
            }
        };
        cargar();
        return () => { activo = false; };
    }, [esEdicion, idCotizacion]);

    return (
        <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <button type="button" onClick={() => navigate('/postventa/cotizacion')} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
                    <ArrowLeft className="h-4 w-4" /> Volver a cotizaciones
                </button>
                <header className="mb-6 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-6 text-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-white/15 p-3"><FileText className="h-7 w-7" /></span>
                        <div><p className="text-sm font-medium text-blue-100">Gestión comercial</p><h1 className="text-2xl font-bold sm:text-3xl">{esEdicion ? `Editar cotización ${cotizacion?.numero_cotizacion ?? ''}` : 'Nueva cotización'}</h1></div>
                    </div>
                </header>
                {loading ? (
                    <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-white"><div className="text-center text-slate-500"><Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" /><p className="mt-3">Cargando cotización...</p></div></div>
                ) : error ? (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
                ) : (
                    <CotizacionForm initialData={cotizacion} onSaveSuccess={() => navigate('/postventa/cotizacion', { replace: true, state: { mensaje: esEdicion ? 'Cotización actualizada correctamente.' : 'Cotización creada correctamente.' } })} />
                )}
            </div>
        </div>
    );
};

export default CotizacionFormPage;
