export type Database = {
  public: {
    Tables: {
      calls: {
        Row: {
          id: string;
          created_at: string;
          is_active: boolean;
          deadline: string | null;
          feria_date: string | null;
          location: string | null;
          form_link: string;
          title: string;
          description: string;
          horario: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          is_active?: boolean;
          deadline?: string | null;
          feria_date?: string | null;
          location?: string | null;
          form_link: string;
          title: string;
          description: string;
          horario?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          is_active?: boolean;
          deadline?: string | null;
          feria_date?: string | null;
          location?: string | null;
          form_link?: string;
          title?: string;
          description?: string;
          horario?: string | null;
        };
      };
      exhibitions: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
        };
      };
      images: {
        Row: {
          id: string;
          url: string;
          alt: string;
          section: string;
          section_id: string;
          artist_name: string;
          artwork_title: string;
          social_media: string;
          is_main: boolean;
        };
        // ... similar para Insert y Update
      };
    };
  };
};
