# 🥖 El Bocatómetro — Guía Completa de Instalación y Despliegue

> Sigue esta guía de arriba a abajo. Ningún paso es opcional.

---

## ÍNDICE

1. [Requisitos previos](#1-requisitos-previos)
2. [Crear el proyecto](#2-crear-el-proyecto)
3. [Instalar dependencias](#3-instalar-dependencias)
4. [Configurar Supabase](#4-configurar-supabase)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Ejecutar en local](#6-ejecutar-en-local)
7. [Desplegar en Vercel](#7-desplegar-en-vercel)
8. [Conectar dominio propio](#8-conectar-dominio-propio)
9. [Cómo subir imágenes](#9-cómo-subir-imágenes)
10. [Cambiar el nombre del sitio](#10-cambiar-el-nombre-del-sitio)
11. [Solución de errores comunes](#11-solución-de-errores-comunes)

---

## 1. Requisitos previos

Antes de empezar necesitas tener instalado en tu ordenador:

### Node.js (versión 18 o superior)

Comprueba si lo tienes:
```bash
node --version
```
Si no lo tienes o la versión es antigua, descárgalo de: https://nodejs.org (elige "LTS")

### Git

```bash
git --version
```
Si no lo tienes: https://git-scm.com/downloads

### Una cuenta en Supabase (gratuita)

Regístrate en: https://supabase.com

### Una cuenta en Vercel (gratuita)

Regístrate en: https://vercel.com (puedes entrar con GitHub)

---

## 2. Crear el proyecto

Tienes dos opciones:

### Opción A — Copiar los archivos que te he generado

1. Crea una carpeta nueva en tu ordenador llamada `bocatometro`
2. Copia dentro todos los archivos que te he generado manteniendo la estructura de carpetas
3. Continúa en el paso 3

### Opción B — Crear desde cero con Next.js

```bash
# Ejecuta esto en tu terminal
npx create-next-app@latest bocatometro --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

# Entra en la carpeta
cd bocatometro
```

Luego reemplaza todos los archivos con los que te he generado.

---

## 3. Instalar dependencias

Desde dentro de la carpeta `bocatometro`:

```bash
npm install
```

Esto instala automáticamente todo lo que está en `package.json`:
- `@supabase/ssr` y `@supabase/supabase-js` — conexión con Supabase
- `framer-motion` — animaciones
- `lucide-react` — iconos
- `react-dropzone` — subida de imágenes con drag & drop
- `react-hot-toast` — notificaciones
- `clsx` y `tailwind-merge` — utilidades CSS

---

## 4. Configurar Supabase

### 4.1 Crear el proyecto en Supabase

1. Ve a https://supabase.com y entra en tu cuenta
2. Haz clic en **"New project"**
3. Ponle un nombre (ej: `bocatometro`)
4. Elige una contraseña para la base de datos (guárdala)
5. Elige la región más cercana a ti (ej: `West EU`)
6. Haz clic en **"Create new project"**
7. Espera unos 2 minutos hasta que esté listo

### 4.2 Ejecutar el esquema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (menú de la izquierda)
2. Haz clic en **"New query"**
3. Copia todo el contenido del archivo `supabase/schema.sql`
4. Pégalo en el editor
5. Haz clic en **"Run"** (o Ctrl+Enter)
6. Deberías ver: `Success. No rows returned`

Si ves errores, mira la sección [11. Solución de errores comunes](#11-solución-de-errores-comunes).

### 4.3 Verificar que las tablas se crearon

1. Ve a **Table Editor** en el menú de la izquierda
2. Deberías ver 4 tablas: `profiles`, `bocatas`, `reviews`, `comments`
3. Si no las ves, reejecutar el SQL

### 4.4 Verificar el bucket de Storage

1. Ve a **Storage** en el menú de la izquierda
2. Deberías ver un bucket llamado `bocata-images`
3. Si no existe, créalo manualmente:
   - Haz clic en **"New bucket"**
   - Nombre: `bocata-images`
   - Marca **"Public bucket"** ✓
   - Haz clic en **"Create bucket"**

### 4.5 Obtener las claves API

1. Ve a **Project Settings** (engranaje en el menú de la izquierda)
2. Haz clic en **"API"**
3. Copia:
   - **Project URL**: algo como `https://abcdefghijk.supabase.co`
   - **anon public key**: una clave larga que empieza por `eyJ...`

---

## 5. Variables de entorno

1. En la raíz del proyecto, crea un archivo llamado `.env.local` (exactamente ese nombre)
2. Copia el contenido de `.env.local.example` y rellénalo:

```bash
# Crea el archivo
cp .env.local.example .env.local
```

3. Ábrelo con cualquier editor de texto y rellena los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_SITE_NAME=El Bocatómetro
NEXT_PUBLIC_SITE_TAGLINE=El juicio final del bocadillo
```

**IMPORTANTE:** El archivo `.env.local` está en `.gitignore`, por lo que nunca se subirá a GitHub. Es solo para tu máquina local.

---

## 6. Ejecutar en local

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

Deberías ver la página principal del Bocatómetro. Si todo va bien, verás el estado vacío con el mensaje "Aún no hay bocatas".

Para parar el servidor: `Ctrl + C`

### Comandos útiles

```bash
npm run dev        # Servidor de desarrollo (con recarga automática)
npm run build      # Compila para producción (útil para detectar errores)
npm run start      # Inicia el servidor de producción (tras npm run build)
npm run lint       # Comprueba errores de código
```

---

## 7. Desplegar en Vercel

Vercel es la plataforma oficial de Next.js. El despliegue es gratuito y muy sencillo.

### 7.1 Subir el código a GitHub

```bash
# Desde dentro de la carpeta bocatometro:

# Inicializar Git
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "feat: bocatómetro inicial"

# Ir a github.com, crear un repositorio nuevo llamado "bocatometro" (sin README)
# Luego conectar y subir:

git remote add origin https://github.com/TU-USUARIO/bocatometro.git
git branch -M main
git push -u origin main
```

### 7.2 Conectar con Vercel

1. Ve a https://vercel.com y entra con tu cuenta GitHub
2. Haz clic en **"Add New... → Project"**
3. Importa el repositorio `bocatometro` de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. **No cambies nada de la configuración de build**
6. Antes de hacer clic en "Deploy", añade las variables de entorno:

### 7.3 Añadir variables de entorno en Vercel

En la pantalla de configuración del proyecto, busca **"Environment Variables"** y añade:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `tu-anon-key` |
| `NEXT_PUBLIC_SITE_NAME` | `El Bocatómetro` |
| `NEXT_PUBLIC_SITE_TAGLINE` | `El juicio final del bocadillo` |

7. Haz clic en **"Deploy"**
8. Espera 2-3 minutos
9. Vercel te dará una URL como `bocatometro.vercel.app` — ¡tu web ya está en internet!

### 7.4 Despliegues automáticos

Cada vez que hagas `git push`, Vercel redesplegará automáticamente tu web. Sin hacer nada más.

```bash
# Flujo de trabajo típico:
# 1. Haces cambios en el código
# 2. git add .
# 3. git commit -m "tu mensaje"
# 4. git push
# 5. Vercel lo despliega automáticamente en ~2 minutos
```

---

## 8. Conectar dominio propio

Si tienes un dominio (ej: `bocatometro.es`) puedes conectarlo fácilmente.

### 8.1 Desde Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Settings → Domains"**
3. Escribe tu dominio (ej: `bocatometro.es`)
4. Vercel te indicará qué registros DNS tienes que configurar

### 8.2 Configurar DNS

En el panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.):

**Si usas el dominio raíz** (`bocatometro.es`):
- Tipo: `A`
- Host: `@`
- Valor: `76.76.21.21`

**Si usas subdominio** (`www.bocatometro.es`):
- Tipo: `CNAME`
- Host: `www`
- Valor: `cname.vercel-dns.com`

Los cambios DNS pueden tardar entre 5 minutos y 48 horas en propagarse.

---

## 9. Cómo subir imágenes

Las imágenes se suben directamente desde el formulario "Añadir Bocata" (`/añadir`).

### Cómo funciona:

1. El usuario arrastra o selecciona imágenes en el paso 2 del formulario
2. Las imágenes se suben automáticamente al bucket `bocata-images` de Supabase Storage
3. Supabase devuelve una URL pública
4. Esa URL se guarda en la base de datos junto con el bocata

### Límites:

- Máximo 8 fotos por bocata
- Máximo 5MB por imagen
- Formatos aceptados: JPG, PNG, WEBP

### Si quieres ver/gestionar las imágenes:

1. Ve a tu proyecto en Supabase
2. Haz clic en **Storage** → **bocata-images**
3. Verás todas las imágenes organizadas en carpetas

### Si quieres eliminar imágenes:

Puedes hacerlo desde el panel de Storage de Supabase, o añadir esta funcionalidad al formulario de edición.

---

## 10. Cambiar el nombre del sitio

El nombre está centralizado en las variables de entorno, así que cambiarlos es trivial:

### En local:

Edita `.env.local`:
```env
NEXT_PUBLIC_SITE_NAME=El Bocadillómetro
NEXT_PUBLIC_SITE_TAGLINE=La justicia del pan relleno
```

Reinicia el servidor: `Ctrl+C` y `npm run dev`

### En producción (Vercel):

1. Ve a tu proyecto en Vercel
2. **Settings → Environment Variables**
3. Edita `NEXT_PUBLIC_SITE_NAME` y `NEXT_PUBLIC_SITE_TAGLINE`
4. Haz un nuevo despliegue (en Deployments → clic en los tres puntos → Redeploy)

---

## 11. Solución de errores comunes

### ❌ Error: "supabaseUrl is required"

**Causa:** Las variables de entorno no están configuradas.  
**Solución:** Comprueba que existe el archivo `.env.local` en la raíz del proyecto y que los valores están bien copiados.

```bash
# Comprueba que el archivo existe
ls -la .env.local

# Comprueba su contenido (no debería mostrar texto vacío)
cat .env.local
```

---

### ❌ Error: "relation 'bocatas' does not exist"

**Causa:** El esquema SQL no se ejecutó correctamente en Supabase.  
**Solución:** Ve al SQL Editor de Supabase y ejecuta de nuevo el archivo `schema.sql` completo.

---

### ❌ Error: "new row violates row-level security policy"

**Causa:** Las políticas RLS están activas y el usuario no tiene permiso.  
**Solución temporal** (para pruebas): En Supabase → Table Editor → selecciona la tabla → RLS → desactiva temporalmente.  
**Solución definitiva**: Comprueba que las políticas del `schema.sql` se ejecutaron correctamente.

---

### ❌ Error al subir imágenes: "Bucket not found"

**Causa:** El bucket `bocata-images` no existe en Supabase Storage.  
**Solución:**
1. Ve a Supabase → Storage
2. Crea un bucket llamado exactamente `bocata-images`
3. Marca la opción "Public bucket"

---

### ❌ Error: "Cannot find module '@/components/...'"

**Causa:** El alias `@/*` no está configurado en `tsconfig.json`.  
**Solución:** Comprueba que tu `tsconfig.json` tiene:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### ❌ Las imágenes no se muestran (aparece un dominio bloqueado)

**Causa:** El dominio de Supabase no está en la lista de dominios permitidos en Next.js.  
**Solución:** Edita `next.config.ts`:
```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',  // Esto debería cubrir todos
    },
  ],
}
```

Si el error persiste, copia la URL exacta del dominio (ej: `abcdefghijk.supabase.co`) y añádela explícitamente.

---

### ❌ Error en Vercel: "Build failed"

**Causa más común:** Falta una variable de entorno.  
**Solución:**
1. Ve a Vercel → tu proyecto → Settings → Environment Variables
2. Comprueba que todas las variables están añadidas
3. Haz clic en **Deployments** → el despliegue fallido → ver los logs
4. Los logs te dirán exactamente qué variable falta

---

### ❌ La web sale en blanco en móvil

**Causa:** Probablemente un error de JavaScript no capturado.  
**Solución:** Abre las DevTools del navegador (F12), ve a la pestaña Console y busca errores en rojo.

---

### ❌ Error: "slug already exists" al añadir bocata

**Causa:** Ya existe un bocata con el mismo nombre y local.  
**Solución:** El formulario ya muestra un mensaje específico. Añade más detalles al nombre (ej: "Bocata de Jamón — Bar Central 2024").

---

## ESTRUCTURA FINAL DE ARCHIVOS

```
bocatometro/
├── app/
│   ├── bocata/
│   │   └── [id]/
│   │       ├── not-found.tsx       ← 404 de bocata
│   │       ├── page.tsx            ← Página individual
│   │       └── ReviewSection.tsx   ← Reviews (client component)
│   ├── explorador/
│   │   └── page.tsx                ← Explorador A-Z
│   ├── hall-of-fame/
│   │   └── page.tsx                ← Hall of Fame
│   ├── ranking/
│   │   └── page.tsx                ← Ranking global
│   ├── añadir/
│   │   └── page.tsx                ← Formulario añadir bocata
│   ├── globals.css                 ← Estilos globales + fuentes
│   ├── layout.tsx                  ← Layout raíz (Navbar, Footer)
│   ├── loading.tsx                 ← Loading global
│   ├── not-found.tsx               ← 404 global
│   └── page.tsx                    ← Página principal
│
├── components/
│   ├── ui/
│   │   ├── Badge.tsx               ← Etiquetas/tags
│   │   ├── EmptyState.tsx          ← Estados vacíos
│   │   ├── Skeleton.tsx            ← Loading skeletons
│   │   └── StarRating.tsx          ← Estrellas + SliderInput
│   ├── BocataCard.tsx              ← Tarjeta bocata (normal y featured)
│   ├── Footer.tsx                  ← Pie de página
│   ├── ImageGallery.tsx            ← Galería con lightbox
│   ├── Navbar.tsx                  ← Barra de navegación
│   ├── RankingRow.tsx              ← Fila de ranking
│   └── ScoreBreakdown.tsx          ← Desglose de puntuaciones
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Cliente para componentes browser
│   │   ├── server.ts               ← Cliente para Server Components
│   │   └── types.ts                ← Tipos TypeScript completos
│   └── utils.ts                    ← Utilidades (cn, formatters, etc.)
│
├── supabase/
│   └── schema.sql                  ← Esquema completo de la BD
│
├── .env.local.example              ← Template de variables de entorno
├── .env.local                      ← TUS variables (no subir a Git)
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## FLUJO DE TRABAJO DIARIO

```bash
# 1. Arrancar el servidor de desarrollo
cd bocatometro
npm run dev

# 2. Abrir en el navegador
# http://localhost:3000

# 3. Hacer cambios en el código (se recarga automáticamente)

# 4. Cuando estés listo para subir cambios a producción:
git add .
git commit -m "descripción del cambio"
git push
# Vercel lo despliega automáticamente
```

---

## PRÓXIMOS PASOS (mejoras opcionales)

Una vez que la web esté funcionando, estas son las mejoras más interesantes:

1. **Autenticación real** — Activar Supabase Auth para que los usuarios tengan cuenta propia
2. **Panel de admin** — Gestionar bocatas, marcar Hall of Fame, editar
3. **Búsqueda** — Añadir búsqueda por nombre o local
4. **Compartir** — Botones de compartir en redes sociales
5. **PWA** — Hacer la web instalable en móvil
6. **Notificaciones** — Alertas cuando alguien review tu bocata favorito

---

*¿Algún problema? Repasa la sección 11 o abre un issue en GitHub.*
