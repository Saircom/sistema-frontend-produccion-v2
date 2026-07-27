// src/modules/Tecnico/components/EvidenciasGaleria.jsx
import {
    Camera,
    Check,
    ExternalLink,
    ImagePlus,
    Loader2,
    Pencil,
    RefreshCw,
    RotateCw,
    Trash2,
    Upload,
    X
} from 'lucide-react';

import {
    useEffect,
    useRef,
    useState
} from 'react';

const obtenerId = imagen => {
    return (
        imagen?.id_imagen ??
        imagen?.id_evidencia ??
        imagen?.id_imagen_informe ??
        imagen?.id ??
        null
    );
};

const obtenerUrl = imagen => {
    return (
        imagen?.secure_url ??
        imagen?.url_imagen ??
        imagen?.url_evidencia ??
        imagen?.url ??
        ''
    );
};

const obtenerTitulo = imagen => {
    return (
        imagen?.titulo ??
        imagen?.descripcion ??
        'Evidencia fotográfica'
    );
};

const EvidenciaCard = ({
    imagen,
    eliminando = false,
    actualizando = false,
    onEliminar,
    onActualizarTitulo,
    onReemplazar,
    onRotar
}) => {
    const id = obtenerId(imagen);
    const url = obtenerUrl(imagen);
    const tituloActual = obtenerTitulo(imagen);

    const inputArchivoRef = useRef(null);

    const [editandoTitulo, setEditandoTitulo] =
        useState(false);

    const [titulo, setTitulo] =
        useState(tituloActual);

    const [errorLocal, setErrorLocal] =
        useState('');

    useEffect(() => {
        setTitulo(tituloActual);
    }, [tituloActual]);

    const cancelarEdicion = () => {
        setTitulo(tituloActual);
        setErrorLocal('');
        setEditandoTitulo(false);
    };

    const guardarTitulo = async () => {
        const tituloLimpio = titulo.trim();

        if (!tituloLimpio) {
            setErrorLocal(
                'El título es obligatorio'
            );
            return;
        }

        if (
            tituloLimpio ===
            String(tituloActual).trim()
        ) {
            setEditandoTitulo(false);
            return;
        }

        try {
            setErrorLocal('');

            await onActualizarTitulo?.(
                id,
                tituloLimpio
            );

            setEditandoTitulo(false);
        } catch (error) {
            setErrorLocal(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo actualizar el título'
            );
        }
    };

    const abrirSelectorArchivo = () => {
        inputArchivoRef.current?.click();
    };

    const cambiarImagen = async event => {
        const archivo =
            event.target.files?.[0];

        if (!archivo) return;

        if (
            !archivo.type.startsWith(
                'image/'
            )
        ) {
            setErrorLocal(
                'Debe seleccionar una imagen válida'
            );

            event.target.value = '';
            return;
        }

        try {
            setErrorLocal('');

            await onReemplazar?.(
                id,
                archivo
            );
        } catch (error) {
            setErrorLocal(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo reemplazar la imagen'
            );
        } finally {
            event.target.value = '';
        }
    };

    const girarImagen = async () => {
        try {
            setErrorLocal('');

            await onRotar?.(
                id,
                90
            );
        } catch (error) {
            setErrorLocal(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo girar la imagen'
            );
        }
    };

    return (
        <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative">
                {url ? (
                    <img
                        src={url}
                        alt={tituloActual}
                        className="h-48 w-full object-cover"
                    />
                ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100">
                        <Camera className="h-9 w-9 text-slate-400" />
                    </div>
                )}

                {actualizando && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Actualizando...
                        </div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white"
                            title="Ver imagen"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={girarImagen}
                        disabled={
                            actualizando ||
                            eliminando
                        }
                        className="rounded-full bg-amber-500 p-2 text-white hover:bg-amber-600 disabled:opacity-50"
                        title="Girar 90 grados"
                    >
                        <RotateCw className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={
                            abrirSelectorArchivo
                        }
                        disabled={
                            actualizando ||
                            eliminando
                        }
                        className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        title="Reemplazar imagen"
                    >
                        <Upload className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onEliminar?.(
                                id,
                                imagen
                            )
                        }
                        disabled={
                            eliminando ||
                            actualizando
                        }
                        className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-50"
                        title="Eliminar"
                    >
                        {eliminando ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <input
                    ref={inputArchivoRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={cambiarImagen}
                    className="hidden"
                />
            </div>

            <div className="space-y-3 p-3">
                {editandoTitulo ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={titulo}
                            onChange={event => {
                                setTitulo(
                                    event.target.value
                                );
                                setErrorLocal('');
                            }}
                            disabled={actualizando}
                            maxLength={255}
                            autoFocus
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={
                                    cancelarEdicion
                                }
                                disabled={
                                    actualizando
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <X className="h-3.5 w-3.5" />
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={
                                    guardarTitulo
                                }
                                disabled={
                                    actualizando
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actualizando ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}

                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {tituloActual}
                            </p>

                            {imagen.descripcion && (
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                    {
                                        imagen.descripcion
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setEditandoTitulo(
                                    true
                                )
                            }
                            disabled={
                                actualizando ||
                                eliminando
                            }
                            className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            title="Editar título"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {errorLocal && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        {errorLocal}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    <button
                        type="button"
                        onClick={girarImagen}
                        disabled={
                            actualizando ||
                            eliminando
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Girar
                    </button>

                    <button
                        type="button"
                        onClick={
                            abrirSelectorArchivo
                        }
                        disabled={
                            actualizando ||
                            eliminando
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                        <Upload className="h-4 w-4" />
                        Reemplazar
                    </button>
                </div>
            </div>
        </article>
    );
};

export const EvidenciasGaleria = ({
    imagenes = [],
    eliminandoId = null,
    actualizandoId = null,
    onAgregar,
    onEliminar,
    onActualizarTitulo,
    onReemplazar,
    onRotar
}) => {
    const lista = Array.isArray(imagenes)
        ? imagenes
        : [];

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Evidencias fotográficas
                        </h2>

                        <p className="text-sm text-slate-500">
                            {lista.length}{' '}
                            imagen(es) registrada(s)
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAgregar}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    <ImagePlus className="h-4 w-4" />
                    Agregar imágenes
                </button>
            </header>

            <div className="p-5">
                {lista.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <Camera className="mx-auto h-9 w-9 text-slate-400" />

                        <p className="mt-3 text-sm text-slate-500">
                            No existen evidencias fotográficas registradas.
                        </p>

                        <button
                            type="button"
                            onClick={onAgregar}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                            <ImagePlus className="h-4 w-4" />
                            Subir primera imagen
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {lista.map(
                            (
                                imagen,
                                index
                            ) => {
                                const id =
                                    obtenerId(
                                        imagen
                                    ) ??
                                    index;

                                return (
                                    <EvidenciaCard
                                        key={id}
                                        imagen={imagen}
                                        eliminando={
                                            Number(
                                                eliminandoId
                                            ) ===
                                            Number(
                                                id
                                            )
                                        }
                                        actualizando={
                                            Number(
                                                actualizandoId
                                            ) ===
                                            Number(
                                                id
                                            )
                                        }
                                        onEliminar={
                                            onEliminar
                                        }
                                        onActualizarTitulo={
                                            onActualizarTitulo
                                        }
                                        onReemplazar={
                                            onReemplazar
                                        }
                                        onRotar={
                                            onRotar
                                        }
                                    />
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EvidenciasGaleria;