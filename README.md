# Gestor de Notas

Aplicacion web SPA para la gestion de notas personales con soporte de adjuntos PDF. Construida con Vue 3, Vite y Pinia en el frontend, y un backend Express desplegado de forma independiente. Los archivos adjuntos se persisten en Cloudinary, lo que permite mantener el almacenamiento entre reinicios del servidor sin depender del filesystem efimero del hosting.

**Demo publica:** [https://gestor-notas-topaz.vercel.app](https://gestor-notas-topaz.vercel.app)

---

## Tecnologias utilizadas

### Frontend

- Vue 3 (Composition API)
- Vite 6
- Pinia (estado global)
- Vue Router (hash mode)
- Axios (cliente HTTP)
- CSS Modules (estilos por componente)
- vue-toastification (notificaciones)
- lucide-vue-next (iconografia)

### Backend

- Node.js 18+
- Express 4
- Multer (upload en memoria)
- Cloudinary API (raw upload, unsigned preset, codificacion base64)
- CORS configurable por variable de entorno

---

## Funcionalidades principales

- CRUD completo de notas (crear, leer, editar, eliminar)
- Edicion inline con doble clic en escritorio
- Navegacion a formulario completo en dispositivos moviles
- Busqueda por titulo o contenido
- Ordenamiento por fecha de creacion
- Paginacion con controles de navegacion
- Agrupacion temporal: Hoy, Ayer, Esta semana, Anteriores
- Adjuntos PDF con persistencia real en Cloudinary
- Visualizacion directa de PDF en el navegador (sin forzar descarga)
- Descarga de adjuntos cuando corresponde
- Autenticacion demo (cualquier correo y contrasena no vacios)
- Modo demo / modo mock como fallback cuando el backend no esta disponible
- UI responsive optimizada para escritorio y movil

---

## Arquitectura

| Capa | Tecnologia | Hosting |
|------|-----------|---------|
| Frontend SPA | Vue 3 + Vite + Pinia + Vue Router | Vercel |
| Backend API | Express 4 + Multer | Render |
| Almacenamiento de archivos | Cloudinary (raw/upload, preset unsigned) | Cloudinary |

El frontend se comunica con el backend a traves de una API REST. Cuando el usuario sube un PDF, el archivo llega al backend a traves de Multer (almacenamiento en memoria), se convierte a un data URI en base64 y se envia a Cloudinary como recurso de tipo `raw`. La URL publica resultante se almacena junto con la nota y se entrega directamente al navegador del usuario.

Si el backend no esta disponible o las variables de Cloudinary no estan configuradas, el sistema puede operar en modo mock local (sin persistencia de archivos entre sesiones).

---

## Manejo de adjuntos PDF

El flujo de subida de archivos sigue estos pasos:

1. El usuario selecciona un PDF desde el formulario de creacion o edicion de notas.
2. El frontend envia el archivo como `FormData` (sin header `Content-Type` explicito para que Axios genere el boundary correcto).
3. El backend recibe el archivo con Multer en modo memoria.
4. El buffer del archivo se codifica como data URI base64 (`data:application/pdf;base64,...`).
5. Se construye un `FormData` con el data URI, el `upload_preset` unsigned y la carpeta de destino.
6. Se envia a la API de Cloudinary como recurso `raw`.
7. La URL publica (`secure_url`) se asocia a la nota.

Para la visualizacion, los enlaces apuntan directamente a la URL de Cloudinary con `target="_blank"` y `rel="noopener noreferrer"`, lo que permite que el navegador renderice el PDF de forma nativa.

---

## Compatibilidad y correcciones en dispositivos moviles

### Problema original

En dispositivos Android, los enlaces a PDFs externos con `target="_blank"` presentaban un comportamiento inconsistente: en algunos navegadores el enlace no se abria, o el sistema lo bloqueaba silenciosamente sin dar feedback al usuario. Esto afectaba directamente la funcionalidad principal de visualizacion de adjuntos.

### Causa

Los navegadores moviles (especialmente Chrome en Android) pueden bloquear o ignorar la apertura de nuevas pestanas cuando el clic se procesa de forma asincrona o cuando el atributo `target="_blank"` no se maneja dentro del contexto de un gesto directo del usuario. El comportamiento varia segun el dispositivo, la version del navegador y la politica de popups.

### Solucion implementada

Se agrego un handler de clic programatico en todos los componentes que renderizan enlaces a PDF (`NoteCard`, `NoteDetail`, `NoteForm`). En dispositivos moviles (detectados via `navigator.userAgent`), el handler intercepta el evento del enlace y ejecuta `window.open(href, '_blank', 'noopener,noreferrer')` de forma sincrona dentro del gesto del usuario:

```js
export function openAttachment(event, attachment) {
  if (!isMobileDevice()) return

  const href = sanitizeExternalUrl(attachment?.url || '')
  if (!href || href.startsWith('data:') || href.startsWith('blob:')) return

  event.preventDefault()
  window.open(href, '_blank', 'noopener,noreferrer')
}
```

En escritorio, el handler no interviene y el enlace funciona de forma nativa.

### Resultado

Los PDFs se abren correctamente en Android y iOS sin ser bloqueados, manteniendo el mismo comportamiento estable en navegadores de escritorio.

### Selector de archivos en edicion movil

Adicionalmente, se detecto que al editar una nota en movil el campo de seleccion de archivos no era visible, ya que la edicion inline no incluye input de archivo. La solucion fue redirigir siempre al formulario completo (`NoteForm`) al editar en movil, en lugar de activar el modo de edicion inline.

---

## Modo demo

La aplicacion soporta tres modos de operacion controlados por la variable `VITE_API_MODE`:

| Valor | Comportamiento |
|-------|---------------|
| `demo` | Conecta al backend Express (produccion y desarrollo) |
| `real` | Conecta a una API externa configurable |
| `mock` | Usa datos mock locales del frontend, sin backend |

Cuando el modo es `demo`, el backend acepta cualquier combinacion de correo y contrasena no vacios como autenticacion valida. Esto permite probar el flujo completo sin credenciales reales.

---

## Instalacion y ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/dienton82/Gestor-de-Notas.git
cd Gestor-de-Notas
```

### 2. Instalar dependencias

```bash
npm install
npm --prefix backend install
```

### 3. Configurar variables de entorno

Crear `.env` en la raiz del proyecto y `backend/.env` dentro de la carpeta backend (ver seccion de variables de entorno mas abajo).

### 4. Ejecutar en desarrollo

Backend:

```bash
npm run dev:backend
```

Frontend (en otra terminal):

```bash
npm run dev
```

### 5. Build de produccion

```bash
npm run build
```

---

## Variables de entorno

### Frontend (.env)

```bash
VITE_API_MODE=demo
VITE_DEMO_API_URL=http://localhost:4000
VITE_APP_BASE_PATH=/
```

### Backend (backend/.env)

```bash
PORT=4000
PUBLIC_API_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UNSIGNED_UPLOAD_PRESET=
CLOUDINARY_UPLOAD_FOLDER=gestor-notas-demo
```

| Variable | Descripcion |
|----------|------------|
| `PORT` | Puerto del servidor Express |
| `PUBLIC_API_URL` | URL publica del backend |
| `ALLOWED_ORIGINS` | Dominios permitidos por CORS, separados por coma |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_UNSIGNED_UPLOAD_PRESET` | Nombre del preset unsigned para subida de PDFs |
| `CLOUDINARY_UPLOAD_FOLDER` | Carpeta de destino en Cloudinary |

Si las variables de Cloudinary no estan definidas, el backend utiliza almacenamiento local como fallback (no persistente entre reinicios en Render).

---

## Despliegue

### Frontend en Vercel

| Campo | Valor |
|-------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Variables requeridas en Vercel:

```bash
VITE_API_MODE=demo
VITE_DEMO_API_URL=https://gestor-de-notas-8h9n.onrender.com
VITE_APP_BASE_PATH=/
```

### Backend en Render

| Campo | Valor |
|-------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |

Variables requeridas en Render:

```bash
PORT=4000
PUBLIC_API_URL=https://gestor-de-notas-8h9n.onrender.com
ALLOWED_ORIGINS=https://gestor-notas-topaz.vercel.app
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_UNSIGNED_UPLOAD_PRESET=<tu-preset>
CLOUDINARY_UPLOAD_FOLDER=gestor-notas-demo
```

### Configuracion requerida en Cloudinary

1. Crear un **Upload Preset** con modo **Unsigned** y delivery type **Upload** (no Authenticated).
2. En **Settings > Security**, activar **"Allow delivery of PDF and ZIP files"**.
3. Verificar que **Strict transformations** este deshabilitado.

---

## Estructura del proyecto

```
gestor-notas/
  backend/
    data/              Datos semilla y runtime
    public/            PDFs demo estaticos
    server.js          API Express
    package.json
  src/
    api/               Cliente HTTP (Axios)
    components/        Componentes reutilizables (NoteCard, ConfirmDialog, Spinner)
    config/            Configuracion de modos y URLs
    layouts/           Layouts de autenticacion y principal
    mocks/             Fallback mock local
    pages/             Vistas: Login, NotesList, NoteForm, NoteDetail
    router/            Rutas y guards de navegacion
    stores/            Estado global con Pinia (auth, notes)
    utils/             Helpers: seguridad, errores, adjuntos, assets
    main.js            Entry point
  index.html           HTML base
  vercel.json          Rewrites para SPA en Vercel
  vite.config.js       Configuracion de Vite
  tailwind.config.js   Configuracion de Tailwind
  postcss.config.js    Configuracion de PostCSS
```

---

## Endpoints principales

| Metodo | Endpoint | Descripcion |
|--------|----------|------------|
| POST | `/auth/signin` | Login (cualquier credencial no vacia) |
| GET | `/note/` | Listar todas las notas |
| GET | `/note/:noteCode` | Obtener una nota por codigo |
| POST | `/note/` | Crear nota (acepta FormData con adjunto PDF) |
| PATCH | `/note/:noteCode` | Actualizar nota |
| DELETE | `/note/:noteCode` | Eliminar nota |
| GET | `/health` | Health check del servidor |

---

## Consideraciones tecnicas

- El header `Content-Type` no se define manualmente en las peticiones con `FormData`. Esto permite que Axios genere automaticamente el boundary correcto para `multipart/form-data`.
- Los archivos se codifican como data URI base64 en el backend antes de enviarse a Cloudinary. Esto evita problemas conocidos con `Blob` y `FormData` nativo de Node.js al serializar binarios para multipart.
- Los uploads a Cloudinary usan un preset unsigned, lo que elimina la necesidad de exponer `API_KEY` o `API_SECRET` en el servidor.
- La sanitizacion de URLs de adjuntos se realiza en el frontend (`sanitizeExternalUrl`) antes de renderizar cualquier enlace, aceptando unicamente protocolos `http:`, `https:`, `blob:` y data URIs de tipo `application/pdf`.
- Las guardas de navegacion en Vue Router protegen las rutas autenticadas y redirigen al login cuando no hay sesion activa.
- El backend soporta CORS configurable por variable de entorno, aceptando multiples origenes separados por coma.

---

## Credenciales de acceso

Valores precargados en la pantalla de login:

```
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

En el backend demo se acepta cualquier correo y contrasena no vacios.

---

## Uso de IA en el desarrollo

Este proyecto se desarrollo con apoyo activo de herramientas de inteligencia artificial (GitHub Copilot, Claude, ChatGPT) aplicadas a problemas tecnicos concretos durante todo el ciclo de desarrollo.

### Donde se aplico

- **Debugging de integraciones.** Diagnostico de errores de CORS entre Vercel y Render, identificacion de conflictos entre el header `Content-Type: application/json` por defecto de Axios y el boundary requerido por `multipart/form-data` en uploads con Multer.
- **Resolucion de problemas de Cloudinary.** Analisis de errores 401 y 502 al subir archivos: el uso de `new Blob()` en Node.js no serializaba correctamente el binario para multipart, el parametro `access_mode=public` era rechazado en uploads unsigned, y la transformacion `fl_attachment:false` no es compatible con recursos de tipo `raw`. Cada causa se aislo iterativamente con apoyo de la IA para interpretar respuestas de la API y proponer alternativas.
- **Codificacion de flujos complejos.** Generacion del pipeline de upload base64 (buffer a data URI, construccion de FormData en el backend, envio a Cloudinary sin SDK), incluyendo las variantes que se descartaron y por que.
- **Ajustes de UI/UX.** Iteracion rapida sobre el layout del sidebar (fecha arriba, botones abajo, `justify-content: space-between`) con media queries que preservan el comportamiento en mobile sin romper desktop.
- **Logica condicional por plataforma.** Implementacion de deteccion de dispositivos moviles via `navigator.userAgent` y bifurcacion del comportamiento de enlaces de adjuntos segun el contexto (ver caso concreto mas abajo).

### Caso concreto: apertura de PDFs en Android

**Problema.** Los enlaces a PDFs almacenados en Cloudinary no se abrian en navegadores Android. El usuario tocaba el enlace y no ocurria nada visible.

**Diagnostico con IA.** Se analizo el comportamiento de `target="_blank"` en Chrome para Android y se identifico que el navegador puede bloquear silenciosamente la apertura de nuevas pestanas cuando el gesto del usuario no se procesa de forma sincrona o cuando la politica de popups del navegador interviene. La IA ayudo a descartar causas alternativas (CORS, Content-Disposition, tipo MIME) y a focalizar el diagnostico en el manejo del evento de clic.

**Solucion.** Se implemento un handler `@click` en los tres componentes que renderizan enlaces a PDF (`NoteCard`, `NoteDetail`, `NoteForm`). En dispositivos moviles, el handler intercepta el evento y ejecuta `window.open()` de forma sincrona dentro del gesto del usuario, lo que los navegadores moviles aceptan de forma consistente. En escritorio, el handler no interviene.

**Resultado.** PDFs abren correctamente en Android e iOS sin afectar el comportamiento en desktop.

### Que aporto

- **Iteracion rapida sobre errores de integracion.** Problemas que normalmente requieren horas de lectura de documentacion y prueba-error (como el pipeline de upload a Cloudinary sin SDK) se resolvieron en ciclos cortos de diagnostico-propuesta-validacion.
- **Descarte eficiente de hipotesis.** En el caso de Android, la IA ayudo a descartar rapidamente causas que no aplicaban (headers del servidor, configuracion de Cloudinary, sanitizacion de URLs) para llegar a la causa real: el manejo del evento de clic por el navegador.
- **Codigo mas limpio en la primera iteracion.** La generacion asistida de funciones como `openAttachment()` y `getAttachmentLinkAttributes()` incluyo desde el inicio la separacion de responsabilidades y la cobertura de edge cases (data URIs, blob URLs, URLs vacias).

La IA se uso como herramienta de ingenieria para acelerar el diagnostico y la implementacion, no como sustituto del criterio tecnico. Cada solucion propuesta fue evaluada, probada y adaptada al contexto real del proyecto antes de integrarse.

---

## Licencia

MIT -- [dienton82](https://github.com/dienton82)
