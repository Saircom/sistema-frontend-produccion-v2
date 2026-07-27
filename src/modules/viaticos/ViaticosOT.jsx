import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil, Plus, ReceiptText, Trash2, WalletCards, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { viaticosService } from '../../services/viaticos.service.js';
import EvidenciasFotoForm from '../tecnico/form/estacionario/EvidenciasFotoForm.jsx';

const inicial = {
    id_categoria: '', id_subcategoria: '', monto: '', descripcion: '',
    fecha_gasto: new Date().toISOString().slice(0, 16), comprobante_url: ''
};

const moneda = valor => new Intl.NumberFormat('es-PE', {
    style: 'currency', currency: 'PEN'
}).format(Number(valor || 0));

const SIGUIENTES_ESTADOS = {
    registrado: ['validado', 'rechazado'],
    validado: ['pagado'],
    rechazado: [],
    pagado: []
};

const ViaticosOT = () => {
    const { idOt } = useParams();
    const navigate = useNavigate();
    const [catalogos, setCatalogos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [form, setForm] = useState(inicial);
    const [editando, setEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [actualizandoEstado, setActualizandoEstado] = useState(null);
    const [error, setError] = useState('');

    const cargar = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [categorias, datos] = await Promise.all([
                viaticosService.catalogos(), viaticosService.listar(idOt)
            ]);
            setCatalogos(Array.isArray(categorias) ? categorias : []);
            setResumen(datos);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudieron cargar los gastos');
        } finally {
            setLoading(false);
        }
    }, [idOt]);

    useEffect(() => { cargar(); }, [cargar]);

    const subcategorias = useMemo(() =>
        catalogos.find(item => String(item.id_categoria) === String(form.id_categoria))?.subcategorias ?? [],
    [catalogos, form.id_categoria]);

    const cambiar = event => {
        const { name, value } = event.target;
        setForm(actual => ({
            ...actual, [name]: value,
            ...(name === 'id_categoria' ? { id_subcategoria: '' } : {})
        }));
    };

    const cancelar = () => { setEditando(null); setForm(inicial); };

    const editar = gasto => {
        setEditando(gasto.id_viatico);
        setForm({
            id_categoria: String(gasto.id_categoria),
            id_subcategoria: String(gasto.id_subcategoria),
            monto: String(gasto.monto),
            descripcion: gasto.descripcion || '',
            fecha_gasto: gasto.fecha_gasto ? new Date(gasto.fecha_gasto).toISOString().slice(0, 16) : inicial.fecha_gasto,
            comprobante_url: gasto.comprobante_url || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const guardar = async event => {
        event.preventDefault();

        try {
            setGuardando(true);
            setError('');
            const payload = {
                id_subcategoria: Number(form.id_subcategoria),
                monto: Number(form.monto),
                descripcion: form.descripcion,
                fecha_gasto: form.fecha_gasto,
                comprobante_url: form.comprobante_url
            };
            if (editando) await viaticosService.actualizar(editando, payload);
            else await viaticosService.crear(idOt, payload);
            await Swal.fire({ icon: 'success', title: editando ? 'Gasto actualizado' : 'Gasto registrado', timer: 1300, showConfirmButton: false });
            cancelar();
            await cargar();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudo guardar el gasto');
        } finally { setGuardando(false); }
    };

    const subirComprobante = async formData => {
        try {
            setSubiendoFoto(true);
            setError('');
            const imagen = await viaticosService.subirComprobante(idOt, formData);
            setForm(actual => ({ ...actual, comprobante_url: imagen.secure_url }));
            await Swal.fire({
                icon: 'success',
                title: 'Evidencia subida',
                text: 'La fotografía está lista. Ahora puede guardar el gasto.',
                confirmButtonColor: '#2563eb'
            });
            return imagen;
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message);
            throw err;
        } finally {
            setSubiendoFoto(false);
        }
    };

    const eliminar = async gasto => {
        const confirmacion = await Swal.fire({
            icon: 'warning', title: '¿Eliminar gasto?',
            text: `${gasto.nombre_categoria} · ${moneda(gasto.monto)}`,
            showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626'
        });
        if (!confirmacion.isConfirmed) return;
        try {
            await viaticosService.eliminar(gasto.id_viatico);
            await cargar();
            await Swal.fire({ icon: 'success', title: 'Gasto eliminado', timer: 1200, showConfirmButton: false });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudo eliminar el gasto');
        }
    };

    const cambiarEstado = async (gasto, estado) => {
        if (!estado || estado === gasto.estado) return;
        const confirmacion = await Swal.fire({
            icon: 'question',
            title: '¿Cambiar estado del gasto?',
            text: `Cambiará de “${gasto.estado}” a “${estado}” y no podrá retroceder.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2563eb'
        });
        if (!confirmacion.isConfirmed) return;
        try {
            setActualizandoEstado(gasto.id_viatico);
            setError('');
            await viaticosService.cambiarEstado(gasto.id_viatico, estado);
            await cargar();
            await Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1200, showConfirmButton: false });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'No se pudo actualizar el estado');
        } finally {
            setActualizandoEstado(null);
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-blue-600" /></div>;

    const gastos = Array.isArray(resumen?.gastos) ? resumen.gastos : [];
    const puedeEditar = Boolean(resumen?.esLider);

    return (
        <section className="space-y-6 p-4 sm:p-6">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Volver a la OT
            </button>

            <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-semibold uppercase text-blue-600">Viáticos de la OT</p><h1 className="text-2xl font-bold text-slate-900">OT N.° {idOt}</h1><p className="text-sm text-slate-500">{resumen?.orden?.razon_social}</p></div>
                <div className="rounded-xl bg-emerald-50 px-6 py-4 text-right"><p className="text-xs font-semibold uppercase text-emerald-700">Total gastado</p><p className="text-3xl font-bold text-emerald-700">{moneda(resumen?.total_gastado)}</p></div>
            </header>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {puedeEditar && (
                <form onSubmit={guardar} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Plus className="h-5 w-5 text-blue-600" />{editando ? 'Editar gasto' : 'Registrar gasto'}</h2>{editando && <button type="button" onClick={cancelar} aria-label="Cancelar edición"><X /></button>}</div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <label className="text-sm font-medium text-slate-700">Categoría<select name="id_categoria" value={form.id_categoria} onChange={cambiar} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"><option value="">Seleccione</option>{catalogos.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}</select></label>
                        <label className="text-sm font-medium text-slate-700">Subcategoría<select name="id_subcategoria" value={form.id_subcategoria} onChange={cambiar} required disabled={!form.id_categoria} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 disabled:bg-slate-100"><option value="">Seleccione</option>{subcategorias.map(s => <option key={s.id_subcategoria} value={s.id_subcategoria}>{s.nombre_subcategoria}</option>)}</select></label>
                        <label className="text-sm font-medium text-slate-700">Monto (S/)<input name="monto" type="number" min="0.01" step="0.01" value={form.monto} onChange={cambiar} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <label className="text-sm font-medium text-slate-700">Fecha y hora<input name="fecha_gasto" type="datetime-local" value={form.fecha_gasto} onChange={cambiar} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <label className="text-sm font-medium text-slate-700 xl:col-span-2">Descripción<input name="descripcion" value={form.descripcion} onChange={cambiar} maxLength={255} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <div className="space-y-3 md:col-span-2 xl:col-span-3">
                            <p className="text-sm font-medium text-slate-700">Evidencia fotográfica (opcional)</p>
                            {form.comprobante_url && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-emerald-700">✓ Evidencia subida a Cloudinary y lista para guardar</p>
                                    <div className="relative w-fit overflow-hidden rounded-xl border border-slate-200">
                                        <img src={form.comprobante_url} alt="Comprobante del gasto" className="h-48 w-72 object-cover" />
                                        <button type="button" onClick={() => setForm(actual => ({ ...actual, comprobante_url: '' }))} title="Quitar evidencia" className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white hover:bg-red-600"><X className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            )}
                            <EvidenciasFotoForm
                                idInforme={Number(idOt)}
                                cantidadRegistrada={0}
                                maxImagenes={1}
                                tituloObligatorio={false}
                                autoSubir
                                subiendo={subiendoFoto}
                                onSubir={subirComprobante}
                            />
                        </div>
                    </div>
                    <button disabled={guardando || subiendoFoto} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{guardando && <Loader2 className="h-4 w-4 animate-spin" />}{editando ? 'Actualizar gasto' : 'Agregar gasto'}</button>
                </form>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Subcategoría</th><th>Descripción</th><th>Evidencia</th><th>Estado</th><th className="text-right">Monto</th><th>Acciones</th></tr></thead><tbody>{gastos.length === 0 ? <tr><td colSpan={8} className="py-10 text-center text-slate-500"><ReceiptText className="mx-auto mb-2 h-8 w-8" />No hay gastos registrados.</td></tr> : gastos.map(g => <tr key={g.id_viatico}><td>{new Date(g.fecha_gasto).toLocaleString('es-PE')}</td><td>{g.nombre_categoria}</td><td>{g.nombre_subcategoria}</td><td>{g.descripcion || '—'}</td><td>{g.comprobante_url ? <a href={g.comprobante_url} target="_blank" rel="noreferrer" title="Ver evidencia"><img src={g.comprobante_url} alt="Evidencia del gasto" className="h-12 w-16 rounded-lg object-cover" /></a> : <span className="text-xs text-red-600">Sin evidencia</span>}</td><td>{resumen?.puedeCambiarEstado && SIGUIENTES_ESTADOS[g.estado]?.length ? <select value={g.estado} disabled={actualizandoEstado === g.id_viatico} onChange={event => cambiarEstado(g, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold capitalize disabled:opacity-60"><option value={g.estado}>{g.estado}</option>{SIGUIENTES_ESTADOS[g.estado].map(estado => <option key={estado} value={estado}>{estado}</option>)}</select> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{g.estado}</span>}</td><td className="text-right font-bold">{moneda(g.monto)}</td><td>{puedeEditar && ['registrado', 'rechazado'].includes(g.estado) && <div className="flex gap-2"><button onClick={() => editar(g)} title="Editar" className="rounded-lg bg-blue-50 p-2 text-blue-700"><Pencil className="h-4 w-4" /></button><button onClick={() => eliminar(g)} title="Eliminar" className="rounded-lg bg-red-50 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button></div>}</td></tr>)}</tbody></table></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500"><WalletCards className="h-4 w-4" />{gastos.length} gasto(s) registrado(s)</div>
        </section>
    );
};

export default ViaticosOT;
