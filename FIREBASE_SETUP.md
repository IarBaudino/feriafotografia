# Configuración de Firebase para Localhost

## Problema: No se ven imágenes y textos en localhost

Si no puedes ver las imágenes y textos en localhost, es probable que falten las variables de entorno de Firebase.

## Solución

1. **Crea un archivo `.env.local` en la raíz del proyecto** con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
```

2. **Obtén estos valores desde Firebase Console:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a Configuración del proyecto (ícono de engranaje)
   - En "Tus aplicaciones", selecciona la app web o crea una nueva
   - Copia los valores de configuración

3. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## Verificar las Reglas de Firestore

Además, asegúrate de que las reglas de seguridad de Firestore permitan lectura pública para las colecciones que se muestran en el sitio público:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública para colecciones públicas
    match /about/{document=**} {
      allow read: if true;
    }
    match /calls/{document=**} {
      allow read: if true;
    }
    match /exhibitions/{document=**} {
      allow read: if true;
    }
    match /editions/{document=**} {
      allow read: if true;
    }
    match /team_members/{document=**} {
      allow read: if true;
    }
    match /events/{document=**} {
      allow read: if true;
    }
    match /images/{document=**} {
      allow read: if true;
    }
    match /site_settings/{document=**} {
      allow read: if true;
    }
    
    // Requerir autenticación para escritura
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

## Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca:
- ✅ Si ves errores sobre variables de entorno faltantes
- ✅ Si ves errores de permisos de Firestore
- ✅ Si ves errores de conexión

Los mensajes de error ahora son más detallados y te indicarán exactamente qué está fallando.

