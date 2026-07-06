// hooks/usePersistedPage.js
import { useState, useEffect } from "react";

/**
 * Hook personalizado que guarda el valor de página en localStorage
 * @param {string} key Clave en localStorage
 * @param {number} defaultPage Valor por defecto
 */
export default function usePersistedPage(key, defaultPage = 0) {
    const [page, setPage] = useState(() => {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            const parsed = parseInt(saved, 10);
            return Number.isNaN(parsed) ? defaultPage : parsed;
        }
        return defaultPage;
    });

    useEffect(() => {
        localStorage.setItem(key, page);
    }, [key, page]);

    return [page, setPage];
}
