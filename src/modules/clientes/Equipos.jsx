import React, { useState, useEffect, useCallback } from "react";
import { equipmentService } from "../../services/equipment.service.js";
import Loading from "../../components/Loading.jsx";       // Asegura que las rutas a tus compartidos existan
import Pagination from "../../components/Pagination.jsx"; // Asegura que las rutas a tus compartidos existan

export const Equipos = () => {
  const [listaEquipos, setListaEquipos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filasPagina, setFilasPagina] = useState(15);
  const [busqueda, setBusqueda] = useState('');

  const leerServicio = useCallback(async () => {
    setCargando(true);
    try {
      const response = await equipmentService.getAllEquipment();

      // Si response ya es directamente el array que viene de Postman:
      if (Array.isArray(response)) {
        setListaEquipos(response);
      }
      // Si tu servicio devuelve un objeto envoltorio pero la data es el arreglo:
      else if (response && response.success && Array.isArray(response.data)) {
        setListaEquipos(response.data);
      }
      // Caso de respaldo si el formato es distinto
      else {
        setListaEquipos([]);
      }

    } catch (error) {
      console.error("Error al cargar equipos:", error);

      if (error.status === 401 || error.message?.includes("unauthorized")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    leerServicio();
  }, [leerServicio]);

  // Resetear paginación al realizar una nueva búsqueda
  useEffect(() => {
    setPagina(0);
  }, [busqueda]);

  // Filtrado dinámico en memoria por Marca, Modelo, S/N Único o Cliente
  const equiposFiltrados = listaEquipos.filter((e) =>
    (e.marca?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
    (e.modelo?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
    (e.serie?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
    (e.nombre_comercial?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(equiposFiltrados.length / filasPagina);
  const dataPaginada = equiposFiltrados.slice(pagina * filasPagina, (pagina + 1) * filasPagina);

  return (
    <div className="p-6 space-y-6">
      {/* Sección Superior: Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por S/N, Marca, Modelo o Cliente..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Total: {equiposFiltrados.length} sistemas encontrados
        </div>
      </div>

      {/* Tabla Principal */}
      {cargando ? (
        <div className="py-20 flex justify-center"><Loading /></div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Especificaciones Técnicas</th>
                <th className="px-6 py-4 font-bold">Ubicación / Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dataPaginada.length > 0 ? (
                dataPaginada.map((item) => (
                  <tr key={item.id_equipo} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.marca} - {item.modelo}</div>
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{item.tipo_equipo}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">S/N: {item.serie}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-gray-700 font-semibold">{item.razon_social || 'Cliente no asignado'}</div>
                      {item.ruc && <div className="text-gray-400 font-mono text-[11px]">RUC: {item.ruc}</div>}
                      <div className="text-gray-400 mt-0.5">Sede: {item.sede || 'Principal'}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-10 text-center text-gray-400 italic">No se encontraron maquinarias industriales registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginador Inferior */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-full">
        <Pagination
          totalPaginas={totalPaginas}
          paginaActual={pagina}
          onPageChange={setPagina}
          filasPagina={filasPagina}
          setFilasPagina={setFilasPagina}
        />
      </div>
    </div>
  );
}

export default Equipos;