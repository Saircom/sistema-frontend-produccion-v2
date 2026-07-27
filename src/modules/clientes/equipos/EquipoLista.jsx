import React from 'react';
import Swal from 'sweetalert2';
import { equipmentService } from '../../../services/equipment.service';

export const EquipoLista = ({ equipos, onEliminar = () => { }, onEditar = () => { } }) => {
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar equipo?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await equipmentService.deleteEquipment(id);
                Swal.fire('¡Eliminado!', 'El equipo ha sido borrado.', 'success');
                onEliminar();
            } catch (error) {
                console.error("Error técnico:", error);

                const esPorServicioVinculado = error.toString().includes('foreign key') ||
                    error.message?.includes('foreign key');

                if (esPorServicioVinculado) {
                    Swal.fire(
                        'No se puede eliminar',
                        'Este equipo tiene servicios o mantenimientos vinculados y no puede ser eliminado.',
                        'error'
                    );
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el equipo.', 'error');
                }
            }
        }
    };

    if (!equipos || equipos.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No hay equipos registrados para este cliente.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {equipos.map((equipo) => (
                <div key={equipo.id_equipo} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {equipo.tipo_equipo}
                        </span>

                        {/* Contenedor de acciones (Editar y Eliminar) */}
                        <div className="flex items-center space-x-2">

                            {/* Botón Editar - Pasa el objeto completo al hacer click */}
                            <button
                                onClick={() => onEditar(equipo)}
                                className="text-gray-300 hover:text-blue-500 transition-colors"
                                title="Editar equipo"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            {/* Botón Eliminar */}
                            <button
                                onClick={() => handleDelete(equipo.id_equipo)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Eliminar equipo"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="space-y-3 flex-grow">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Marca</span>
                            <span className="text-sm font-bold text-gray-800">{equipo.marca}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Modelo</span>
                            <span className="text-sm font-semibold text-gray-800">{equipo.modelo}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Serie</span>
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">{equipo.serie}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Encargado</span>
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">{equipo.encargado_equipo}</span>
                        </div>
                    </div>

                    {/* Pie: Sede */}
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sede</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{equipo.sede}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};