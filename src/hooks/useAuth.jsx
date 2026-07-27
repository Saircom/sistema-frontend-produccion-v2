import { useContext } from 'react';
import { AuthContext } from '../context/authContext';  // Ahora está correctamente exportado

export default function useAuth() {
  return useContext(AuthContext);
}
