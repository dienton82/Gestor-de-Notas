# 📒 Gestor de Notas

![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue)
![Vue 3](https://img.shields.io/badge/Vue-3.5.13-green)
![Vite](https://img.shields.io/badge/Vite-6.3.5-blueviolet)
![Pinia](https://img.shields.io/badge/Pinia-3.0.2-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen)

---

## 🚀 Descripción

**Gestor de Notas** es una SPA construida con Vue 3 y Pinia que permite a los usuarios autenticarse, gestionar notas personales y organizarlas de forma efectiva.

### Características destacadas:

- 🔑 Login real con token JWT
- 📝 CRUD completo de notas
- ✏️ Edición inline con doble clic
- 📅 Agrupación visual por fecha (Hoy, Ayer, Esta semana)
- 🔍 Filtro de búsqueda por contenido o título
- 🔃 Ordenamiento por campos clave
- 📄 Paginación
- 🎨 Diseño responsive
- 🚀 Despliegue automático en GitHub Pages

---

## ⚙️ Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/dienton82/Gestor-de-Notas.git
cd Gestor-de-Notas

# 2. Instalar dependencias
npm install

# 3. (Opcional) Crear archivo de entorno
echo VITE_API_URL=https://stg.prolibu.com/v2 > .env

# 4. Ejecutar en modo desarrollo
npm run dev
# Abre: http://localhost:5173

# 5. Generar build de producción
npm run build

# 6. Desplegar en GitHub Pages
npm run deploy
# Producción: https://dienton82.github.io/Gestor-de-Notas/
```

---

## 🗂️ Estructura del proyecto

```plaintext
Gestor-de-Notas/
├── public/                # Archivos estáticos (index.html, favicon...)
├── src/
│   ├── api/               # Cliente Axios
│   ├── assets/            # Imágenes y estilos globales
│   ├── components/        # Componentes reutilizables
│   ├── pages/             # Vistas (Login, NotesList, NoteForm)
│   ├── router/            # Configuración de Vue Router
│   ├── stores/            # Stores de Pinia (auth, notes)
│   ├── index.css          # Estilos globales
│   └── main.js            # Entry point
├── .gitignore
├── tailwind.config.js
├── postcss.config.cjs
├── vite.config.js
├── package.json
└── README.md
```

---

## 📡 Endpoints utilizados

- `POST /auth/signin` — Iniciar sesión (JWT)
- `GET /note/` — Listar notas
- `POST /note/` — Crear nueva nota
- `GET /note/{noteCode}` — Obtener detalle
- `PATCH /note/{noteCode}` — Editar nota
- `DELETE /note/{noteCode}` — Eliminar nota

---

## 🔑 Credenciales de prueba

```txt
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

---

## ✅ Funcionalidades implementadas

| Funcionalidad                            | Estado |
|-----------------------------------------|--------|
| Login con token JWT                     | ✅     |
| CRUD completo de notas                  | ✅     |
| Edición inline con doble clic           | ✅     |
| Agrupación por fecha (Hoy, Ayer, etc.)  | ✅     |
| Ordenamiento por campos clave           | ✅     |
| Filtro de búsqueda                      | ✅     |
| Paginación                              | ✅     |
| Diseño responsive                       | ✅     |
| Spinner de carga                        | ✅     |
| Estilos con CSS Modules                 | ✅     |
| Despliegue en GitHub Pages              | ✅     |

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.  
© 2025 [dienton82](https://github.com/dienton82)

---

> ✨ Gracias por visitar el proyecto.  
> Si tienes sugerencias o mejoras, abre un *issue* en GitHub.

---

> ¡Gracias por probar el Gestor de Notas!
> Para dudas o sugerencias, abre un *issue* en el repositorio.
