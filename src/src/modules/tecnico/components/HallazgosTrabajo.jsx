// src/modules/Tecnico/components/HallazgosTrabajo.jsx
import {
  ClipboardList,
  FileText,
  Users,
  Wrench
} from 'lucide-react';

import { memo, useMemo } from 'react';

const obtenerPrimerRegistro = (valor) => {
  if (Array.isArray(valor)) {
    return valor[0] ?? {};
  }

  if (
    valor &&
    typeof valor === 'object'
  ) {
    return valor;
  }

  return {};
};

const obtenerValor = (
  valor,
  valorAlternativo = 'No especificado'
) => {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return valorAlternativo;
  }

  return valor;
};


export const HallazgosTrabajo = memo(({
  servicio = {}
}) => {
  const detalleInforme = useMemo(
    () =>
      obtenerPrimerRegistro(
        servicio?.detalle_informe
      ),
    [servicio?.detalle_informe]
  );


  const descripcion =
    detalleInforme
      ?.descripcionTrabajo ??
    detalleInforme
      ?.descripcionTrabajo ??
    '';

  const recomendaciones =
    detalleInforme
      ?.recomendaciones ??
    '';

  const conclusiones =
    detalleInforme
      ?.conclusiones ??
    '';

  const tieneInforme = Boolean(
    descripcion ||
    recomendaciones ||
    conclusiones
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2">
          <FileText
            className="text-blue-600"
            size={22}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Hallazgos y trabajo realizado
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Resumen técnico del servicio ejecutado.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {!tieneInforme ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No se registraron hallazgos ni trabajo realizado.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Descripción del trabajo realizado
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {obtenerValor(
                  descripcion,
                  'No se registró descripción.'
                )}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Recomendaciones técnicas
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {obtenerValor(
                    recomendaciones,
                    'Sin recomendaciones registradas.'
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Conclusiones
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {obtenerValor(
                    conclusiones,
                    'Sin conclusiones registradas.'
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
});

HallazgosTrabajo.displayName =
  'HallazgosTrabajo';

export default HallazgosTrabajo;