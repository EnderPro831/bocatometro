// ============================================================
// Tipos TypeScript para la base de datos del Bocatómetro
// ============================================================

export type Tag =
  | 'legendario'
  | 'criminal'
  | 'seca gargantas'
  | 'destructor'
  | 'clásico'
  | 'imprescindible'
  | 'hall-of-fame'
  | 'sobredimensionado'
  | 'infravalorado'
  | 'trampa turística'
  | 'obra maestra'
  | 'peligroso'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  bocatas_reviewed: number
  created_at: string
  updated_at: string
}

export interface Bocata {
  id: string
  slug: string
  name: string
  place_name: string | null
  place_address: string | null
  place_city: string
  description: string | null
  cover_image_url: string | null
  images: string[]
  tags: string[]
  is_hall_of_fame: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Puntuaciones calculadas
  avg_score: number
  avg_pan: number
  avg_relleno: number
  avg_calidad_precio: number
  avg_tamano: number
  avg_destruccion: number
  total_reviews: number
  // Joins opcionales
  profiles?: Profile
  reviews?: Review[]
}

export interface Review {
  id: string
  bocata_id: string
  author_id: string | null
  author_name: string
  score_pan: number
  score_relleno: number
  score_calidad_precio: number
  score_tamano: number
  score_destruccion: number
  score_total: number
  title: string | null
  body: string
  eaten_at: string | null
  price_paid: number | null
  would_repeat: boolean
  created_at: string
  updated_at: string
  // Joins opcionales
  bocatas?: Bocata
  profiles?: Profile
  comments?: Comment[]
}

export interface Comment {
  id: string
  bocata_id: string
  review_id: string | null
  author_id: string | null
  author_name: string
  body: string
  created_at: string
}

// Tipo para el formulario de nuevo bocata
export interface NewBocataForm {
  name: string
  place_name: string
  place_address: string
  place_city: string
  description: string
  tags: string[]
}

// Tipo para el formulario de nueva review
export interface NewReviewForm {
  bocata_id: string
  author_name: string
  title: string
  body: string
  score_pan: number
  score_relleno: number
  score_calidad_precio: number
  score_tamano: number
  score_destruccion: number
  eaten_at: string
  price_paid: string
  would_repeat: boolean
}

// Database types (para Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'bocatas_reviewed' | 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      bocatas: {
        Row: Bocata
        Insert: Omit<Bocata, 'id' | 'created_at' | 'updated_at' | 'avg_score' | 'avg_pan' | 'avg_relleno' | 'avg_calidad_precio' | 'avg_tamano' | 'avg_destruccion' | 'total_reviews' | 'profiles' | 'reviews'>
        Update: Partial<Bocata>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'score_total' | 'created_at' | 'updated_at' | 'bocatas' | 'profiles' | 'comments'>
        Update: Partial<Review>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Comment>
      }
    }
  }
}
