import React, { useState, useEffect } from "react";
import { Briefcase, DollarSign, User, ChevronRight, Plus, X } from "lucide-react";
import { gastosService } from '../../../services/gastos.service.js';
import { serviciosService } from '../../../services/service.service.js';

export default function ViaticosList({ onSeleccionar }) {
  const [serviciosConGastos, setServiciosConGastos] = useState([]);
  const [listaServicios, setListaServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [isCrearOpen, setIsCrearOpen] = useState(false);

  const [nuevoGasto, setNuevoGasto] = useState({
    id_servicio: "",
    cliente: "",
    total_gastado: 0
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await gastosService.listar();
      console.debug('[GastoList] /gastos respuesta:', data);
      const servicios = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      console.debug('[GastoList] servicios procesados:', servicios);
      setServiciosConGastos(servicios);
    } catch (error) {
      console.error("Error cargando viáticos:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = async () => {
    setIsCrearOpen(true);
    try {
      const data = await serviciosService.getAll();
      console.debug('[GastoList] /servicios respuesta:', data);
      const servicios = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      console.debug('[GastoList] listaServicios procesados:', servicios);     
      setListaServicios(servicios);
    } catch (error) {
      console.error("Error cargando opciones de servicio:", error); 
    }
  };  

  const handleGuardarGasto = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const esServicio = nuevoGasto.id_servicio !== "";

      const payload = {
        tipo_origen: esServicio ? 'SERVICIO' : 'OPERATIVO',
        id_servicio: esServicio ? Number(nuevoGasto.id_servicio) : null,
        cantidad_recibida: Number(nuevoGasto.total_gastado),
        fecha_cierre: new Date().toISOString().split('T')[0]
      };

      await gastosService.crear(payload);
      setIsCrearOpen(false);
      setNuevoGasto({ id_servicio: "", cliente: "", total_gastado: 0 });
      await cargarServicios();
    } catch (error) {
      alert("Error al guardar el gasto: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const totalGeneral = serviciosConGastos.reduce((acc, s) => acc + Number(s.total_gastado || 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Viáticos</h1>
          <button onClick={abrirModal} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700">
            <Plus className="inline mr-2" size={20} /> Nuevo Gasto
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500">Total Registros</p>
            <h2 className="text-3xl font-bold">{serviciosConGastos.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500">Total Gastado</p>
            <h2 className="text-3xl font-bold text-emerald-600">S/. {totalGeneral.toFixed(2)}</h2>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Servicio</th>
                <th className="p-4">Tipo Servicio</th>
                <th className="p-4">Tecnico</th>
                <th className="p-4">Monto Recibido</th>
                <th className="p-4">Monto Gastado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {serviciosConGastos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No se encontraron gastos.</td>
                </tr>
              ) : (
                serviciosConGastos.map((item, idx) => (
                  <tr key={item.id_gasto_c || idx} className="border-t">
                    <td className="p-4">{item.id_servicio ? `N° ${item.id_servicio}` : "Operativo"}</td>
                    <td className="p-4">{item.tipoServicio}</td>
                    <td className="p-4">{item.usuario}</td>
                    <td className="p-4 font-bold">S/. {Number(item.cantidad_recibida).toFixed(2)}</td>
                    <td className="p-4 font-bold">S/. {Number(item.total_gastado).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => onSeleccionar(item)} className="text-blue-600">Gestionar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isCrearOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Registrar Gasto</h3>
              <button onClick={() => setIsCrearOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleGuardarGasto} className="space-y-4">
              <select
                className="w-full p-2 border rounded-lg"
                value={nuevoGasto.id_servicio}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, id_servicio: e.target.value })}
              >
                <option value="">-- Gasto Operativo --</option>
                {listaServicios.length === 0 ? (
                  <option value="" disabled>No hay servicios disponibles</option>
                ) : (
                  listaServicios.map((s) => (
                    <option key={s.id_servicio} value={s.id_servicio}>
                      {s.id_servicio} - {s.cliente_razon_social} - {s.tipoServicio}
                    </option>
                  ))
                )}
              </select>
              <input type="number" placeholder="Monto" required className="w-full p-2 border rounded-lg" value={nuevoGasto.total_gastado} onChange={(e) => setNuevoGasto({ ...nuevoGasto, total_gastado: e.target.value })} />
              <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}