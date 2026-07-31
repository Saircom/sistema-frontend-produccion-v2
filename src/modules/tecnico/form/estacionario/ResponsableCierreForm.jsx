/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const ResponsableCierreForm = ({ data = {}, onChange }) => {
  const firmaRef = useRef(null);
  const [dibujando, setDibujando] = useState(!data.firma);

  useEffect(() => {
    if (dibujando && firmaRef.current && data.firma) firmaRef.current.fromDataURL(data.firma);
  }, [data.firma, dibujando]);

  const guardarTrazo = () => {
    if (firmaRef.current && !firmaRef.current.isEmpty()) {
      const origen = firmaRef.current.getCanvas();
      const destino = document.createElement('canvas');
      const anchoMaximo = 800;
      const escala = Math.min(1, anchoMaximo / origen.width);

      destino.width = Math.max(1, Math.round(origen.width * escala));
      destino.height = Math.max(1, Math.round(origen.height * escala));

      const contexto = destino.getContext('2d');
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, destino.width, destino.height);
      contexto.drawImage(origen, 0, 0, destino.width, destino.height);

      onChange('firma', destino.toDataURL('image/webp', 0.8));
    }
  };

  const limpiarFirma = () => {
    firmaRef.current?.clear();
    onChange('firma', null);
    setDibujando(true);
  };

  return (
    <div className="space-y-5">
      <label className="block text-sm font-semibold text-slate-700">
        Nombre del responsable
        <input value={data.encargado || ''} maxLength={255} onChange={event => onChange('encargado', event.target.value)} placeholder="Opcional" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </label>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-sm font-semibold text-slate-700">Firma del responsable</p><p className="text-xs text-slate-500">Opcional y exclusiva para este informe.</p></div>
          <div className="flex gap-2">
            {data.firma && !dibujando && <button type="button" onClick={() => setDibujando(true)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700">Reemplazar</button>}
            <button type="button" onClick={limpiarFirma} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Quitar firma</button>
          </div>
        </div>
        {data.firma && !dibujando ? (
          <div className="flex min-h-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-3"><img src={data.firma} alt="Firma del responsable" className="max-h-40 max-w-full object-contain" /></div>
        ) : (
          <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white">
            <SignatureCanvas ref={firmaRef} penColor="#0f172a" onEnd={guardarTrazo} canvasProps={{ className: 'h-48 w-full', style: { touchAction: 'none' } }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsableCierreForm;
