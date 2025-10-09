import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "feriafotografia";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron archivos" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls: results.map((result: any) => result.secure_url),
    });
  } catch (error) {
    console.error("Error subiendo imágenes:", error);
    return NextResponse.json(
      { error: "Error al subir las imágenes" },
      { status: 500 }
    );
  }
}

