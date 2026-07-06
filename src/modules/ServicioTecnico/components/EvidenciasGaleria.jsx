import React, { useState } from "react";
import { Image as ImageIcon, LayoutGrid, Eye } from "lucide-react";
import ItemImagen from "../image/ItemImagen";
import ImageLightbox from "../image/ImageLightbox";

const EvidenciasGaleria = ({ imagenes = [], versionCache, onOpenGallery }) => {
    const [lightbox, setLightbox] = useState({ isOpen: false, url: "", titulo: "" });

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <LayoutGrid size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Evidencias Fotograficas</h3>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{imagenes.length} archivos guardados</p>
                    </div>
                </div>

                <button
                    onClick={onOpenGallery}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                    <Eye size={14} /> Gestionar Fotos
                </button>
            </div>

            {imagenes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {imagenes.map((img) => (
                        <div 
                            key={img.id_imagen} 
                            onClick={() => setLightbox({ isOpen: true, url: img.url_imagen, titulo: img.titulo })}
                            className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                            title="Clic para ampliar"
                        >
                            <ItemImagen
                                img={img}
                                versionCache={versionCache}
                                enModoGestion={false}
                                acciones={{
                                    onMaximize: () => setLightbox({ isOpen: true, url: img.url_imagen, titulo: img.titulo })
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
                    <ImageIcon className="mx-auto text-slate-300 mb-3" size={44} />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">No se han registrado evidencias para este servicio</p>
                </div>
            )}

            <ImageLightbox
                isOpen={lightbox.isOpen}
                url={lightbox.url}
                titulo={lightbox.titulo}
                versionCache={versionCache}
                onClose={() => setLightbox({ isOpen: false, url: "", titulo: "" })}
            />
        </div>
    );
};

export default EvidenciasGaleria;