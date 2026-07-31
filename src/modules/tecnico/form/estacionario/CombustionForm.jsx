// src/modules/ServicioTecnico/forms/estacionario/CombustionForm.jsx
import { Flame } from 'lucide-react';

const Campo = ({
    label,
    name,
    value,
    onChange,
    type = 'number'
}) => (
    <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
            {label}
        </span>

        <input
            type={type}
            name={name}
            value={value ?? ''}
            onChange={(event) =>
                onChange(
                    name,
                    event.target.value
                )
            }
            step={type === 'number' ? 'any' : undefined}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
    </label>
);

const CombustionForm = ({
    data = {},
    onChange
}) => {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-indigo-600" />

                <h3 className="text-lg font-bold text-slate-900">
                    Lecturas de combustión
                </h3>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Campo
                    label="Marca"
                    name="marca_combu"
                    type="text"
                    value={data.marca_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Modelo"
                    name="modelo_combu"
                    type="text"
                    value={data.modelo_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Serie"
                    name="serie_combu"
                    type="text"
                    value={data.serie_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Voltaje"
                    name="voltaje_combu"
                    value={data.voltaje_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Presión de aceite"
                    name="presion_aceite_combu"
                    value={data.presion_aceite_combu}
                    onChange={onChange}
                />

                <Campo
                    label="RPM máximo"
                    name="rpm_maximo_combu"
                    value={data.rpm_maximo_combu}
                    onChange={onChange}
                />

                <Campo
                    label="RPM mínimo"
                    name="rpm_minimo_combu"
                    value={data.rpm_minimo_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Tipo de aceite"
                    name="tipo_aceite_combu"
                    type="text"
                    value={data.tipo_aceite_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Nivel de aceite"
                    name="nivel_aceite_combu"
                    type="text"
                    value={data.nivel_aceite_combu}
                    onChange={onChange}
                />

                <Campo
                    label="Nivel refrigerante"
                    name="nivel_refrigerante_combu"
                    type="text"
                    value={data.nivel_refrigerante_combu}
                    onChange={onChange}
                />
            </div>
        </section>
    );
};

export default CombustionForm;