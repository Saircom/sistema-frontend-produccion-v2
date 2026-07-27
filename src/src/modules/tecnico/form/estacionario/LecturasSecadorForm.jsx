// src/modules/ServicioTecnico/forms/estacionario/LecturasSecadorForm.jsx
import { Snowflake } from 'lucide-react';
import { lecturas_secador } from '../Data.js';

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
        placeholder,
        label,
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
                    disabled={disabled}
                    required={required}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${
                        disabled
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
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    rows={rows}
                    placeholder={placeholder}
                    className={`w-full resize-y rounded-lg border px-3 py-2.5 outline-none transition ${
                        disabled || readOnly
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
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
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
                className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${
                    disabled || readOnly
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
            />
        </label>
    );
};

const LecturasSecadorForm = ({
    data = {},
    equipo = {},
    onChange
}) => {
    const valores = {
        ...data,

        marca:
            equipo?.marca ??
            data?.marca ??
            '',

        modelo:
            equipo?.modelo ??
            data?.modelo ??
            '',

        serie:
            equipo?.serie ??
            data?.serie ??
            ''
    };

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-indigo-600" />

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Parámetros del secador
                    </h3>

                    <p className="text-sm text-slate-500">
                        Complete las lecturas correspondientes al secador.
                    </p>
                </div>
            </div>

            {lecturas_secador.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen campos configurados para las lecturas del secador.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {lecturas_secador.map((field) => (
                        <CampoFormulario
                            key={
                                field.id ??
                                field.name
                            }
                            field={field}
                            value={
                                valores[field.name]
                            }
                            onChange={onChange}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default LecturasSecadorForm;