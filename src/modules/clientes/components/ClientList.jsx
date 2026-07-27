import React from "react";

const ListaClientes = ({ clientes, onSeleccionar, onEliminar }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-gray-200 uppercase text-xs">
            <th className="py-3 px-2">RUC</th>
            <th className="py-3 px-2">Razón Social</th>
            <th className="py-3 px-2">Contacto</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.ruc} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-2 font-medium text-gray-700">{cliente.ruc}</td>
              <td className="py-4 px-2">{cliente.razon_social}</td>
              <td className="py-4 px-2">{cliente.contacto}</td>
              <td className="py-4 px-2 flex gap-2">
                <button 
                  onClick={() => onSeleccionar(cliente)}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Ver Equipos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaClientes;