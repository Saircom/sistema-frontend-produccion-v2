// src/modules/Tecnico/form/estacionario/EvidenciasFotoForm.jsx

import { useEffect, useRef, useState } from 'react';
import {
    ImagePlus,
    Loader2,
    Trash2,
    Upload,
    X
} from 'lucide-react';

const TIPOS_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

const MAX_ARCHIVO = 10 * 1024 * 1024;
const MAX_IMAGENES = 20;

const generarIdTemporal = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatoMB = bytes =>
    `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const obtenerMensajeError = error =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'No se pudieron subir las imágenes';

const comprimirImagen = (
    archivo,
    maxWidth = 1600,
    maxHeight = 1600,
    calidad = 0.78
) =>
    new Promise((resolve, reject) => {
        const imagen = new Image();
        const url = URL.createObjectURL(archivo);

        const liberarUrl = () => {
            URL.revokeObjectURL(url);
        };

        imagen.onload = () => {
            const escala = Math.min(
                maxWidth / imagen.width,
                maxHeight / imagen.height,
                1
            );

            const canvas = document.createElement('canvas');

            canvas.width = Math.round(
                imagen.width * escala
            );

            canvas.height = Math.round(
                imagen.height * escala
            );

            const contexto = canvas.getContext('2d');

            if (!contexto) {
                liberarUrl();
                reject(
                    new Error(
                        'No se pudo procesar la imagen'
                    )
                );
                return;
            }

            contexto.drawImage(
                imagen,
                0,
                0,
                canvas.width,
                canvas.height
            );

            canvas.toBlob(
                blob => {
                    liberarUrl();

                    if (!blob) {
                        reject(
                            new Error(
                                `No se pudo comprimir ${archivo.name}`
                            )
                        );
                        return;
                    }

                    const nombre = archivo.name.replace(
                        /\.[^/.]+$/,
                        ''
                    );

                    resolve(
                        new File(
                            [blob],
                            `${nombre}.webp`,
                            {
                                type: 'image/webp',
                                lastModified: Date.now()
                            }
                        )
                    );
                },
                'image/webp',
                calidad
            );
        };

        imagen.onerror = () => {
            liberarUrl();

            reject(
                new Error(
                    `No se pudo leer ${archivo.name}`
                )
            );
        };

        imagen.src = url;
    });

const crearItemImagen = async archivo => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        throw new Error(
            `${archivo.name}: formato no permitido`
        );
    }

    if (archivo.size > MAX_ARCHIVO) {
        throw new Error(
            `${archivo.name}: supera el límite de 10 MB`
        );
    }

    const comprimido = await comprimirImagen(archivo);

    return {
        idTemporal: generarIdTemporal(),
        archivo: comprimido,
        nombreOriginal: archivo.name,
        tamanoOriginal: archivo.size,
        preview: URL.createObjectURL(comprimido),
        titulo: ''
    };
};

const PreviewImagen = ({
    item,
    disabled,
    onEliminar,
    onTituloChange,
    mostrarTitulo = true
}) => (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative">
            <img
                src={item.preview}
                alt={item.titulo || item.nombreOriginal}
                className="h-44 w-full object-cover"
            />

            <button
                type="button"
                disabled={disabled}
                title="Quitar imagen"
                onClick={() =>
                    onEliminar(item.idTemporal)
                }
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <X className="h-4 w-4" />
            </button>
        </div>

        <div className="space-y-3 p-3">
            <div>
                <p
                    title={item.nombreOriginal}
                    className="truncate text-xs font-semibold text-slate-800"
                >
                    {item.nombreOriginal}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    Original:{' '}
                    {formatoMB(item.tamanoOriginal)}
                </p>

                <p className="text-xs font-medium text-green-600">
                    Comprimida:{' '}
                    {formatoMB(item.archivo.size)}
                </p>
            </div>

            {mostrarTitulo && <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">
                    Título
                </span>

                <input
                    type="text"
                    value={item.titulo}
                    disabled={disabled}
                    maxLength={255}
                    placeholder="Ej. Filtro de aceite"
                    onChange={event =>
                        onTituloChange(
                            item.idTemporal,
                            event.target.value
                        )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
            </label>}
        </div>
    </article>
);

export const EvidenciasFotoForm = ({
    idInforme,
    cantidadRegistrada = 0,
    maxImagenes = MAX_IMAGENES,
    tituloObligatorio = true,
    autoSubir = false,
    subiendo = false,
    onSubir,
    onCancelar
}) => {
    const inputRef = useRef(null);
    const archivosRef = useRef([]);

    const [archivos, setArchivos] = useState([]);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');

    const ocupado = subiendo || procesando;

    const total =
        cantidadRegistrada + archivos.length;

    const limiteAlcanzado =
        total >= maxImagenes;

    useEffect(() => {
        archivosRef.current = archivos;
    }, [archivos]);

    useEffect(
        () => () => {
            archivosRef.current.forEach(
                ({ preview }) => {
                    URL.revokeObjectURL(preview);
                }
            );
        },
        []
    );

    const actualizarArchivos = nuevos => {
        archivosRef.current = nuevos;
        setArchivos(nuevos);
    };

    const limpiar = () => {
        archivosRef.current.forEach(
            ({ preview }) => {
                URL.revokeObjectURL(preview);
            }
        );

        actualizarArchivos([]);
        setError('');

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const quitarArchivo = idTemporal => {
        const encontrado =
            archivosRef.current.find(
                item =>
                    item.idTemporal === idTemporal
            );

        if (encontrado?.preview) {
            URL.revokeObjectURL(
                encontrado.preview
            );
        }

        actualizarArchivos(
            archivosRef.current.filter(
                item =>
                    item.idTemporal !== idTemporal
            )
        );

        setError('');
    };

    const actualizarTitulo = (
        idTemporal,
        titulo
    ) => {
        actualizarArchivos(
            archivosRef.current.map(item =>
                item.idTemporal === idTemporal
                    ? {
                        ...item,
                        titulo
                    }
                    : item
            )
        );
    };

    const seleccionarArchivos = async event => {
        const seleccionados = Array.from(
            event.target.files || []
        );

        event.target.value = '';

        if (!seleccionados.length) {
            return;
        }

        const disponibles =
            maxImagenes - total;

        if (disponibles <= 0) {
            setError(
                `Solo se permiten ${maxImagenes} imágenes`
            );
            return;
        }

        const candidatos =
            seleccionados.slice(
                0,
                disponibles
            );

        setProcesando(true);
        setError('');

        try {
            const resultados =
                await Promise.allSettled(
                    candidatos.map(
                        crearItemImagen
                    )
                );

            const validos = resultados
                .filter(
                    resultado =>
                        resultado.status ===
                        'fulfilled'
                )
                .map(
                    resultado =>
                        resultado.value
                );

            const errores = resultados
                .filter(
                    resultado =>
                        resultado.status ===
                        'rejected'
                )
                .map(
                    resultado =>
                        resultado.reason?.message ||
                        'No se pudo procesar una imagen'
                );

            actualizarArchivos([
                ...archivosRef.current,
                ...validos
            ]);

            if (
                seleccionados.length >
                disponibles
            ) {
                errores.push(
                    `Solo se agregaron ${disponibles} imágenes porque el límite es ${maxImagenes}`
                );
            }

            setError(errores.join('. '));

            if (autoSubir && validos.length > 0) {
                const formData = new FormData();
                formData.append('id_informe', String(idInforme));

                validos.forEach(item => {
                    formData.append('imagenes', item.archivo, item.archivo.name);
                    formData.append('titulo', item.titulo.trim() || item.nombreOriginal);
                });

                try {
                    await onSubir(formData);
                } finally {
                    validos.forEach(item => URL.revokeObjectURL(item.preview));
                    actualizarArchivos([]);
                }
            }
        } catch (errorProcesamiento) {
            setError(
                obtenerMensajeError(
                    errorProcesamiento
                )
            );
        } finally {
            setProcesando(false);
        }
    };

    const guardar = async () => {
        const informeId = Number(idInforme);

        if (!Number.isInteger(informeId) || informeId <= 0) {
            return setError('Informe no válido');
        }

        if (!archivos.length) {
            return setError('Seleccione al menos una imagen');
        }

        if (tituloObligatorio && archivos.some(item => !item.titulo.trim())) {
            return setError('Ingrese un título para cada imagen');
        }

        const formData = new FormData();

        formData.append('id_informe', String(informeId));

        archivos.forEach((item, index) => {
            formData.append(
                'imagenes',
                item.archivo,
                item.archivo.name
            );

            formData.append(
                'titulo',
                item.titulo.trim() || item.nombreOriginal
            );

            console.log(`Imagen ${index + 1}`);
            console.log('Nombre:', item.archivo.name);
            console.log('Tipo:', item.archivo.type);
            console.log('Tamaño:', item.archivo.size);
            console.log('Título:', item.titulo);
        });

        console.log('===== FORMDATA =====');

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(key, {
                    nombre: value.name,
                    tipo: value.type,
                    tamaño: value.size
                });
            } else {
                console.log(key, value);
            }
        }

        try {
            setError('');

            const respuesta = await onSubir(formData);

            console.log('Respuesta servidor:', respuesta);

            limpiar();
        } catch (error) {
            console.error('===== ERROR AXIOS =====');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Headers:', error.response?.headers);
            console.error('Error completo:', error);

            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'No se pudieron subir las imágenes'
            );
        }
    };

    const cancelar = () => {
        limpiar();
        onCancelar?.();
    };

    return (
        <div className="space-y-5">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={TIPOS_PERMITIDOS.join(
                    ','
                )}
                multiple
                disabled={ocupado}
                onChange={
                    seleccionarArchivos
                }
                className="hidden"
            />

            <button
                type="button"
                disabled={
                    ocupado ||
                    limiteAlcanzado
                }
                onClick={() =>
                    inputRef.current?.click()
                }
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {procesando ? (
                    <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
                ) : (
                    <ImagePlus className="h-9 w-9 text-blue-600" />
                )}

                <span className="mt-2 font-semibold text-slate-800">
                    {procesando
                        ? 'Comprimiendo imágenes...'
                        : limiteAlcanzado
                            ? 'Límite de imágenes alcanzado'
                            : 'Seleccionar fotografías'}
                </span>

                <span className="mt-1 text-sm text-slate-500">
                    JPG, PNG o WEBP.
                    Máximo 10 MB por archivo.
                </span>

                <span className="mt-2 text-xs text-slate-400">
                    {total} de {maxImagenes}
                </span>
            </button>

            {archivos.length > 0 && (
                <div className="grid max-h-[500px] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                    {archivos.map(item => (
                        <PreviewImagen
                            key={
                                item.idTemporal
                            }
                            item={item}
                            disabled={ocupado}
                            onEliminar={
                                quitarArchivo
                            }
                            onTituloChange={
                                actualizarTitulo
                            }
                            mostrarTitulo={tituloObligatorio}
                        />
                    ))}
                </div>
            )}

            {!autoSubir && <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={cancelar}
                    disabled={ocupado}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </button>

                {archivos.length > 0 && (
                    <button
                        type="button"
                        onClick={limpiar}
                        disabled={ocupado}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Limpiar
                    </button>
                )}

                <button
                    type="button"
                    onClick={guardar}
                    disabled={
                        ocupado ||
                        !archivos.length
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {subiendo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}

                    {subiendo
                        ? 'Subiendo...'
                        : `Subir ${archivos.length} imagen${archivos.length === 1
                            ? ''
                            : 'es'
                        }`}
                </button>
            </div>}
        </div>
    );
};

export default EvidenciasFotoForm;
