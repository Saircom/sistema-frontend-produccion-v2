import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function Pagination({
  totalPaginas,
  onPageChange,
  paginaActual = 0,
  paginaInicial = 0,
  maxBotones = 5,
  // Props para el selector de filas
  filasPagina,
  setFilasPagina,
  mostrarSelector = true
}) {
  const paginaInicialReal = typeof paginaActual === 'number' ? paginaActual : paginaInicial;
  const [pagina, setPagina] = useState(paginaInicialReal);

  useEffect(() => {
    setPagina(paginaInicialReal);
  }, [paginaInicialReal]);

  const cambiarPagina = (numPagina) => {
    if (numPagina >= 0 && numPagina < totalPaginas) {
      setPagina(numPagina);
      if (typeof onPageChange === 'function') {
        onPageChange(numPagina);
      }
    }
  };

  const mitad = Math.floor(maxBotones / 2);
  let inicio = Math.max(0, pagina - mitad);
  let fin = Math.min(totalPaginas, inicio + maxBotones);

  if (fin - inicio < maxBotones) {
    inicio = Math.max(0, fin - maxBotones);
  }

  const btnClaseBase = "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium transition-all duration-200 rounded-xl border";
  const btnActivo = "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200";
  const btnInactivo = "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600";
  const btnDisabled = "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed";

  if (totalPaginas <= 1 && !mostrarSelector) return null;

  const renderSelector = mostrarSelector && typeof filasPagina === 'number' && typeof setFilasPagina === 'function';

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full" aria-label="Paginación">
      
      {/* Selector de Filas */}
      {renderSelector && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mostrar:</span>
          <select
            value={filasPagina}
            onChange={(e) => { 
              setFilasPagina(Number(e.target.value)); 
              cambiarPagina(0); 
            }}
            className="border border-gray-200 rounded-lg text-sm p-1.5 outline-none bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-600"
          >
            <option value={15}>15 filas</option>
            <option value={25}>25 filas</option>
            <option value={50}>50 filas</option>
          </select>
        </div>
      )}

      {/* Controles de Navegación */}
      {totalPaginas > 1 && (
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            className={`${btnClaseBase} ${pagina === 0 ? btnDisabled : btnInactivo} hidden xs:flex`}
            onClick={() => cambiarPagina(0)}
            disabled={pagina === 0}
          >
            <ChevronsLeft size={18} />
          </button>

          <button
            className={`${btnClaseBase} ${pagina === 0 ? btnDisabled : btnInactivo}`}
            onClick={() => cambiarPagina(pagina - 1)}
            disabled={pagina === 0}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center space-x-1 px-1">
            {Array.from({ length: fin - inicio }, (_, i) => inicio + i).map((num) => (
              <button
                key={num}
                className={`${btnClaseBase} ${pagina === num ? btnActivo : btnInactivo} ${num !== pagina ? 'hidden md:flex' : 'flex'}`}
                onClick={() => cambiarPagina(num)}
              >
                {num + 1}
              </button>
            ))}
            
            <span className="text-sm font-medium text-gray-500 md:hidden px-2">
              {pagina + 1} / {totalPaginas}
            </span>
          </div>

          <button
            className={`${btnClaseBase} ${pagina === totalPaginas - 1 ? btnDisabled : btnInactivo}`}
            onClick={() => cambiarPagina(pagina + 1)}
            disabled={pagina === totalPaginas - 1}
          >
            <ChevronRight size={18} />
          </button>

          <button
            className={`${btnClaseBase} ${pagina === totalPaginas - 1 ? btnDisabled : btnInactivo} hidden xs:flex`}
            onClick={() => cambiarPagina(totalPaginas - 1)}
            disabled={pagina === totalPaginas - 1}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </nav>
  );
}

export default Pagination;