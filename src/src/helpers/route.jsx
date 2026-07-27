const routes = {
    login: '/login',
    inicio: '/inicio',
    usuarios: '/usuarios',
    clientes: '/clientes',

    //Dashboard 
    dashboardadministrador: '/dashboard-administrador',
    dashboardpostventa: '/panel-postventa',
    dashboardtecnico: '/panel-tecnico',
    // Nueva ruta para detalle de equipos por cliente
    equiposCliente: '/equipos/cliente/:id',
    // Lista general de reportes
    reportes: '/tecnicos/reportes',
    detalles: '/tecnicos/reportes/:id',
    listaServicio: '/servicio/lista',
    // Rutas para detalle (Administrador)
    detalleServicio: '/servicio/detalles-servicio/:id_servicio',
    calendario: '/servicio/calendario',
    historialinforme: '/servicio/historial-cliente/:serie',

    //Planner 
    listmovilidades: '/planner/movilidades',
    listsolicitud: '/planner/solicitud',

    //Informe tecnico
    informetecnicolist: '/informe-tecnico',

    //Movilidad
    movilidaddetalle: '/movilidad/:id',

    // Postventa
    listcotizacion: '/postventa/lista',


    cotizacion: '/postventa/cotizacion',
    solicitudservicio: '/postventa/solicitud',
    // Modulo de Tiempos 
    historialtiempos: '/servicio/tiempos',
    gastosServicio: '/servicio/gastos',

    manuales: '/manuales',
    // Rutas dinámicas para edición/creación específica
    equipoestacionario: '/servicio/estacionario/:id_servicio',
    equipoportatil: '/tecnicos/reportes/portatil/:id_servicio',
    error404: '/error404',
};

export default routes;