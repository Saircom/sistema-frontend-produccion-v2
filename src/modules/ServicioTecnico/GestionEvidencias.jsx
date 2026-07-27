import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { imageService } from "../services/image.service";
import EvidenciasGaleria from "./components/EvidenciasGaleria";
import SubirFotos from "./SubirFotos";
import SkeletonEvidencias from "./image/SkeletonEvidencias";

const GestionEvidencias = () => {
    const { id_servicio } = useParams();
    const [imagenes, setImagenes] = useState([]);
    const [versionCache, setVersionCache] = useState(Date.now());
    const [cargando, setCargando] = useState(true);
    const [modoGestion, setModoGestion] = useState(false);

    // Función para obtener los datos siempre actualizados
    const cargarImagenes = async () => {
        try {
            const respuesta = await imageService.getImagesByService(id_servicio);
            const lista = Array.isArray(respuesta) ? respuesta : (respuesta?.imagenes_servicio || []);
            setImagenes(lista);
        } catch (error) {
            console.error("Error al cargar:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (id_servicio) cargarImagenes();
    }, [id_servicio]);

    // ESTO ES LO QUE SOLUCIONA EL PROBLEMA:
    // Al abrir el modal, forzamos una recarga fresca de datos desde la API
    const abrirModal = async () => {
        setCargando(true);
        await cargarImagenes(); 
        setModoGestion(true);
    };

    if (cargando && !modoGestion) return <SkeletonEvidencias />;

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            {!modoGestion ? (
                <EvidenciasGaleria
                    imagenes={imagenes}
                    versionCache={versionCache}
                    onOpenGallery={abrirModal} // Usamos la nueva función
                />
            ) : (
                <div className="space-y-4">
                    <button
                        onClick={() => {
                            setModoGestion(false);
                            cargarImagenes(); // Refrescar al cerrar
                        }}
                        className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-4 py-2 rounded-xl text-xs font-black uppercase transition mb-2"
                    >
                        ← Volver a la Galería
                    </button>
                    
                    {/* Aquí pasamos los datos que ya cargamos */}
                    <SubirFotos
                        imagenesIniciales={imagenes}
                        versionCacheInicial={versionCache}
                        onImagenesChange={(nuevas) => {
                            setImagenes(nuevas);
                            setVersionCache(Date.now());
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default GestionEvidencias;