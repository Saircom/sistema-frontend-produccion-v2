import React from 'react';

function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
            <div className="max-w-md space-y-6">
                {/* Icono decorativo de construcción */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="h-12 w-12 animate-pulse"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A1.79 1.79 0 1 1 14.75 23.5l-5.83-5.83m.92-2.51 5.62-5.62m-5.62 5.62L3 21H1.5L3 19.5v-3m11.42-1.33 3.47-3.47m-3.47 3.47-1.33 1.33m1.33-1.33-1.74-1.74m4.33-4.33-1.33 1.33m1.33-1.33-1.74-1.74m3.07-3.07L21 6.5M16.5 2H18l-1.5 1.5v3M15 11.42l-5.62 5.62M15 11.42l1.33-1.33M9.38 17.04l-1.33 1.33M16.33 10.1l-1.74-1.74m-5.21 5.21-1.74-1.74m7.13-7.13L13.5 3.5M12 2H10.5L12 3.5v3" />
                    </svg>
                </div>

                {/* Textos */}
                <div className="space-y-2">
                    <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Página en Desarrollo
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Estamos construyendo algo increíble aquí. Esta sección aún no está lista, pero volveremos pronto.
                    </p>
                </div>

                {/* Botón */}
                <div className="pt-2">
                    <button 
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className="mr-2 h-4 w-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Volver atrás
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFound;