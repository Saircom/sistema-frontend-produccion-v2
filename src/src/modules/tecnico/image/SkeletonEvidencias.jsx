import React from "react";

const SkeletonEvidencias = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 h-48 flex flex-col justify-between">
                    <div className="bg-slate-200 w-full h-32 rounded-xl"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mt-3"></div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonEvidencias;