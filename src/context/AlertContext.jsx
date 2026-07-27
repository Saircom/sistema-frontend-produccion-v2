import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '../components/alerts/Alert'; // Asegura que la ruta importe tu componente Alert.jsx

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message, duration = 3000) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), duration);
  }, []);

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {/* Posicionamiento fijo para que la alerta flote sobre todo */}
      {alert && (
        <div className="fixed top-5 right-5 z-[9999] w-96 animate-fade-in">
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);