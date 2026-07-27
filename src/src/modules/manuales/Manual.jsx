import React from 'react';

const Manual = () => {
    // Simulación de datos (puedes traerlos desde tu API/DB en el futuro)
    const manuales = [
        { id: 1, marca: 'Atlas Copco', modelo: 'GA 30', serie: 'ASP-12345', url: '/manuales/atlas_ga30.pdf' },
        { id: 2, marca: 'Ingersoll Rand', modelo: 'UP6', serie: 'IR-99887', url: '/manuales/ir_up6.pdf' },
        { id: 3, marca: 'Sullair', modelo: 'LS 16', serie: 'SL-55443', url: '/manuales/sullair_ls16.pdf' },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Manuales Técnicos</h2>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 border-b">Marca</th>
                            <th className="p-4 border-b">Modelo</th>
                            <th className="p-4 border-b">Serie</th>
                            <th className="p-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {manuales.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 border-b">
                                <td className="p-4">{item.marca}</td>
                                <td className="p-4">{item.modelo}</td>
                                <td className="p-4">{item.serie}</td>
                                <td className="p-4 text-center">
                                    <a
                                        href={item.url}
                                        download
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                                    >
                                        Descargar PDF
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Manual;