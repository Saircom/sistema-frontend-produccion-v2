export const serviciosConGastos = [
  {
    id_servicio: 101,
    encargado: "David Lopez",
    cliente: "Minera Poderosa",
    estado: "completado",
    gastos_cabecera: {
      id_gasto_c: 50,
      cantidad_recibida: 200,
      estado_revision: "pendiente",
      observaciones: "",
      detalle: [
        {
          fecha: "2026-06-01",
          categoria: "alimentos",
          descripcion: "Almuerzo",
          monto: 20
        },
        {
          fecha: "2026-06-01",
          categoria: "pasaje",
          descripcion: "Taxi al aeropuerto",
          monto: 38
        }
      ]
    }
  }
];