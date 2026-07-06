import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SignatureCanvas from "react-signature-canvas";

import EstacionarioForm from "../ServicioTecnico/forms/EstacionarioForm";
import { serviciosService } from "../../services/service.service";
import lecturasService from "../../services/reading.service";

function Reportes() {
    const { id_servicio } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const servicioDesdeLista = location.state?.servicio;

    const sigCanvas = useRef(null);

    const [activeTab, setActiveTab] = useState("datos");
    const [servicioId, setServicioId] = useState(id_servicio || null);
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        id_cliente: "",
        numero_orden: "",
        numero_cotizacion: "",

        sede: "",
        marca: "",
        modelo: "",
        serie: "",

        horometro: "",
        temp_descarga: "",
        unidadpn: "",
        unidadsn: "",
        tipo_arranque: "",
        volt_equipo: "",
        presion_carga: "",
        presion_descarga: "",
        amp_motor: "",
        amp_motor_ventilador: "",
        tipo_aceite: "",
        nivel_aceite: "",
        equipo_operacion: "",

        tipoServicio: "",
        tipo_equipo: "Equipo estacionario",
        encargado: "",

        // Secador
        marca_secador: "",
        modelo_secador: "",
        serie_secador: "",
        voltaje_secador: "",
        amperaje_secador: "",
        punto_rocio: "",
        tipo_refrigeracion: "",

        // Voltajes
        amp1: "",
        amp2: "",
        amp3: "",
        amp_vacio_minimo_l1: "",
        amp_vacio_minimo_l2: "",
        amp_vacio_minimo_l3: "",

        volt1: "",
        volt2: "",
        volt3: "",
        vacio_minimo_l1: "",
        vacio_minimo_l2: "",
        vacio_minimo_l3: "",

        descripcionTrabajo: "",
        recomendaciones: "",
        conclusiones: "",

        // Checklist
        filtroAirePrim: "",
        filtroAireSec: "",
        filtroAceite: "",
        filtroSepPrim: "",
        filtroSepSec: "",
        lubricante: "",
        orifRet: "",
        filtRet: "",
        enfrAceite: "",
        conexMotor: "",
        kitPresMin: "",
        kitParAceite: "",
        kitRegAdm: "",
        kitRegEsp: "",
        kitValvAdm: "",
        kitSullicon: "",
        kitSol2Vias: "",
        kitSol3Vias: "",
        preFiltCoal: "",
        ventMotorPrin: "",
        kitValvTerm: "",
        kitRepEsp: "",
        valvShut1: "",
        valvAlivio: "",
        valvChkDesc: "",
        valvChkCtrl: "",
        valvChk1: "",
        acopFlex: "",
        postFiltCoal: "",
        conexMotorSec: "",
        mangLub: "",
        drenAutoTanque: "",
        drenAutoPref: "",
        drenAutoSeca: "",
        anilloTanque: "",
        filtLineCtrl: "",
        trampAgua: "",
        carbonActAir: "",
        tableroEquip: "",
        ventMotorSec: "",
        Condensador: "",
        Elementoacople: "",
        Evaporador: ""
    });

    useEffect(() => {
        cargarServicio();
    }, [id_servicio]);

    const cargarServicio = async () => {
        try {
            setCargando(true);

            if (servicioDesdeLista) {
                setFormData(prev => ({ ...prev, ...servicioDesdeLista }));
                setServicioId(servicioDesdeLista.id_servicio);
                return;
            }

            if (!id_servicio) return;

            // Ahora traemos todo desde el servicio general
            const responseServicio = await serviciosService.getById(id_servicio);

            if (responseServicio.data.success) {
                const dataCompleta = responseServicio.data.data;

                // Suponiendo que la API devuelve un objeto con los campos aplanados
                // o que necesitas combinar las lecturas que vienen dentro de este objeto
                setFormData(prev => ({
                    ...prev,
                    ...dataCompleta,
                    // Si las lecturas vienen anidadas, mapealas aquí:
                    // ...dataCompleta.lecturas
                }));

                setServicioId(dataCompleta.id_servicio);
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar la información.", "error");
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveFullForm = async (currentData) => {

        if (!servicioId) {
            Swal.fire(
                "Error",
                "No se identificó el servicio.",
                "error"
            );
            return;
        }

        try {

            setCargando(true);

            const payloads = [
                {
                    tipo: "compresor",
                    datos: {
                        id_servicio: Number(servicioId),
                        horometro: Number(currentData.horometro) || 0,
                        temp_descarga:
                            Number(currentData.temp_descarga) || 0,
                        unidadpn: currentData.unidadpn || "",
                        unidadsn: currentData.unidadsn || "",
                        tipo_arranque:
                            currentData.tipo_arranque || "",
                        volt_equipo:
                            Number(currentData.volt_equipo) || 0,
                        amp_motor:
                            Number(currentData.amp_motor) || 0,
                        presion_carga:
                            Number(currentData.presion_carga) || 0,
                        presion_descarga:
                            Number(currentData.presion_descarga) || 0,
                        amp_motor_ventilador:
                            Number(currentData.amp_motor_ventilador) || 0,
                        tipo_aceite:
                            currentData.tipo_aceite || "",
                        nivel_aceite:
                            currentData.nivel_aceite || "",
                        equipo_operacion:
                            currentData.equipo_operacion || ""
                    }
                },

                {
                    tipo: "secador",
                    datos: {
                        id_servicio: Number(servicioId),
                        marca_secador:
                            currentData.marca_secador || "",
                        modelo_secador:
                            currentData.modelo_secador || "",
                        serie_secador:
                            currentData.serie_secador || "",
                        voltaje_secador:
                            currentData.voltaje_secador || "",
                        amperaje_secador:
                            Number(currentData.amperaje_secador) || 0,
                        punto_rocio:
                            Number(currentData.punto_rocio) || 0,
                        tipo_refrigeracion:
                            currentData.tipo_refrigeracion || ""
                    }
                },

                {
                    tipo: "voltaje_amperaje",
                    datos: {
                        id_servicio: Number(servicioId),

                        amp1: currentData.amp1 || "",
                        amp2: currentData.amp2 || "",
                        amp3: currentData.amp3 || "",

                        amp_vacio_minimo_l1:
                            currentData.amp_vacio_minimo_l1 || "",
                        amp_vacio_minimo_l2:
                            currentData.amp_vacio_minimo_l2 || "",
                        amp_vacio_minimo_l3:
                            currentData.amp_vacio_minimo_l3 || "",

                        volt1: currentData.volt1 || "",
                        volt2: currentData.volt2 || "",
                        volt3: currentData.volt3 || "",

                        vacio_minimo_l1:
                            currentData.vacio_minimo_l1 || "",
                        vacio_minimo_l2:
                            currentData.vacio_minimo_l2 || "",
                        vacio_minimo_l3:
                            currentData.vacio_minimo_l3 || ""
                    }
                },

                {
                    tipo: "filtros_y_componentes",
                    datos: {
                        id_servicio: Number(servicioId),

                        filtroAirePrim:
                            currentData.filtroAirePrim || "",
                        filtroAireSec:
                            currentData.filtroAireSec || "",
                        filtroAceite:
                            currentData.filtroAceite || "",
                        filtroSepPrim:
                            currentData.filtroSepPrim || "",
                        filtroSepSec:
                            currentData.filtroSepSec || "",
                        lubricante:
                            currentData.lubricante || "",

                        orifRet: currentData.orifRet || "",
                        filtRet: currentData.filtRet || "",
                        enfrAceite:
                            currentData.enfrAceite || "",
                        conexMotor:
                            currentData.conexMotor || "",
                        kitPresMin:
                            currentData.kitPresMin || "",
                        kitParAceite:
                            currentData.kitParAceite || "",
                        kitRegAdm:
                            currentData.kitRegAdm || "",
                        kitRegEsp:
                            currentData.kitRegEsp || "",
                        kitValvAdm:
                            currentData.kitValvAdm || "",
                        kitSullicon:
                            currentData.kitSullicon || "",
                        kitSol2Vias:
                            currentData.kitSol2Vias || "",
                        kitSol3Vias:
                            currentData.kitSol3Vias || "",
                        preFiltCoal:
                            currentData.preFiltCoal || "",
                        ventMotorPrin:
                            currentData.ventMotorPrin || "",
                        kitValvTerm:
                            currentData.kitValvTerm || "",
                        kitRepEsp:
                            currentData.kitRepEsp || "",
                        valvShut1:
                            currentData.valvShut1 || "",
                        valvAlivio:
                            currentData.valvAlivio || "",
                        valvChkDesc:
                            currentData.valvChkDesc || "",
                        valvChkCtrl:
                            currentData.valvChkCtrl || "",
                        valvChk1:
                            currentData.valvChk1 || "",
                        acopFlex:
                            currentData.acopFlex || "",
                        postFiltCoal:
                            currentData.postFiltCoal || "",
                        conexMotorSec:
                            currentData.conexMotorSec || "",
                        mangLub:
                            currentData.mangLub || "",
                        drenAutoTanque:
                            currentData.drenAutoTanque || "",
                        drenAutoPref:
                            currentData.drenAutoPref || "",
                        drenAutoSeca:
                            currentData.drenAutoSeca || "",
                        anilloTanque:
                            currentData.anilloTanque || "",
                        filtLineCtrl:
                            currentData.filtLineCtrl || "",
                        trampAgua:
                            currentData.trampAgua || "",
                        carbonActAir:
                            currentData.carbonActAir || "",
                        tableroEquip:
                            currentData.tableroEquip || "",
                        ventMotorSec:
                            currentData.ventMotorSec || "",
                        Condensador:
                            currentData.Condensador || "",
                        Elementoacople:
                            currentData.Elementoacople || "",
                        Evaporador:
                            currentData.Evaporador || ""
                    }
                }
            ];

            // Guardar todas las lecturas
            await Promise.all(
                payloads.map(payload =>
                    lecturasService.guardar(payload)
                )
            );

            Swal.fire(
                "Éxito",
                "Información guardada correctamente.",
                "success"
            );

        } catch (error) {

            console.error(error);

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Error al guardar la información.",
                "error"
            );

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="">

            <div className="">

                {activeTab === "datos" && (
                    <div className="">

                        <EstacionarioForm
                            formData={formData}
                            handleChange={handleChange}
                            onSaveFullForm={handleSaveFullForm}
                            isSaving={cargando}
                        />

                    </div>
                )}

            </div>

        </div>
    );
}

export default Reportes;