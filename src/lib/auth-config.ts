// Configuración de autenticación
export const AUTH_CONFIG = {
  // Lista de emails autorizados para crear cuentas de administrador
  AUTHORIZED_EMAILS: [
    "feriadefotografia@gmail.com",
    // Agregar aquí tu email personal cuando quieras
    // 'tu-email@gmail.com',
  ],

  // Número máximo de cuentas de administrador permitidas
  MAX_ADMIN_ACCOUNTS: 2,

  // Configuración de contraseñas
  PASSWORD_MIN_LENGTH: 6,
};

// Función helper para verificar si un email está autorizado
export const isEmailAuthorized = (email: string): boolean => {
  return (AUTH_CONFIG.AUTHORIZED_EMAILS as readonly string[]).includes(
    email.toLowerCase()
  );
};

// Función helper para obtener la lista de emails autorizados
export const getAuthorizedEmails = (): string[] => {
  return [...AUTH_CONFIG.AUTHORIZED_EMAILS];
};
