import React from "react";
import { X } from "lucide-react";

const ImageLightbox = ({ isOpen, url, titulo, versionCache, onClose }) => {
    if (!isOpen || !url) return null;

    // 🌟 CORRECCIÓN CRÍTICA: Controlar de forma segura la URL para evitar romper los objetos blob locales
    const obtenerUrlLightbox = () => {
        // Si la url ya es un blob local de la cola de subida, se usa directo sin queries de caché
        if (url.startsWith("blob:")) {
            return url;
        }

        // Si es una URL externa y existe la versión de caché, se añade el query string
        if (versionCache) {
            return `${url}?t=${versionCache}`;
        }

        return url;
    };

    return (
        <div 
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Botón Cerrar */}
            <button 
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors outline-none z-10"
                onClick={onClose}
            >
                <X size={24} />
            </button>

            {/* Contenedor de Imagen */}
            <div 
                className="relative max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Previene que se cierre al hacer clic sobre la foto
            >
                <img 
                    src={obtenerUrlLightbox()} 
                    alt={titulo || "Evidencia ampliada"} 
                    className="max-w-full max-h-[80vh] object-contain select-none"
                />
            </div>

            {/* Título de la Foto */}
            {titulo && (
                <div className="mt-4 text-center max-w-2xl" onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-white font-bold text-lg uppercase tracking-wide">{titulo}</h4>
                </div>
            )}
        </div>
    );
};

export default ImageLightbox;