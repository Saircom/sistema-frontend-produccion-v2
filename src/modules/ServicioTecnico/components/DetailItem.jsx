import React from 'react';

export const DetailItem = ({ label, value, icon: Icon }) => {
    // Si el valor viene vacío, nulo o indefinido, mostramos un guion
    const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
    const hasValue = value !== undefined && value !== null && value !== "";

    return (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[68px] relative overflow-hidden group">
            <div className="flex justify-between items-start gap-2">
                <span className="text-[11px] font-medium text-slate-400 block truncate" title={label}>
                    {label}
                </span>
                {/* Si se pasa un icono, se renderiza en un gris sutil */}
                {Icon && <Icon className="text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" size={14} />}
            </div>
            <span 
                className={`text-xs font-semibold block mt-1 break-words ${
                    hasValue ? 'text-slate-700' : 'text-slate-300 font-normal italic'
                }`}
            >
                {displayValue}
            </span>
        </div>
    );
};

export default DetailItem;