import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileDown, FilterX, Loader2, RefreshCw, WalletCards } from 'lucide-react';
import { viaticosService } from '../../services/viaticos.service.js';
import { exportarPdfViaticos } from '../../utils/viaticosPdf.js';

const inicial = { desde: '', hasta: '', ot: '', cliente: '', categoria: '', estado: '' };
const moneda = valor => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(valor || 0));
const fechaLima = valor => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(valor));

const ViaticosAdmin = () => {
    const [gastos, setGastos] = useState([]);
    const [filtros, setFiltros] = useState(inicial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargar = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await viaticosService.listarAdmin();
            setGastos(Array.isArray(data?.gastos) ? data.gastos : []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudieron cargar los viáticos');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const categorias = useMemo(() => [...new Set(gastos.map(g => g.nombre_categoria).filter(Boolean))].sort(), [gastos]);
    const filtrados = useMemo(() => gastos.filter(gasto => {
        const fecha = fechaLima(gasto.fecha_gasto);
        return (!filtros.desde || fecha >= filtros.desde)
            && (!filtros.hasta || fecha <= filtros.hasta)
            && (!filtros.ot || String(gasto.id_ot).includes(filtros.ot.trim()))
            && (!filtros.cliente || String(gasto.razon_social || '').toLowerCase().includes(filtros.cliente.trim().toLowerCase()))
            && (!filtros.categoria || gasto.nombre_categoria === filtros.categoria)
            && (!filtros.estado || gasto.estado === filtros.estado);
    }), [gastos, filtros]);
    const total = filtrados.reduce((suma, gasto) => suma + Number(gasto.monto || 0), 0);

    if (loading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-blue-600" /></div>;

    return <section className="space-y-6 p-4 sm:p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase text-blue-600">Administración</p><h1 className="text-2xl font-bold text-slate-900">Todos los viáticos</h1><p className="text-sm text-slate-500">Control de gastos por OT, cliente y técnico líder.</p></div><div className="flex flex-wrap gap-2"><button onClick={cargar} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Actualizar</button><button onClick={() => exportarPdfViaticos(filtrados, filtros)} disabled={!filtrados.length} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><FileDown className="h-4 w-4" />Exportar PDF</button></div></header>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><label className="text-sm font-medium">Desde<input type="date" value={filtros.desde} onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="text-sm font-medium">Hasta<input type="date" min={filtros.desde || undefined} value={filtros.hasta} onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="text-sm font-medium">N.° OT<input value={filtros.ot} onChange={e => setFiltros(f => ({ ...f, ot: e.target.value }))} placeholder="Ej. 14" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="text-sm font-medium">Cliente<input value={filtros.cliente} onChange={e => setFiltros(f => ({ ...f, cliente: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="text-sm font-medium">Categoría<select value={filtros.categoria} onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Todas</option>{categorias.map(c => <option key={c}>{c}</option>)}</select></label><label className="text-sm font-medium">Estado<select value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Todos</option>{['registrado', 'validado', 'rechazado', 'pagado'].map(e => <option key={e}>{e}</option>)}</select></label></div><button onClick={() => setFiltros(inicial)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><FilterX className="h-4 w-4" />Limpiar filtros</button></div>
        <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border border-blue-200 bg-blue-50 p-5"><WalletCards className="h-6 w-6 text-blue-700" /><p className="mt-2 text-sm text-blue-700">Registros filtrados</p><p className="text-3xl font-bold text-blue-900">{filtrados.length}</p></article><article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm text-emerald-700">Importe total filtrado</p><p className="text-3xl font-bold text-emerald-800">{moneda(total)}</p></article></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table><thead><tr><th>Fecha</th><th>OT</th><th>Cliente</th><th>Técnico líder</th><th>Categoría</th><th>Subcategoría</th><th>Estado</th><th className="text-right">Importe</th></tr></thead><tbody>{filtrados.length === 0 ? <tr><td colSpan={8} className="py-12 text-center text-slate-500">No hay viáticos para los filtros seleccionados.</td></tr> : filtrados.map(g => <tr key={g.id_viatico}><td>{new Date(g.fecha_gasto).toLocaleString('es-PE')}</td><td className="font-semibold">OT-{g.id_ot}</td><td>{g.razon_social}</td><td>{g.tecnico_lider}</td><td>{g.nombre_categoria}</td><td>{g.nombre_subcategoria}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{g.estado}</span></td><td className="text-right font-bold">{moneda(g.monto)}</td></tr>)}</tbody></table></div></div>
    </section>;
};

export default ViaticosAdmin;
