import React from "react";
import { Maximize2, RotateCw, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { ApiWebURL } from "../../../utils";

const ItemImagen = ({ img, versionCache, enModoGestion, onMaximize, onDelete, onRotate, onReplace, onEditTitle }) => {
    // 🔍 Asegúrate de que las llaves correspondan exactamente a lo que responde tu base de datos
    const { id_imagen, url_imagen, titulo } = img;

    // 🌟 CORRECCIÓN CRÍTICA: Controlar de forma segura la URL para evitar romper los objetos blob locales
    const obtenerUrlImagen = () => {
        if (!url_imagen) return "https://placehold.co/600x600/e2e8f0/94a3b8?text=Sin+Imagen";
        
        // Si la url ya es un blob local (de la cola de subida), se usa directo sin agregar queries de caché
        if (url_imagen.startsWith("blob:")) {
            return url_imagen;
        }

        // Si la ruta es relativa en el servidor, la prefijamos con la URL del API
        if (url_imagen.startsWith("/uploads/")) {
            return `${ApiWebURL}${url_imagen}${versionCache ? `?t=${versionCache}` : ''}`;
        }

        // Si es una URL externa de Cloudinary y existe la versión de caché, se añade el query string
        if (versionCache) {
            return `${url_imagen}?t=${versionCache}`;
        }

        return url_imagen;
    };

    return (
        <div className="group bg-white rounded-3xl p-3 border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group">
                <img
                    src={obtenerUrlImagen()}
                    alt={titulo || "Evidencia técnica"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x600/e2e8f0/94a3b8?text=Error+al+cargar";
                    }}
                />

                {enModoGestion && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
                        <button
                            onClick={onMaximize}
                            className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl transition shadow-md hover:scale-110 duration-200"
                            title="Ampliar Imagen"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={onEditTitle}
                            className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl transition shadow-md hover:scale-110 duration-200"
                            title="Editar título"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={onRotate}
                            className="p-2.5 bg-white/90 hover:bg-white text-amber-600 rounded-xl transition shadow-md hover:scale-110 duration-200"
                            title="Rotar 90°"
                        >
                            <RotateCw size={16} />
                        </button>
                        <label 
                            className="p-2.5 bg-white/90 hover:bg-white text-blue-600 rounded-xl transition shadow-md cursor-pointer hover:scale-110 duration-200" 
                            title="Reemplazar archivo"
                        >
                            <RefreshCw size={16} />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) onReplace(e.target.files[0]);
                                }}
                            />
                        </label>
                        <button
                            onClick={onDelete}
                            className="p-2.5 bg-white/90 hover:bg-white text-red-600 rounded-xl transition shadow-md hover:scale-110 duration-200"
                            title="Eliminar permanentemente"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-3 px-1 pt-1">
                <p className="text-xs font-bold text-slate-700 truncate uppercase tracking-tight">
                    {titulo || "Sin título asignado"}
                </p>
            </div>
        </div>
    );
};

export default ItemImagen;