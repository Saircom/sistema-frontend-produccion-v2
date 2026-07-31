import api from './api.service.js';
import { offlineStore } from './offline.service.js';

let syncing = false;

export const syncPendingChanges = async () => {
    if (syncing || !navigator.onLine) return;
    syncing = true;
    try {
        const queue = await offlineStore.getQueue();
        for (const item of queue.sort((a, b) => a.id - b.id)) {
            try {
                await api.request({
                    method: item.method,
                    url: item.url,
                    data: item.data,
                    headers: { 'X-Offline-Operation-Id': `saircom-${item.id}` }
                });
                await offlineStore.removeQueueItem(item.id);
                window.dispatchEvent(new CustomEvent('saircom:sync-item', { detail: item }));
            } catch (error) {
                if (!error?.response || error.response.status >= 500) {
                    await offlineStore.updateQueueItem({
                        ...item,
                        attempts: (item.attempts || 0) + 1,
                        lastAttemptAt: new Date().toISOString()
                    });
                } else {
                    window.dispatchEvent(new CustomEvent('saircom:sync-error', {
                        detail: { item, status: error.response.status }
                    }));
                }
                break;
            }
        }
    } finally {
        syncing = false;
    }
};

export const startAutoSync = () => {
    window.addEventListener('online', syncPendingChanges);
    if (navigator.onLine) syncPendingChanges();
};
