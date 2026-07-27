import React, { useRef, useState, useEffect } from "react";
import { useAlert } from "../../../context/AlertContext";
import SignatureService from "../../../services/signature.service";

// Importación dinámica para evitar que el Canvas colisione al iniciar la app
const SignatureCanvas = React.lazy(() => import("react-signature-canvas"));

export const FirmaDigital = ({ id_servicio, onSaveSuccess }) => {
    const [isClient, setIsClient] = useState(false);
    const signatureRef = useRef(null);
    const [estaVacio, setEstaVacio] = useState(true);
    const [encargado, setEncargado] = useState("");
    const [loading, setLoading] = useState(false);
    const showAlert = useAlert();

    // Asegurar que el componente solo se renderice en el cliente
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLimpiar = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setEstaVacio(true);
        }
    };

    const handleEndDrawing = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            setEstaVacio(false);
        }
    };

    const handleGuardar = async () => {
        try {
            if (!id_servicio) {
                showAlert("No se recibió el id del servicio.");
                return;
            }
            if (!encargado.trim()) {
                showAlert("Ingrese el nombre del encargado.");
                return;
            }
            if (!signatureRef.current || signatureRef.current.isEmpty()) {
                showAlert("Por favor, firme antes de guardar.");
                return;
            }

            setLoading(true);

            const canvas = signatureRef.current.getTrimmedCanvas();
            const firmaBase64 = canvas.toDataURL("image/png");

            const response = await SignatureService.save({
                id_servicio,
                encargado,
                firma: firmaBase64
            });

            showAlert("Firma guardada correctamente.");
            if (onSaveSuccess) onSaveSuccess(response);

        } catch (error) {
            console.error(error);
            showAlert(error?.message || "Error al guardar la firma.");
        } finally {
            setLoading(false);
        }
    };

    if (!isClient) return <div className="p-4 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="text-center w-full">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Formalización</span>
                <h3 className="text-lg font-black text-gray-900 mt-1">Firma Digital del Cliente</h3>
            </div>

            <input
                type="text"
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
                placeholder="Nombre del encargado"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="w-full bg-gray-50 p-2 rounded-xl border-2 border-dashed border-gray-200">
                <React.Suspense fallback={<div className="h-48 flex items-center justify-center">Cargando firma...</div>}>
                    <SignatureCanvas
                        ref={signatureRef}
                        onEnd={handleEndDrawing}
                        penColor="#1e293b"
                        canvasProps={{
                            width: 400,
                            height: 200,
                            className: "w-full h-48 bg-white rounded-lg",
                            style: { touchAction: "none" } // Necesario para evitar scroll mientras firmas
                        }}
                    />
                </React.Suspense>
            </div>

            <div className="flex items-center justify-end w-full gap-2 pt-2 border-t border-gray-50">
                <button type="button" onClick={handleLimpiar} disabled={estaVacio || loading} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl disabled:opacity-40">
                    Limpiar
                </button>
                <button type="button" onClick={handleGuardar} disabled={loading} className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl disabled:bg-gray-300">
                    {loading ? "Guardando..." : "Aceptar Firma"}
                </button>
            </div>
        </div>
    );
};

export default FirmaDigital;