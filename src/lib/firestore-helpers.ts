import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Helper para obtener todos los documentos de una colección
export async function getCollection(collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const result = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Eliminar el campo 'id' interno si existe (de migraciones de Supabase)
      const { id: _, ...cleanData } = data as any;
      return {
        id: doc.id, // Usar siempre el ID real del documento de Firestore
        ...cleanData,
      };
    });
    return result;
  } catch (error: any) {
    console.error(`❌ Error getting collection ${collectionName}:`, error);
    console.error("Detalles del error:", {
      message: error?.message,
      code: error?.code,
      collection: collectionName,
    });
    
    if (error?.code === 'permission-denied') {
      console.error("⚠️ Error de permisos: Verifica las reglas de seguridad de Firestore");
      console.error("Las reglas deben permitir lectura pública para las colecciones que se muestran en el sitio público");
    } else if (error?.code === 'unavailable') {
      console.error("⚠️ Error de conexión: Firebase no está disponible");
    }
    
    throw error;
  }
}

// Helper para obtener un documento por ID
export async function getDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Eliminar el campo 'id' interno si existe (de migraciones de Supabase)
      const { id: _, ...cleanData } = data as any;
      return {
        id: docSnap.id, // Usar siempre el ID real del documento de Firestore
        ...cleanData,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      `Error getting document ${docId} from ${collectionName}:`,
      error
    );
    throw error;
  }
}

// Helper para obtener documentos con filtros
export async function getDocumentsWithFilter(
  collectionName: string,
  field: string,
  value: any
) {
  try {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Eliminar el campo 'id' interno si existe (de migraciones de Supabase)
      const { id: _, ...cleanData } = data as any;
      return {
        id: doc.id, // Usar siempre el ID real del documento de Firestore
        ...cleanData,
      };
    });
  } catch (error) {
    console.error(
      `Error getting filtered documents from ${collectionName}:`,
      error
    );
    throw error;
  }
}

// Helper para agregar un documento
export async function addDocument(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

// Helper para actualizar un documento
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: any
) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(
      `Error updating document ${docId} in ${collectionName}:`,
      error
    );
    throw error;
  }
}

// Helper para eliminar un documento
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(
      `Error deleting document ${docId} from ${collectionName}:`,
      error
    );
    throw error;
  }
}

// Helper para convertir fechas de Firestore
export function convertFirestoreDates(data: any) {
  if (!data) return data;

  const converted = { ...data };

  // Convertir Timestamps a Date
  Object.keys(converted).forEach((key) => {
    if (
      converted[key] &&
      converted[key].toDate &&
      typeof converted[key].toDate === "function"
    ) {
      converted[key] = converted[key].toDate();
    }
  });

  return converted;
}

// Helper para eliminar duplicados por URL
export function removeDuplicateImages(images: any[]) {
  if (!images || images.length === 0) return images;

  // Función para extraer la URL base sin parámetros de versión
  const getBaseUrl = (url: string) => {
    if (!url) return url;
    // Remover parámetros de versión de Cloudinary (v1234567890)
    return url.replace(/\/v\d+\//, "/");
  };

  const uniqueImages = images.filter((img, index, self) => {
    const baseUrl = getBaseUrl(img.url);
    const firstIndex = self.findIndex((t) => getBaseUrl(t.url) === baseUrl);
    return firstIndex === index;
  });

  return uniqueImages;
}
