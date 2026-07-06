import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { imageService } from '../../services/image.service';
import { Camera, UploadCloud, CheckCircle } from "lucide-react";
import ItemImagen from "./image/ItemImagen";
import ImageLightbox from "./image/ImageLightbox";

const SubirFotos = ({ id_servicio: propIdServicio, imagenesIniciales = [], imagenesActuales = [], versionCacheInicial, versionCache, onUploadSuccess }) => {
    const params = useParams();
    const id_servicio = propIdServicio || params.id_servicio;

    const [imagenes, setImagenes] = useState(imagenesActuales || []);
    const [colaSubida, setColaSubida] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [lightbox, setLightbox] = useState({ isOpen: false, url: "", titulo: "" });

    // Sincronizar estado si las props cambian desde el componente padre
    useEffect(() => {
        if (imagenesActuales && imagenesActuales.length > 0) {
            setImagenes(imagenesActuales);
        }
    }, [imagenesActuales]);

    const obtenerImagenesActualizadas = async () => {
        try {
            const respuesta = await imageService.getImagesByService(id_servicio);
            const listaImagenes = Array.isArray(respuesta)
                ? respuesta
                : (respuesta?.data?.imagenes_servicio || respuesta?.imagenes_servicio || []);
            
            setImagenes(listaImagenes);
            return listaImagenes;
        } catch (error) {
            console.error("Error al refrescar imágenes:", error);
            return [];
        }
    };

    // Función centralizada para refrescar datos y notificar al padre
    const triggerRefresh = async () => {
        const nuevasImagenes = await obtenerImagenesActualizadas();
        if (typeof onUploadSuccess === "function") {
            onUploadSuccess(nuevasImagenes);
        }
    };

    const agregarAFila = (e) => {
        const archivos = Array.from(e.target.files);
        const nuevas = archivos.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            titulo: ""
        }));
        setColaSubida([...colaSubida, ...nuevas]);
        e.target.value = "";
    };

    const actualizarTituloCola = (index, valor) => {
        const copia = [...colaSubida];
        copia[index].titulo = valor;
        setColaSubida(copia);
    };

    const eliminarDeCola = (index) => {
        const copia = [...colaSubida];
        URL.revokeObjectURL(copia[index].preview);
        copia.splice(index, 1);
        setColaSubida(copia);
    };

    const subirTodo = async () => {
        if (colaSubida.some(f => !f.titulo.trim())) {
            return Swal.fire("Atención", "Todas las fotos nuevas deben tener un título.", "warning");
        }

        setIsUploading(true);
        Swal.fire({ title: "Subiendo...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            for (const foto of colaSubida) {
                const formData = new FormData();
                formData.append("image", foto.file);
                formData.append("titulo", foto.titulo.trim());
                await imageService.uploadImage(id_servicio, formData);
            }
            Swal.fire("¡Éxito!", "Imágenes subidas correctamente.", "success");
            colaSubida.forEach(item => URL.revokeObjectURL(item.preview));
            setColaSubida([]);
            await triggerRefresh();
        } catch (error) {
            Swal.fire("Error", "No se pudieron subir los archivos.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id_imagen) => {
        const result = await Swal.fire({ title: "¿Eliminar?", icon: "warning", showCancelButton: true });
        if (!result.isConfirmed) return;
        try {
            await imageService.deleteImage(id_imagen);
            await triggerRefresh();
        } catch (error) { Swal.fire("Error", "No se pudo eliminar.", "error"); }
    };

    const rotarImagen = async (id_imagen) => {
        try {
            Swal.fire({ title: 'Rotando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            await imageService.rotarImage(id_imagen);
            Swal.close();
            await triggerRefresh();
        } catch (err) {
            Swal.fire('Error', 'No se pudo rotar la imagen.', 'error');
        }
    };

    const reemplazarImagen = async (id_imagen, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            Swal.fire({ title: 'Reemplazando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            await imageService.replaceImage(id_imagen, formData);
            Swal.close();
            await triggerRefresh();
        } catch (err) {
            Swal.fire('Error', 'No se pudo reemplazar.', 'error');
        }
    };

    const editarTituloImagen = async (id_imagen, tituloActual) => {
        const { value: nuevoTitulo } = await Swal.fire({
            title: 'Editar título',
            input: 'text',
            inputValue: tituloActual || '',
            showCancelButton: true
        });

        if (nuevoTitulo === undefined) return;

        try {
            await imageService.updateTitulo(id_imagen, nuevoTitulo);
            await triggerRefresh();
        } catch (err) { Swal.fire("Error", "No se pudo actualizar.", "error"); }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-4 px-2 sm:px-4">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <Camera className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Galería de Evidencias</h2>
                        <p className="text-slate-500 text-sm font-medium">Servicio #{id_servicio}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <UploadCloud className="text-blue-500" /> Preparar nuevas fotos
                        </h3>
                        <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition">
                            + Seleccionar Fotos
                            <input type="file" multiple className="hidden" onChange={agregarAFila} accept="image/*" />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colaSubida.map((item, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border">
                                <img src={item.preview} className="w-20 h-20 rounded-xl object-cover" alt="prev" />
                                <div className="flex-1 space-y-2">
                                    <input className="w-full bg-white border rounded-xl px-3 py-2 text-sm" placeholder="Título..." value={item.titulo} onChange={(e) => actualizarTituloCola(index, e.target.value)} />
                                    <button onClick={() => eliminarDeCola(index)} className="text-red-500 text-[10px] font-bold uppercase">Quitar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {colaSubida.length > 0 && (
                        <button onClick={subirTodo} disabled={isUploading} className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-blue-700 transition">
                            Confirmar Subida ({colaSubida.length})
                        </button>
                    )}
                </div>

                <div className="mt-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Evidencias Guardadas</h3>
                            <p className="text-sm text-slate-500">{imagenes.length} imágenes</p>
                        </div>
                        <div className="p-5">
                            {imagenes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                                    {imagenes.map((img) => (
                                        <ItemImagen
                                            key={img.id_imagen}
                                            img={img}
                                            versionCache={versionCache || versionCacheInicial}
                                            enModoGestion={true}
                                            onMaximize={() => setLightbox({ isOpen: true, url: img.url_imagen, titulo: img.titulo })}
                                            onDelete={() => handleDelete(img.id_imagen)}
                                            onRotate={() => rotarImagen(img.id_imagen)}
                                            onReplace={(file) => reemplazarImagen(img.id_imagen, file)}
                                            onEditTitle={() => editarTituloImagen(img.id_imagen, img.titulo)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-slate-400">No hay evidencias subidas.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ImageLightbox
                isOpen={lightbox.isOpen}
                url={lightbox.url}
                titulo={lightbox.titulo}
                versionCache={versionCacheInicial}
                onClose={() => setLightbox({ isOpen: false, url: "", titulo: "" })}
            />
        </div>
    );
};

export default SubirFotos;