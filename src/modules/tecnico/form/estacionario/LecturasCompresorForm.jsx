// src/modules/ServicioTecnico/forms/estacionario/LecturasCompresorForm.jsx
import { Gauge } from 'lucide-react';
import { lecturas_compresor } from '../Data.js';

const CampoFormulario = ({
    field,
    value,
    onChange
}) => {
    const {
        id,
        name,
        placeholder,
        type = 'text',
        options = [],
        disabled = false,
        readOnly = false
    } = field;

    const handleChange = (event) => {
        if (disabled || readOnly) {
            return;
        }

        onChange?.(
            name,
            type === 'checkbox'
                ? event.target.checked
                : event.target.value
        );
    };

    if (type === 'select') {
        return (
            <label
                htmlFor={id}
                className="block"
            >
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {placeholder}
                </span>

                <select
                    id={id}
                    name={name}
                    value={value ?? ''}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${disabled
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }`}
                >
                    <option value="">
                        Seleccione una opción
                    </option>

                    {options.map((option) => {
                        const optionValue =
                            option?.value ??
                            option?.id ??
                            option;

                        const optionLabel =
                            option?.label ??
                            option?.nombre ??
                            option?.name ??
                            option;

                        return (
                            <option
                                key={String(optionValue)}
                                value={optionValue}
                            >
                                {optionLabel}
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
                htmlFor={id}
                className="block"
            >
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {placeholder}
                </span>

                <textarea
                    id={id}
                    name={name}
                    value={value ?? ''}
                    onChange={handleChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    rows={4}
                    placeholder={placeholder}
                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition ${disabled || readOnly
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
                htmlFor={id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
                <input
                    id={id}
                    name={name}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={handleChange}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <span className="text-sm font-semibold text-slate-700">
                    {placeholder}
                </span>
            </label>
        );
    }

    return (
        <label
            htmlFor={id}
            className="block"
        >
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {placeholder}
            </span>

            <input
                id={id}
                name={name}
                type={type}
                value={value ?? ''}
                onChange={handleChange}
                disabled={disabled}
                readOnly={readOnly}
                step={
                    type === 'number'
                        ? 'any'
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

const LecturasCompresorForm = ({
    data = {},
    equipo = {},
    onChange
}) => {
    /*
     * Marca, modelo y serie vienen del equipo registrado.
     * Se mezclan con las lecturas para mostrarlas automáticamente.
     */
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
                <Gauge className="h-5 w-5 text-indigo-600" />

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Lecturas del compresor
                    </h3>

                    <p className="text-sm text-slate-500">
                        La marca, modelo y serie se cargan automáticamente desde el equipo.
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {lecturas_compresor.map((field) => (
                    <CampoFormulario
                        key={field.id ?? field.name}
                        field={field}
                        value={valores[field.name]}
                        onChange={onChange}
                    />
                ))}
            </div>
        </section>
    );
};

export default LecturasCompresorForm;