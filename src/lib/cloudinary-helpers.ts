/**
 * Helper para aplicar transformaciones de Cloudinary a las URLs
 * Esto evita que Next.js Image optimice a través de Vercel y consume las transformaciones de Cloudinary
 */

/**
 * Verifica si una URL es de Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Aplica transformaciones de Cloudinary a una URL
 * @param url - URL original de Cloudinary
 * @param options - Opciones de transformación
 * @returns URL con transformaciones aplicadas
 */
export function getCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "fit" | "scale" | "thumb" | "crop";
    gravity?: "auto" | "center" | "face" | "faces";
    fetchFormat?: "auto";
  } = {}
): string {
  // Si no es una URL de Cloudinary, devolver la URL original
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  // Construir la cadena de transformaciones (solo las esenciales)
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  // Si no hay transformaciones, devolver la URL original
  if (transformations.length === 0) {
    return url;
  }

  const transformationString = transformations.join(",");

  // Separar parámetros de query si existen
  const urlParts = url.split("?");
  const baseUrl = urlParts[0];
  const queryParams = urlParts[1] ? `?${urlParts[1]}` : "";
  
  // Insertar las transformaciones en la URL de Cloudinary
  // Formato: https://res.cloudinary.com/cloud_name/image/upload/[transformaciones]/v1234567890/folder/image.jpg
  const uploadIndex = baseUrl.indexOf("/upload/");
  if (uploadIndex === -1) {
    return url;
  }

  const beforeUpload = baseUrl.substring(0, uploadIndex + "/upload/".length);
  const afterUpload = baseUrl.substring(uploadIndex + "/upload/".length);

  // Verificar si ya hay transformaciones en la URL (empiezan con letras seguidas de _)
  // Si ya hay transformaciones, reemplazarlas
  const parts = afterUpload.split("/");
  const firstPart = parts[0];
  
  // Verificar si el primer segmento después de /upload/ es una transformación
  // Las transformaciones tienen formato: w_500,h_500,c_fill (con comas y guiones bajos)
  if (firstPart && /^[a-z]+_[^/]+/.test(firstPart) && firstPart.includes(",")) {
    // Ya hay transformaciones, reemplazarlas
    const newUrl = `${beforeUpload}${transformationString}/${parts.slice(1).join("/")}`;
    return `${newUrl}${queryParams}`;
  }

  // No hay transformaciones, insertarlas antes del resto de la ruta
  const newUrl = `${beforeUpload}${transformationString}/${afterUpload}`;
  return `${newUrl}${queryParams}`;
}

/**
 * Obtiene una URL optimizada de Cloudinary para el componente Image de Next.js
 * Aplica transformaciones automáticas basadas en el tamaño solicitado
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  width: number,
  height?: number
): string {
  // Simplificar: solo usar transformaciones esenciales para evitar errores 400
  const options: Parameters<typeof getCloudinaryUrl>[1] = {
    width,
    quality: "auto",
    format: "auto",
  };
  
  if (height) {
    options.height = height;
    options.crop = "fill";
  } else {
    options.crop = "scale";
  }
  
  const result = getCloudinaryUrl(url, options);
  console.log("🔧 Cloudinary URL transform:", {
    original: url,
    width,
    height,
    result,
  });
  return result;
}

