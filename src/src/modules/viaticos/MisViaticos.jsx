import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, RefreshCw, WalletCards, XCircle } from 'lucide-react';
import { viaticosService } from '../../services/viaticos.service.js';

const moneda = valor => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(valor || 0));
const clasesEstado = {
    registrado: 'border-blue-200 bg-blue-50 text-blue-700',
    validado: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rechazado: 'border-red-200 bg-red-50 text-red-700'
};

const MisViaticos = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargar = useCallback(async () => {
        try {
            setLoading(true); setError('');
            setData(await viaticosService.misPendientes());
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudieron cargar sus viáticos');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);
    if (loading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-blue-600" /></div>;
    const gastos = Array.isArray(data?.gastos) ? data.gastos : [];

    return <section className="space-y-6 p-4 sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase text-blue-600">Cuenta del técnico</p><h1 className="text-2xl font-bold text-slate-900">Mis viáticos pendientes</h1><p className="text-sm text-slate-500">Los gastos pagados desaparecen automáticamente.</p></div><button onClick={cargar} className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Actualizar</button></header>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><WalletCards className="h-6 w-6 text-emerald-700" /><p className="mt-3 text-sm font-semibold text-emerald-700">Total por pagar</p><p className="text-3xl font-bold text-emerald-800">{moneda(data?.total_por_pagar)}</p></article>
            <article className="rounded-xl border border-blue-200 bg-blue-50 p-5"><Clock3 className="h-6 w-6 text-blue-700" /><p className="mt-3 text-sm text-blue-700">En revisión</p><p className="text-3xl font-bold">{data?.registrados ?? 0}</p></article>
            <article className="rounded-xl border border-emerald-200 bg-white p-5"><CheckCircle2 className="h-6 w-6 text-emerald-700" /><p className="mt-3 text-sm text-slate-600">Validados por pagar</p><p className="text-3xl font-bold">{data?.validados ?? 0}</p></article>
            <article className="rounded-xl border border-red-200 bg-white p-5"><XCircle className="h-6 w-6 text-red-700" /><p className="mt-3 text-sm text-slate-600">Rechazados</p><p className="text-3xl font-bold">{data?.rechazados ?? 0}</p></article>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table><thead><tr><th>OT</th><th>Cliente</th><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Evidencia</th><th>Estado</th><th className="text-right">Monto</th></tr></thead><tbody>{gastos.length === 0 ? <tr><td colSpan={8} className="py-12 text-center text-slate-500"><CheckCircle2 className="mx-auto mb-2 h-9 w-9 text-emerald-500" />No tiene viáticos pendientes.</td></tr> : gastos.map(g => <tr key={g.id_viatico}><td className="font-semibold">OT-{g.id_ot}</td><td>{g.razon_social}</td><td>{new Date(g.fecha_gasto).toLocaleString('es-PE')}</td><td>{g.nombre_categoria} · {g.nombre_subcategoria}</td><td>{g.descripcion || '—'}</td><td>{g.comprobante_url ? <a href={g.comprobante_url} target="_blank" rel="noreferrer"><img src={g.comprobante_url} alt="Evidencia" className="h-12 w-16 rounded-lg object-cover" /></a> : '—'}</td><td><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${clasesEstado[g.estado] || ''}`}>{g.estado}</span></td><td className="text-right font-bold">{moneda(g.monto)}</td></tr>)}</tbody></table></div></div>
    </section>;
};

export default MisViaticos;
