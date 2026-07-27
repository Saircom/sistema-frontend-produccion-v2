import React from 'react';

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {/* Spinner con gradiente */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-blue-600 animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-[3px] border-transparent border-b-indigo-400 animate-spin animation-delay-150"></div>
            </div>
            
            {/* Texto elegante */}
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">
                    Procesando
                </span>
            </div>
        </div>
    );
};

export default Loading;