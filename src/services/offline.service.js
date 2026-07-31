const DB_NAME = 'saircom-offline';
const DB_VERSION = 1;
const CACHE_STORE = 'cache';
const QUEUE_STORE = 'syncQueue';

const openDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE);
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
            db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const run = async (storeName, mode, operation) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
};

export const isNetworkError = (error) =>
    !navigator.onLine || !error?.response;

export const offlineStore = {
    get: key => run(CACHE_STORE, 'readonly', store => store.get(key)),
    set: (key, value) => run(CACHE_STORE, 'readwrite', store => store.put(value, key)),
    remove: key => run(CACHE_STORE, 'readwrite', store => store.delete(key)),
    enqueue: operation => run(QUEUE_STORE, 'readwrite', store => store.add({
        ...operation,
        createdAt: new Date().toISOString(),
        attempts: 0
    })),
    getQueue: () => run(QUEUE_STORE, 'readonly', store => store.getAll()),
    removeQueueItem: id => run(QUEUE_STORE, 'readwrite', store => store.delete(id)),
    updateQueueItem: item => run(QUEUE_STORE, 'readwrite', store => store.put(item))
};

export const cacheKeys = {
    user: 'auth:user',
    technicianReport: (technicianId, detailId) =>
        `report:technician:${technicianId}:${detailId}`,
    adminReport: detailId => `report:admin:${detailId}`,
    technicianOrders: technicianId => `orders:technician:${technicianId}`,
    technicianOrder: (technicianId, orderId) =>
        `order:technician:${technicianId}:${orderId}`
};
