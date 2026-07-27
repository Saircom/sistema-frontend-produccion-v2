// Definimos los tipos de roles
type UserRole = "admin" | "ventas" | "almacen" | "tecnicos";

// Interfaz para el usuario
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // Campo para la contraseña
  role: UserRole;
}

// Función para crear un usuario
function createUser(
  id: number,
  name: string,
  email: string,
  password: string,
  role: UserRole
): User {
  return {
    id,
    name,
    email,
    password,
    role,
  };
}

// Crear los usuarios con los roles correspondientes
const users: User[] = [
  createUser(1, "Rusbel Hilario", "admin@saircom.com", "admin123", "admin"),
  createUser(2, "Pilar Hilario", "ventas@saircom.com", "ventas123", "ventas"),
  createUser(3, "Carlos Miguel", "almacen@saircom.com", "almacen123", "almacen"),
  createUser(4, "Diego Hilario", "tecnicos@saircom.com", "tecnicos123", "tecnicos"),
];

// Mostrar los usuarios creados
console.log(users);
