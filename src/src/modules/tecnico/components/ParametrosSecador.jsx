// src/modules/ServicioTecnico/detalleInforme/ParametrosSecadorComponent.jsx
import React, {
  memo,
  useMemo
} from 'react';

import {
  Activity,
  HardDrive,
  Settings,
  Hash,
  Zap,
  Thermometer,
  Droplets,
  CalendarDays
} from 'lucide-react';

import DetailItem from './DetailItem.jsx';

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

const obtenerValor = (...valores) => {
  for (const valor of valores) {
    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ''
    ) {
      return valor;
    }
  }

  return 'No registrado';
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'No registrada';
  }

  const fechaConvertida = new Date(fecha);

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    'es-PE',
    {
      timeZone: 'America/Lima',
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  ).format(fechaConvertida);
};

const agregarUnidad = (
  valor,
  unidad
) => {
  if (
    valor === undefined ||
    valor === null ||
    valor === '' ||
    valor === 'No registrado'
  ) {
    return 'No registrado';
  }

  const texto = String(valor);

  if (
    texto
      .toLowerCase()
      .includes(
        unidad.toLowerCase()
      )
  ) {
    return texto;
  }

  return `${texto} ${unidad}`;
};

const ParametrosSecadorComponent = ({
  servicio = {}
}) => {
  const lecturaSecador = useMemo(
    () =>
      obtenerPrimerRegistro(
        servicio?.lecturas_secador
      ),
    [servicio?.lecturas_secador]
  );

  const parametros = [
    {
      label: 'Marca del secador',
      value: obtenerValor(
        lecturaSecador?.marca_secador,
        servicio?.marca_secador
      ),
      icon: HardDrive
    },
    {
      label: 'Modelo del secador',
      value: obtenerValor(
        lecturaSecador?.modelo_secador,
        servicio?.modelo_secador
      ),
      icon: Settings
    },
    {
      label: 'N.° de serie del secador',
      value: obtenerValor(
        lecturaSecador?.serie_secador,
        servicio?.serie_secador
      ),
      icon: Hash
    },
    {
      label: 'Fecha de lectura',
      value: formatearFecha(
        lecturaSecador?.fecha_lectura
      ),
      icon: CalendarDays
    },
    {
      label: 'Voltaje del secador',
      value: obtenerValor(
        lecturaSecador?.voltaje_secador,
        servicio?.voltaje_secador
      ),
      icon: Zap
    },
    {
      label: 'Amperaje del secador',
      value: agregarUnidad(
        obtenerValor(
          lecturaSecador?.amperaje_secador
        ),
        'A'
      ),
      icon: Zap
    },
    {
      label: 'Punto de rocío',
      value: obtenerValor(
        lecturaSecador?.punto_rocio
      ),
      icon: Thermometer
    },
    {
      label: 'Tipo de refrigeración',
      value: obtenerValor(
        lecturaSecador?.tipo_refrigeracion,
        servicio?.tipo_refrigeracion
      ),
      icon: Droplets
    }
  ];

  const tieneLectura =
    Object.keys(
      lecturaSecador
    ).length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2">
          <Activity
            className="text-blue-600"
            size={22}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Parámetros del secador
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Información registrada durante la inspección del secador.
          </p>
        </div>
      </div>

      {!tieneLectura ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            No existen lecturas registradas para el secador.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {parametros.map(
            (parametro) => (
              <DetailItem
                key={
                  parametro.label
                }
                label={
                  parametro.label
                }
                value={
                  parametro.value
                }
                icon={
                  parametro.icon
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

ParametrosSecadorComponent.displayName =
  'ParametrosSecadorComponent';

export default memo(
  ParametrosSecadorComponent
);