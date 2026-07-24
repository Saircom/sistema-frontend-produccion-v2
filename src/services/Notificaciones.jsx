import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext.jsx';

const formatTime = value => new Date(value).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
});

function Notificaciones() {
    const { connected, notifications, unreadCount, markAllRead, clearNotifications } = useRealtime();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const close = event => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const toggle = () => {
        setOpen(value => !value);
        if (!open) markAllRead();
    };

    return (
        <div ref={containerRef} className="relative">
            <button type="button" onClick={toggle} aria-label="Notificaciones en tiempo real" aria-expanded={open}
                className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>

            {open && (
                <div className="fixed left-2 right-2 top-14 z-[70] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <h3 className="font-bold text-slate-900">Notificaciones</h3>
                            <p className={`flex items-center gap-1 text-xs ${connected ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                {connected ? 'Actualizaciones en tiempo real activas' : 'Reconectando...'}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button type="button" onClick={markAllRead} title="Marcar como leídas" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><CheckCheck size={17} /></button>
                            <button type="button" onClick={clearNotifications} title="Limpiar" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {!notifications.length ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-500">No hay notificaciones recientes.</div>
                        ) : notifications.map(item => (
                            <div key={item.id} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${item.read ? 'bg-white' : 'bg-blue-50'}`}>
                                <p className="text-sm font-medium text-slate-800">{item.message}</p>
                                <p className="mt-1 text-xs text-slate-500">{formatTime(item.receivedAt)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notificaciones;
