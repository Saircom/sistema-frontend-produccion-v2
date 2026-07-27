import React from 'react';
import FormField from './FormField';

export const Section = ({ title, children }) => (
  <div className="mb-2 md:mb-4 w-full">
    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 border-l-[3px] md:border-l-[4px] border-indigo-600 pl-3 md:pl-4">
      <h3 className="text-[11px] md:text-[13px] font-black text-slate-700 uppercase tracking-widest leading-none">
        {title}
      </h3>
    </div>
    <div className="w-full px-0 sm:px-2">
      {children}
    </div>
  </div>
);

export const Grid = ({
  fields = [],
  formData = {},
  handleChange,
  cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-2",
  sectionId = "" // Recibe el ID de la sección
}) => (
  <div className={`grid ${cols} gap-x-2  w-full items-start`}>
    {fields.map((field) => {
      if (!field?.id) return null;

      return (
        <div
          key={field.id}
          className={field.fullWidth ? "col-span-full w-full" : "w-full"}
        >
          <FormField
            field={field}
            formData={formData}
            // En lugar de modificar el evento 'e', le pasamos la sección como segundo parámetro
            handleChange={(e) => handleChange(e, sectionId)}
          />
        </div>
      );
    })}
  </div>
);