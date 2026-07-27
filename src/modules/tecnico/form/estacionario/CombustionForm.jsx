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
                    label="Oxígeno O₂"
                    name="oxigeno"
                    value={data.oxigeno}
                    onChange={onChange}
                />

                <Campo
                    label="Monóxido de carbono CO"
                    name="monoxido_carbono"
                    value={data.monoxido_carbono}
                    onChange={onChange}
                />

                <Campo
                    label="Dióxido de carbono CO₂"
                    name="dioxido_carbono"
                    value={data.dioxido_carbono}
                    onChange={onChange}
                />

                <Campo
                    label="Temperatura de gases"
                    name="temperatura_gases"
                    value={data.temperatura_gases}
                    onChange={onChange}
                />

                <Campo
                    label="Temperatura ambiente"
                    name="temperatura_ambiente"
                    value={data.temperatura_ambiente}
                    onChange={onChange}
                />

                <Campo
                    label="Eficiencia"
                    name="eficiencia"
                    value={data.eficiencia}
                    onChange={onChange}
                />

                <Campo
                    label="Exceso de aire"
                    name="exceso_aire"
                    value={data.exceso_aire}
                    onChange={onChange}
                />

                <Campo
                    label="Tiro de chimenea"
                    name="tiro_chimenea"
                    value={data.tiro_chimenea}
                    onChange={onChange}
                />
            </div>
        </section>
    );
};

export default CombustionForm;