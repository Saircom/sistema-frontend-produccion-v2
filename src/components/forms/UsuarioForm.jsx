/* eslint-disable react/prop-types */

const UsuarioForm = ({ formData, onChange, esEdicion, puedeEditarPassword = false, roles = [] }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">NOMBRES</label>
        <input 
          type="text" 
          name="nombres" 
          value={formData.nombres || ""} 
          onChange={onChange} 
          required 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">APELLIDOS</label>
        <input 
          type="text" 
          name="apellidos" 
          value={formData.apellidos || ""} 
          onChange={onChange} 
          required 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" 
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">CORREO</label>
        <input 
          type="email" 
          name="correo" 
          value={formData.correo || ""} 
          onChange={onChange} 
          required 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">CELULAR</label>
        <input 
          type="text" 
          name="celular" 
          value={formData.celular || ""} 
          onChange={onChange} 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" 
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">DNI</label>
        <input 
          type="text" 
          name="dni" 
          value={formData.dni || ""} 
          onChange={onChange} 
          required 
          maxLength={8} 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">ROL</label>
        <select 
          name="id_rol" 
          value={formData.id_rol || ""} 
          onChange={onChange} 
          required 
          className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase"
        >
          <option value="">SELECCIONE UN ROL</option>
          {roles.map(r => (
            <option key={r.id_rol} value={r.id_rol}>
              {r.nombre_rol ? r.nombre_rol.toUpperCase() : ""}
            </option>
          ))}
        </select>
      </div>
    </div>

    {(!esEdicion || puedeEditarPassword) && <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 ml-1 uppercase">
        {esEdicion ? "NUEVA CONTRASEÑA (DEJAR EN BLANCO PARA MANTENER)" : "CONTRASEÑA"}
      </label>
      <input 
        type="password" 
        name="password" 
        value={formData.password || ""} 
        onChange={onChange} 
        required={!esEdicion} 
        minLength={10}
        maxLength={128}
        autoComplete="new-password"
        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
      />
    </div>}
  </div>
);

export default UsuarioForm;
