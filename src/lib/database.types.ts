export type Database = {
  public: {
    Tables: {
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