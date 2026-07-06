import { useState } from 'react';
import ViaticosList from './GastoList';
import ViaticoForm from './Gastoform';

export default function Viatico() {
  const [vista, setVista] = useState('lista');
  const [servicioActivo, setServicioActivo] = useState(null);

  const irAFormulario = (servicio) => {
    setServicioActivo(servicio);
    setVista('formulario');
  };

  return (
    <div >
      {vista === 'lista' ? (
        <ViaticosList onSeleccionar={irAFormulario} />
      ) : (
        <ViaticoForm data={servicioActivo} onVolver={() => setVista('lista')} />
      )}
    </div>
  );
}