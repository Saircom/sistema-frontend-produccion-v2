import React from 'react';

const FormField = ({ field, formData, handleChange }) => {
  // Aseguramos que formData exista
  const safeFormData = formData || {};
  
  // Determinamos la clave (key) para buscar el valor
  const fieldKey = field.name || field.id;
  const isBlocked = field.disabled || field.readOnly;

  // Clase base optimizada
  const inputBase = `w-full px-1 py-2.5 md:py-2 border rounded-md text-base md:text-sm transition-all outline-none ${
    isBlocked 
      ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
      : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
  }`;

  // LEER VALOR: Si formData es el objeto aplanado, esto debe funcionar.
  // Usamos ?? "" para evitar undefined o null que bloquean el input
  const value = safeFormData[fieldKey] ?? "";

  const onChangeHandler = (e) => {
    if (!isBlocked && handleChange) {
      handleChange(e);
    }
  };

  return (
    <div className="flex flex-col mb-1 ">
      <label htmlFor={field.id} className="text-[12px] md:text-[11px] font-bold text-slate-600 mb-1.5 md:mb-1 uppercase tracking-tight">
        {field.placeholder || field.label}
      </label>
      
      {field.type === 'select' ? (
        <select
          id={field.id}
          name={fieldKey}
          disabled={field.disabled}
          className={`${inputBase} min-h-[42px] md:min-h-[38px] appearance-none pr-8`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.4' height='292.4'%3E%3Cpath fill='%2364748B' d='M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z'/%3E%3C/svg%3E")`,
            backgroundSize: "0.65rem auto",
            backgroundPosition: "right 0.75rem center",
            backgroundRepeat: "no-repeat"
          }}
          value={value}
          onChange={onChangeHandler}
        >
          <option value="">Seleccionar</option>
          {field.options?.map((opt, i) => {
            const isObject = typeof opt === 'object' && opt !== null;
            return (
              <option key={i} value={isObject ? opt.value : opt}>
                {isObject ? opt.label : opt}
              </option>
            );
          })}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          id={field.id}
          name={fieldKey}
          readOnly={field.readOnly}
          rows={field.rows || 4}
          className={`${inputBase} py-3 resize-y min-h-[120px] md:min-h-[100px]`}
          value={value}
          onChange={onChangeHandler}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          type={field.type || "text"}
          id={field.id}
          name={fieldKey}
          readOnly={field.readOnly}
          disabled={field.disabled}
          className={`${inputBase} min-h-[42px] md:min-h-[38px]`}
          value={value}
          onChange={onChangeHandler}
        />
      )}
    </div>
  );
};

export default FormField;