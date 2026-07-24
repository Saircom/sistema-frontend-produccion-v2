// src/modules/ServicioTecnico/forms/estacionario/InformeTecnicoForm.jsx
import { ClipboardList } from 'lucide-react';
import { tecnicosFields } from '../Data.js';

const CampoFormulario = ({
    field,
    value,
    onChange
}) => {
    const {
        id,
        name,
        label,
        placeholder,
        type = 'textarea',
        required = false,
        disabled = false,
        readOnly = false,
        rows = 5,
        min,
        max,
        step = 'any',
        options = []
    } = field;

    const textoCampo =
        label ??
        placeholder ??
        name;

    const handleChange = (event) => {
        if (disabled || readOnly) {
            return;
        }

        const nuevoValor =
            type === 'checkbox'
                ? event.target.checked
                : event.target.value;

        onChange?.(name, nuevoValor);
    };

    if (type === 'select') {
        return (
            <label
                htmlFor={id ?? name}
                className="block"
            >
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {textoCampo}

                    {required && (
                        <span className="ml-1 text-red-500">
                            *
                        </span>
                    )}
                </span>

                <select
                    id={id ?? name}
                    name={name}
                    value={value ?? ''}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${disabled
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }`}
                >
                    <option value="">
                        Seleccione una opción
                    </option>

                    {options.map((opcion, index) => {
                        const valor =
                            opcion?.value ??
                            opcion?.id ??
                            opcion;

                        const texto =
                            opcion?.label ??
                            opcion?.nombre ??
                            opcion?.name ??
                            opcion;

                        return (
                            <option
                                key={`${valor}-${index}`}
                                value={valor}
                            >
                                {texto}
                            </option>
                        );
                    })}
                </select>
            </label>
        );
    }

    if (type === 'checkbox') {
        return (
            <label
                htmlFor={id ?? name}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
                <input
                    id={id ?? name}
                    name={name}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={handleChange}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <span className="text-sm font-semibold text-slate-700">
                    {textoCampo}
                </span>
            </label>
        );
    }

    if (type === 'text' || type === 'number') {
        return (
            <label
                htmlFor={id ?? name}
                className="block"
            >
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {textoCampo}

                    {required && (
                        <span className="ml-1 text-red-500">
                            *
                        </span>
                    )}
                </span>

                <input
                    id={id ?? name}
                    name={name}
                    type={type}
                    value={value ?? ''}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    min={min}
                    max={max}
                    step={
                        type === 'number'
                            ? step
                            : undefined
                    }
                    placeholder={placeholder}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${disabled || readOnly
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }`}
                />
            </label>
        );
    }

    return (
        <label
            htmlFor={id ?? name}
            className="block"
        >
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {textoCampo}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </span>

            <textarea
                id={id ?? name}
                name={name}
                value={value ?? ''}
                onChange={handleChange}
                rows={rows}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full resize-y rounded-lg border px-3 py-2.5 outline-none transition ${disabled || readOnly
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                    : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
            />
        </label>
    );
};

const HallazgosTrabajoForm = ({
    data = {},
    onChange
}) => {
    const campos = Array.isArray(tecnicosFields)
        ? tecnicosFields
        : [];

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Informe técnico
                    </h3>

                    <p className="text-sm text-slate-500">
                        Describa el trabajo ejecutado, las recomendaciones y las conclusiones.
                    </p>
                </div>
            </div>

            {campos.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen campos configurados en tecnicosFields.
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-5">
                    {campos.map((field) => (
                        <CampoFormulario
                            key={
                                field.id ??
                                field.name
                            }
                            field={field}
                            value={
                                data?.[field.name]
                            }
                            onChange={onChange}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default HallazgosTrabajoForm;