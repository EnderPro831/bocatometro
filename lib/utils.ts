import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convierte una nota (1-10) en emoji descriptivo
export function scoreToEmoji(score: number): string {
  if (score >= 9) return '🏆'
  if (score >= 8) return '🌟'
  if (score >= 7) return '😋'
  if (score >= 6) return '👍'
  if (score >= 5) return '😐'
  if (score >= 4) return '😑'
  if (score >= 3) return '😬'
  return '💀'
}

// Convierte una nota en descripción textual
export function scoreToLabel(score: number): string {
  if (score >= 9.5) return 'Obra Maestra'
  if (score >= 9) return 'Legendario'
  if (score >= 8) return 'Excepcional'
  if (score >= 7) return 'Muy Bueno'
  if (score >= 6) return 'Notable'
  if (score >= 5) return 'Aceptable'
  if (score >= 4) return 'Flojo'
  if (score >= 3) return 'Decepcionante'
  return 'Criminal'
}

// Color de la nota
export function scoreToColor(score: number): string {
  if (score >= 8) return 'text-green-700 dark:text-green-400'
  if (score >= 6) return 'text-bocata-mustard dark:text-yellow-400'
  if (score >= 4) return 'text-orange-500'
  return 'text-bocata-red'
}

// Genera slug desde el nombre
export function generateSlug(name: string, place?: string): string {
  const base = place ? `${name} ${place}` : name
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Formatea fecha en español
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Formatea precio
export function formatPrice(price: number | null): string {
  if (!price) return '—'
  return `${price.toFixed(2)} €`
}

// Obtiene la primera letra para el explorador
export function getFirstLetter(name: string): string {
  return name.charAt(0).toUpperCase()
}

// Colores de badges/etiquetas
export const TAG_COLORS: Record<string, string> = {
  legendario: 'bg-amber-100 text-amber-800 border-amber-300',
  criminal: 'bg-red-100 text-red-800 border-red-300',
  'seca gargantas': 'bg-orange-100 text-orange-800 border-orange-300',
  destructor: 'bg-rose-100 text-rose-800 border-rose-300',
  clásico: 'bg-stone-100 text-stone-800 border-stone-300',
  imprescindible: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'hall-of-fame': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  sobredimensionado: 'bg-purple-100 text-purple-800 border-purple-300',
  infravalorado: 'bg-blue-100 text-blue-800 border-blue-300',
  'trampa turística': 'bg-slate-100 text-slate-800 border-slate-300',
  'obra maestra': 'bg-amber-100 text-amber-900 border-amber-400',
  peligroso: 'bg-red-100 text-red-900 border-red-400',
}

// Subir imagen a Supabase Storage
export async function uploadImage(
  supabase: ReturnType<typeof import('./supabase/client').createClient>,
  file: File,
  folder: string = 'bocatas'
): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('bocata-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error subiendo imagen:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('bocata-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
