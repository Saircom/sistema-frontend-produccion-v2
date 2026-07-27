// src/modules/ServicioTecnico/forms/estacionario/FiltrosComponentesForm.jsx
import { ListChecks } from 'lucide-react';
import { filtros_y_componentes } from '../Data.js';

const normalizarOpcion = (opcion) => {
    if (
        opcion !== null &&
        typeof opcion === 'object'
    ) {
        return {
            value:
                opcion.value ??
                opcion.id ??
                opcion.codigo ??
                '',
            label:
                opcion.label ??
                opcion.nombre ??
                opcion.name ??
                opcion.descripcion ??
                opcion.value ??
                ''
        };
    }

    return {
        value: opcion ?? '',
        label: String(opcion ?? '')
    };
};

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
        type = 'text',
        options = [],
        disabled = false,
        readOnly = false,
        required = false,
        min,
        max,
        step = 'any',
        rows = 4
    } = field;

    const textoCampo =
        label ??
        placeholder ??
        name;

    const handleChange = (event) => {
        if (disabled || readOnly) {
            return;
        }

        let nuevoValor;

        if (type === 'checkbox') {
            nuevoValor = event.target.checked;
        } else {
            nuevoValor = event.target.value;
        }

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
                    disabled={disabled}
                    required={required}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${disabled
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }`}
                >
                    <option value="">
                        Seleccione una opción
                    </option>

                    {options.map((opcion, index) => {
                        const item =
                            normalizarOpcion(opcion);

                        return (
                            <option
                                key={`${item.value}-${index}`}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        );
                    })}
                </select>
            </label>
        );
    }

    if (type === 'textarea') {
        return (
            <label
                htmlFor={id ?? name}
                className="block md:col-span-2"
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
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    rows={rows}
                    placeholder={placeholder}
                    className={`w-full resize-y rounded-lg border px-3 py-2.5 outline-none transition ${disabled || readOnly
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }`}
                />
            </label>
        );
    }

    if (type === 'checkbox') {
        return (
            <label
                htmlFor={id ?? name}
                className={`flex items-center gap-3 rounded-lg border p-4 transition ${value
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50'
                    } ${disabled
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:border-indigo-300'
                    }`}
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
                disabled={disabled}
                readOnly={readOnly}
                required={required}
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
};

const FiltrosComponentesForm = ({
    data = {},
    onChange
}) => {
    const campos = Array.isArray(
        filtros_y_componentes
    )
        ? filtros_y_componentes
        : [];

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Filtros y componentes
                    </h3>

                    <p className="text-sm text-slate-500">
                        Registre las inspecciones y actividades realizadas en los componentes del equipo.
                    </p>
                </div>
            </div>

            {campos.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen campos configurados en filtros_y_componentes.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
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

export default FiltrosComponentesForm;