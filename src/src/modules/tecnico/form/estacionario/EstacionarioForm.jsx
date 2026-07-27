// src/modules/Tecnico/form/estacionario/EstacionarioForm.jsx
import {
    useEffect,
    useState
} from 'react';

import {
    Loader2,
    Save
} from 'lucide-react';

import InformeTecnicoForm from './InformeTecnicoForm.jsx';
import FiltrosComponentesForm from './FiltrosComponentesForm.jsx';
import LecturasCompresorForm from './LecturasCompresorForm.jsx';
import LecturasSecadorForm from './LecturasSecadorForm.jsx';
import VoltajeAmperajeForm from './VoltajeAmperaje.jsx';

const estadoInicial = {
    lecturas_compresor: {},
    lecturas_secador: {},
    voltaje_amperaje: {},
    filtros_y_componentes: {},
    detalle_informe: {}
};

const obtenerPrimerRegistro = (valor) => {
    if (Array.isArray(valor)) {
        return valor[0] ?? {};
    }

    if (
        valor &&
        typeof valor === 'object'
    ) {
        return valor;
    }

    return {};
};

const limpiarRegistro = (valor) => {
    const registro =
        obtenerPrimerRegistro(valor);

    const {
        id,
        id_informe,
        id_lectura,
        id_lectura_compresor,
        id_lectura_secador,
        id_voltaje_amperaje,
        id_detalle,
        id_detalle_informe,
        id_filtros_componentes,
        fecha_registro,
        created_at,
        updated_at,
        ...datos
    } = registro;

    return datos;
};

export const EstacionarioForm = ({
    idInforme = null,
    idOtDetalle = null,
    idOt = null,
    idEquipo = null,

    equipo = {},

    lecturasCompresor = [],
    lecturasSecador = [],
    voltajeAmperaje = [],
    filtrosComponentes = [],
    detalleInforme = [],

    onSubmit,
    onGuardado,
    onError,

    isSaving = false,
    title = 'Editar informe de equipo estacionario'
}) => {
    const [formData, setFormData] =
        useState(estadoInicial);

    const [
        guardandoLocal,
        setGuardandoLocal
    ] = useState(false);

    /*
     * Se ejecuta solamente cuando cambia el informe
     * o el detalle de la OT.
     *
     * No depende de objetos o arreglos porque estos
     * pueden cambiar de referencia en cada render.
     */
    useEffect(() => {
        setFormData({
            lecturas_compresor:
                limpiarRegistro(
                    lecturasCompresor
                ),

            lecturas_secador:
                limpiarRegistro(
                    lecturasSecador
                ),

            voltaje_amperaje:
                limpiarRegistro(
                    voltajeAmperaje
                ),

            filtros_y_componentes:
                limpiarRegistro(
                    filtrosComponentes
                ),

            detalle_informe:
                limpiarRegistro(
                    detalleInforme
                )
        });

        // Se carga nuevamente cuando cambia de informe.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        idInforme,
        idOtDetalle
    ]);

    const actualizarSeccion = (
        seccion,
        campo,
        valor
    ) => {
        setFormData((estadoAnterior) => ({
            ...estadoAnterior,

            [seccion]: {
                ...(estadoAnterior[seccion] ?? {}),
                [campo]: valor
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const informeId =
            Number(idInforme);

        const detalleId =
            Number(idOtDetalle);

        const ordenId =
            Number(idOt);

        const equipoId =
            Number(idEquipo);

        if (
            !Number.isInteger(informeId) ||
            informeId <= 0
        ) {
            onError?.(
                new Error(
                    'No se pudo identificar el informe'
                )
            );

            return;
        }

        if (
            !Number.isInteger(detalleId) ||
            detalleId <= 0
        ) {
            onError?.(
                new Error(
                    'No se pudo identificar el detalle de la Orden de Trabajo'
                )
            );

            return;
        }

        /*
         * Estos campos pertenecen a equipos y solo
         * se muestran en el formulario.
         *
         * No se envían a lecturas_compresor.
         */
        const {
            marca,
            modelo,
            serie,
            fecha_lectura,
            ...lecturasCompresorLimpias
        } = formData.lecturas_compresor;

        const {
            fecha_lectura:
            fechaLecturaSecador,
            ...lecturasSecadorLimpias
        } = formData.lecturas_secador;

        const {
            fecha_lectura:
            fechaLecturaElectrica,
            ...voltajeAmperajeLimpio
        } = formData.voltaje_amperaje;

        const payload = {
            id_informe: informeId,
            id_ot_detalle: detalleId,

            id_ot:
                Number.isInteger(ordenId) &&
                    ordenId > 0
                    ? ordenId
                    : null,

            id_equipo:
                Number.isInteger(equipoId) &&
                    equipoId > 0
                    ? equipoId
                    : null,

            lecturas_compresor:
                lecturasCompresorLimpias,

            lecturas_secador:
                lecturasSecadorLimpias,

            voltaje_amperaje:
                voltajeAmperajeLimpio,

            filtros_y_componentes:
                formData.filtros_y_componentes,

            detalle_informe:
                formData.detalle_informe
        };

        try {
            setGuardandoLocal(true);

            if (
                typeof onSubmit !== 'function'
            ) {
                throw new Error(
                    'No se configuró la función para guardar el informe'
                );
            }

            const respuesta =
                await onSubmit(payload);

            onGuardado?.(
                respuesta ?? {
                    success: true,
                    message:
                        'Informe guardado correctamente'
                }
            );

            return respuesta;
        } catch (error) {
            console.error(
                'Error al guardar el formulario:',
                error
            );

            onError?.(error);

            throw error;
        } finally {
            setGuardandoLocal(false);
        }
    };

    const estaGuardando =
        isSaving || guardandoLocal;

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                <h2 className="text-xl font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Complete o modifique la información técnica del equipo.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
            >
                <LecturasCompresorForm
                    data={
                        formData.lecturas_compresor
                    }
                    equipo={equipo}
                    onChange={(campo, valor) =>
                        actualizarSeccion(
                            'lecturas_compresor',
                            campo,
                            valor
                        )
                    }
                />

                <LecturasSecadorForm
                    data={
                        formData.lecturas_secador
                    }
                    onChange={(campo, valor) =>
                        actualizarSeccion(
                            'lecturas_secador',
                            campo,
                            valor
                        )
                    }
                />

                <VoltajeAmperajeForm
                    data={
                        formData.voltaje_amperaje
                    }
                    onChange={(campo, valor) =>
                        actualizarSeccion(
                            'voltaje_amperaje',
                            campo,
                            valor
                        )
                    }
                />

                <FiltrosComponentesForm
                    data={
                        formData.filtros_y_componentes
                    }
                    onChange={(campo, valor) =>
                        actualizarSeccion(
                            'filtros_y_componentes',
                            campo,
                            valor
                        )
                    }
                />

                <InformeTecnicoForm
                    data={
                        formData.detalle_informe
                    }
                    onChange={(campo, valor) =>
                        actualizarSeccion(
                            'detalle_informe',
                            campo,
                            valor
                        )
                    }
                />

                <div className="sticky bottom-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
                    <button
                        type="submit"
                        disabled={estaGuardando}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {estaGuardando ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar informe
                            </>
                        )}
                    </button>
                </div>
            </form>
        </article>
    );
};

export default EstacionarioForm;