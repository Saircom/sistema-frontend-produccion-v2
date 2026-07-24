import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './authContext.jsx';
import { connectSocket, disconnectSocket, socket } from '../services/socket.js';

const RESOURCE_LABELS = {
    clientes: 'Clientes', usuarios: 'Usuarios', equipos: 'Equipos', informes: 'Informes',
    lecturas: 'Lecturas', imagenes: 'Evidencias', firma: 'Firmas', gastos: 'Gastos',
    'viaticos-ot': 'Viáticos', tiempos: 'Tiempos', movilidades: 'Movilidades',
    cotizacion: 'Cotizaciones', cotizacion2: 'Cotizaciones', ordentrabajo: 'Órdenes de trabajo',
    'tecnico-ot': 'Trabajo técnico', 'informe-tecnico': 'Informes técnicos', servicios: 'Servicios'
};

const ACTION_LABELS = { POST: 'registró un nuevo cambio', PUT: 'fue actualizado', PATCH: 'cambió de estado', DELETE: 'fue eliminado' };
const RealtimeContext = createContext(null);

const describeChange = change => {
    if (change.message) return change.message;
    const resource = RESOURCE_LABELS[change.resource] || change.resource || 'El sistema';
    const action = ACTION_LABELS[change.action] || 'fue actualizado';
    return `${resource}: ${action}`;
};

// eslint-disable-next-line react/prop-types
export const RealtimeProvider = ({ children }) => {
    const { user } = useAuth();
    const [revision, setRevision] = useState(0);
    const [lastChange, setLastChange] = useState(null);
    const [connected, setConnected] = useState(socket.connected);
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const markAllRead = useCallback(() => {
        setNotifications(items => items.map(item => ({ ...item, read: true })));
    }, []);

    const clearNotifications = useCallback(() => setNotifications([]), []);

    useEffect(() => {
        if (!user) {
            disconnectSocket();
            setNotifications([]);
            return undefined;
        }

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        const onChange = change => {
            const message = describeChange(change);
            const notification = {
                ...change,
                id: `${change.timestamp || Date.now()}-${Math.random()}`,
                message,
                receivedAt: new Date().toISOString(),
                read: false
            };

            setLastChange(change);
            setRevision(value => value + 1);
            setNotifications(items => [notification, ...items].slice(0, 30));
            window.dispatchEvent(new CustomEvent('saircom:actualizado', { detail: change }));
            setToast(message);
            clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), 4500);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('sistema:actualizado', onChange);
        connectSocket();

        return () => {
            clearTimeout(toastTimer.current);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('sistema:actualizado', onChange);
            disconnectSocket();
        };
    }, [user]);

    const unreadCount = notifications.filter(item => !item.read).length;

    return (
        <RealtimeContext.Provider value={{
            revision, lastChange, connected, notifications, unreadCount, markAllRead, clearNotifications
        }}>
            {children}
            {toast && (
                <button type="button" onClick={() => setToast(null)}
                    className="fixed right-3 top-14 z-[9999] w-[calc(100vw-1.5rem)] max-w-sm rounded-xl border border-blue-200 bg-white p-4 text-left shadow-2xl sm:right-5">
                    <span className="block text-xs font-bold uppercase tracking-wide text-blue-600">Nuevo cambio en tiempo real</span>
                    <span className="mt-1 block text-sm font-medium text-slate-800">{toast}</span>
                </button>
            )}
        </RealtimeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) throw new Error('useRealtime debe usarse dentro de RealtimeProvider');
    return context;
};
