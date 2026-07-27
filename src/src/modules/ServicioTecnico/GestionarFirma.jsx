import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Save, ArrowLeft } from "lucide-react";
import { ApiWebURL } from "../../utils/index";

const GestionarFirma = () => {
    const { id_servicio } = useParams();
    const navigate = useNavigate();
    const sigCanvas = useRef(null);
    const [cargando, setCargando] = useState(false);
    const [encargado, setEncargado] = useState("");


    // Solución para el Warning de willReadFrequently
    useEffect(() => {
        const canvas = sigCanvas.current?.getCanvas();
        if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
        }
    }, []);

    const enviarFirma = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            return Swal.fire("Firma requerida", "El cliente debe firmar.", "warning");
        }
        if (!encargado.trim()) {
            return Swal.fire("Nombre requerido", "Ingrese el nombre del responsable.", "warning");
        }

        const token = localStorage.getItem("token");

        try {
            setCargando(true);
            const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
            const blob = await (await fetch(signatureImage)).blob();
            const firmaFile = new File([blob], `firma_${id_servicio}.png`, { type: "image/png" });

            const finalData = new FormData();
            finalData.append("firma", firmaFile);
            finalData.append("encargado", encargado);

            await axios.post(`${ApiWebURL}/servicio/${id_servicio}/firma`, finalData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            await Swal.fire("Éxito", "Firma guardada correctamente.", "success");
            navigate(-1); 
        } catch (err) {
            console.error("Error al subir firma:", err);
            Swal.fire("Error", "No se pudo conectar con el servidor. Verifica que el backend esté encendido.", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={20} /> Volver
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Responsable del Cliente</label>
                <input 
                    className="w-full px-4 py-3 mb-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Nombre completo" 
                    value={encargado} 
                    onChange={(e) => setEncargado(e.target.value)} 
                />

                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Firma Digital</label>
                <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden mb-6">
                    <SignatureCanvas 
                        ref={sigCanvas} 
                        penColor="black" 
                        canvasProps={{ 
                            className: "w-full h-64 cursor-crosshair"
                            // Ya no pasamos la prop aquí para evitar el warning de React
                        }} 
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={() => sigCanvas.current.clear()} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                        <Trash2 size={18} /> Limpiar
                    </button>
                    <button onClick={enviarFirma} disabled={cargando} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                        {cargando ? "Enviando..." : <><Save size={18} /> GUARDAR FIRMA</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestionarFirma;