import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PortatilForm from './ServicioTecnico/forms/PortatilForm'; // Asegúrate de que el nombre coincida
import SignatureCanvas from 'react-signature-canvas';
import { ApiWebURL } from "../utils/index";
import Swal from "sweetalert2";
import { Search, PenTool, Trash2, Send, Camera, Save, Settings, MapPin, ClipboardList } from "lucide-react";

function ReportPortatil() {
    const sigCanvas = useRef(null);
    const [activeTab, setActiveTab] = useState("datos"); // "datos", "firma", "fotos"
    const [servicioId, setServicioId] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        id_cliente: "", sede: "", marca: "", modelo: "", serie: "",
        horometro: "", unidadPN: "", unidadSN: "", nivelAceite: "", tempdescarga: "",
        tipoAceite: "", presionDescarga: "", presionCarga: "",
        filtroAirePrim: "", filtroAireSec: "", filtroAceite: "", filtroSepPrim: "",
        filtroSepSec: "", lubricante: "", orifRet: "", filtRet: "", enfrAceite: "",
        conexMotor: "", kitPresMin: "", kitParAceite: "", kitRegAdm: "", kitRegEsp: "",
        kitValvAdm: "", kitSullicon: "", kitSol2Vias: "", kitSol3Vias: "", preFiltCoal: "",
        ventMotorPrin: "", kitValvTerm: "", kitRepEsp: "", valvShut1: "", valvAlivio: "",
        valvChkDesc: "", valvChkCtrl: "", valvChk1: "", acopFlex: "", postFiltCoal: "",
        conexMotorSec: "", mangLub: "", drenAutoTanque: "", drenAutoPref: "",
        drenAutoSeca: "", anilloTanque: "", filtLineCtrl: "", trampAgua: "",
        carbonActAir: "", tableroEquip: "", ventMotorSec: "", Condensador: "",
        Elementoacople: "", Evaporador: "",
        marcaCombu: "", modeloCombu: "", serieCombu: "", voltajeCombu: "",
        presionAceiteCombu: "", rpmMaximoCombu: "", rpmMinimoCombu: "",
        tipoAceiteCombu: "", nivelAceiteCombu: "", nivelRefrigeranteCombu: "",
        inspeccionfiltroaceite: "", descripcionTrabajo: "", recomendaciones: "",
        conclusiones: "", tipoServicio: "", tipo_equipo: "Equipo Portatil",
        encargado: '', firma: ''
    });

    // CORRECCIÓN 1: Agregar Token a la carga de clientes
    useEffect(() => {
        const cargarClientes = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(ApiWebURL + "/clientes", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setClientes(response.data);
            } catch (err) {
                console.error("Error al cargar clientes", err);
                // Si falla por token, redirigir al login o avisar
                if (err.response?.status === 401 || err.response?.status === 403) {
                    Swal.fire("Sesión Expirada", "Por favor, vuelve a iniciar sesión", "error");
                }
            }
        };
        cargarClientes();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value || "" });

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        // Evitar error si clientes no es un array
        if (Array.isArray(clientes)) {
            setFilteredClientes(term ? clientes.filter(c =>
                c.razon_social?.toLowerCase().includes(term) ||
                c.ruc?.includes(term)
            ) : []);
        }
    };

    // --- PASO 1: GUARDAR DATOS TÉCNICOS ---
    const guardarReporte = async () => {
        const token = localStorage.getItem("token");

        // Validación básica
        if (!formData.id_cliente || !formData.sede || !formData.tipoServicio) {
            return Swal.fire("Atención", "Complete Cliente, Sede y Tipo de Servicio antes de guardar.", "warning");
        }

        setCargando(true);
        try {
            const url = servicioId ? `${ApiWebURL}/servicio/${servicioId}` : `${ApiWebURL}/servicio`;
            const method = servicioId ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: formData,
                headers: { "Authorization": `Bearer ${token}` }
            });

            // Extraer ID correctamente según la respuesta de tu backend
            const idRes = response.data.id || response.data.id_servicio || servicioId;
            setServicioId(idRes);

            await Swal.fire({
                title: "Datos Guardados",
                text: "¿Deseas proceder a la FIRMA del cliente?",
                icon: "success",
                confirmButtonText: "Ir a Firma"
            });
            setActiveTab("firma");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "No se pudo guardar el formulario.";
            Swal.fire("Error", msg, "error");
        } finally {
            setCargando(false);
        }
    };

    // --- PASO 2: ENVIAR FIRMA ---
    const enviarFirma = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            return Swal.fire("Firma requerida", "El cliente debe firmar.", "warning");
        }
        if (!formData.encargado) {
            return Swal.fire("Nombre requerido", "Ingrese el nombre del responsable.", "warning");
        }

        const token = localStorage.getItem("token");
        const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
        const blob = await (await fetch(signatureImage)).blob();
        const firmaFile = new File([blob], `firma_${servicioId}.png`, { type: "image/png" });

        const finalData = new FormData();
        finalData.append("firma", firmaFile);
        finalData.append("encargado", formData.encargado);

        try {
            setCargando(true);
            await axios.post(`${ApiWebURL}/servicio/${servicioId}/firma`, finalData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            Swal.fire("Éxito", "Firma guardada correctamente.", "success");
            setActiveTab("fotos");
        } catch (err) {
            Swal.fire("Error", "No se pudo subir la firma.", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* CABECERA */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Reporte Portátil / Generador</h1>
                    <p className="text-slate-500 font-medium">ID Seguimiento: {servicioId || "Pendiente de guardado"}</p>
                </div>

                {/* NAVEGACIÓN POR PASOS */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("datos")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === "datos" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
                    >
                        <Settings size={18} /> 1. Datos
                    </button>
                    <button
                        disabled={!servicioId}
                        onClick={() => setActiveTab("firma")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === "firma" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"} ${!servicioId && "opacity-40"}`}
                    >
                        <PenTool size={18} /> 2. Firma
                    </button>
                    <button
                        disabled={!servicioId}
                        onClick={() => setActiveTab("fotos")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === "fotos" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"} ${!servicioId && "opacity-40"}`}
                    >
                        <Camera size={18} /> 3. Fotos
                    </button>
                </div>

                {/* CONTENIDO DE TABS */}
                <div className="space-y-8">

                    {/* PASO 1: DATOS */}
                    {activeTab === "datos" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="relative col-span-1 md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Cliente</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" value={searchTerm} onChange={handleSearchChange} placeholder="Buscar RUC o Razón Social..." />
                                        </div>
                                        {filteredClientes.length > 0 && (
                                            <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                                {filteredClientes.map(c => (
                                                    <li key={c.id_cliente} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm border-b border-slate-50 font-medium" onClick={() => {
                                                        setFormData({ ...formData, id_cliente: c.id_cliente });
                                                        setSearchTerm(c.razon_social);
                                                        setFilteredClientes([]);
                                                    }}>{c.razon_social}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Sede</label>
                                        <input name="sede" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.sede} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tipo de Servicio</label>
                                        <input
                                            name="tipoServicio"
                                            list="servicios"
                                            placeholder="Seleccione o escriba..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            value={formData.tipoServicio}
                                            onChange={handleChange}
                                        />
                                        <datalist id="servicios">
                                            <option value="Mantenimiento preventivo 2000 horas" />
                                            <option value="Mantenimiento preventivo 4000 horas" />
                                            <option value="Mantenimiento preventivo 8000 horas" />
                                            <option value="Mantenimiento preventivo 16000 horas" />
                                            <option value="Mantenimiento preventivo 20000 horas" />

                                            <option value="Mantenimiento correctivo" />
                                            <option value="Inspección" />
                                            <option value="Arranque inicial" />
                                        </datalist>
                                    </div>
                                    {/* --- INSPECCIÓN FILTRO DE ACEITE (Diseño mejorado) --- */}
                                    <div className="lg:col-span-3"> {/* Ocupa todo el ancho para que el texto largo se lea bien */}
                                        <label htmlFor="inspeccionfiltroaceiteSelect" className="block text-xs font-black text-slate-400 uppercase mb-2">
                                            Inspección filtro de aceite
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all cursor-pointer pr-10"
                                                id="inspeccionfiltroaceiteSelect"
                                                name="inspeccionfiltroaceite"
                                                value={formData.inspeccionfiltroaceite}
                                                onChange={handleChange}
                                            >
                                                <option value="" disabled>Seleccione el estado del filtro...</option>
                                                <option value="Se procedió a aperturar el filtro de aceite, verificando que no existe presencia de partículas metálicas en el papel filtrante, por lo que se concluye que la unidad compresora estaría trabajando correctamente">
                                                    ✅ No existe presencia de partículas (Operación Correcta)
                                                </option>
                                                <option value="Se procedió a aperturar el filtro de aceite verificando la presencia de partículas metálicas (limallas) en regular proporción, por lo que se recomienda la intervención de la unidad compresora a fin de evitar daños mayores en esta">
                                                    ⚠️ Presencia de partículas (Requiere Intervención)
                                                </option>
                                            </select>
                                            {/* Icono de flecha personalizado */}
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                <PortatilForm formData={formData} handleChange={handleChange} />
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button onClick={guardarReporte} disabled={cargando} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                                    <Save size={20} /> {servicioId ? "ACTUALIZAR DATOS" : "GUARDAR Y CONTINUAR"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: FIRMA */}
                    {activeTab === "firma" && (
                        <div className="max-w-2xl mx-auto animate-in slide-in-from-right duration-500">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Responsable del Cliente</label>
                                <input name="encargado" className="w-full px-4 py-3 mb-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm" placeholder="Nombre completo" value={formData.encargado} onChange={handleChange} />
                                <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden mb-6">
                                    <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: "w-full h-64 cursor-crosshair" }} />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => sigCanvas.current.clear()} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-2">
                                        <Trash2 size={18} /> Limpiar
                                    </button>
                                    <button onClick={enviarFirma} disabled={cargando} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
                                        <Save size={18} /> GUARDAR FIRMA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: FOTOS */}
                    {activeTab === "fotos" && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center animate-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-center gap-2 mb-6 text-orange-600 font-bold uppercase tracking-widest text-xs">
                                <Camera size={18} /> Paso 3: Evidencias Fotográficas
                            </div>
                            <Camera size={48} className="mx-auto text-orange-200 mb-4" />
                            <h2 className="text-xl font-bold text-slate-800">Carga de Imágenes</h2>
                            <p className="text-slate-500 mb-6">Sube las fotos finales para cerrar el reporte técnico del equipo portátil.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <button className="aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                                    + Subir Foto
                                </button>
                            </div>

                            <button className="w-full max-w-md py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 mx-auto">
                                <Send size={18} /> FINALIZAR REPORTE COMPLETO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportPortatil;