// Tipos para la Programación de la Feria

export interface ProgramActivity {
  id?: string;
  category: string; // "CHARLAS Y CONVERSATORIOS", "TALLERES", "EXPOSICIONES", "FERIA EDITORIAL", etc.
  time: string; // "15:00"
  title: string;
  description?: string;
  location?: string; // "📍 Centro de Arte UNLP"
  link?: string; // Link al formulario de Google
  coordinator?: string;
}

export interface ProgramDay {
  day_number: number; // 1, 2, etc.
  date: Date | string; // Fecha del día
  date_label: string; // "Viernes 7 de noviembre"
  activities: ProgramActivity[];
}

export interface Program {
  id?: string;
  edition_id: string; // ID de la edición relacionada
  title: string; // "Festival Internacional de Fotografía Freezer 2025: Lo imposible"
  date_range: string; // "7 y 8 de noviembre de 2025"
  location: string; // "La Plata, Argentina"
  note?: string; // "Todas las charlas, exposiciones y la feria editorial son gratuitas."
  days: ProgramDay[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Categorías predefinidas (opcional, se puede usar texto libre también)
export const PROGRAM_CATEGORIES = [
  "EXPOSICIONES",
  "FERIA EDITORIAL",
  "CHARLAS Y CONVERSATORIOS",
  "TALLERES",
  "REVISIÓN DE PORTFOLIOS",
  "FIESTA DE CIERRE",
  "OTROS",
] as const;

export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];



