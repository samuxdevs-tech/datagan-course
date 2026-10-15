# TecnoGan Academy — Plataforma de Formación en Ganadería de Precisión

TecnoGan Academy es el ecosistema integral de formación técnica, simulación interactiva y acreditación oficial para profesionales del sector agropecuario. Diseñado con una arquitectura web moderna y en tiempo real, el sistema capacita a productores, zootécnicos, médicos veterinarios y administradores en la toma de decisiones informadas mediante métricas avanzadas y práctica guiada sin riesgos de campo.

---

## Estructura Pedagógica por Fases

El modelo educativo de la plataforma se compone de tres fases metodológicas integradas por cada curso:

1. **Fase 1: Aula Virtual Interactiva**
   - Reproducción de video de alta definición (streaming local en Cloudflare R2 o YouTube).
   - Bloqueo secuencial configurable (`Libre`, `Secuencial por Lección`, `Secuencial por Módulo`).
   - Puntos de control de atención durante el video (In-Video Checkpoints) y evaluaciones obligatorias al finalizar cada clase.
   - Recursos interactivos por lección (`📁 Recursos ▾`) con descarga de documentos (Word, Excel, PDF), enlaces y cuestionarios rápidos (Pop Quizes).
   - Sistema de toma de notas contextuales sincronizadas al segundo del video y foro de Preguntas y Respuestas (Q&A).

2. **Fase 2: Reflejo Operativo (Simulación Visual)**
   - Módulo interactivo de entrenamiento visual y toma de decisiones zootécnicas frente a escenarios reales de finca.
   - Vinculación directa con el catálogo de cursos (`/scenarios?course=[slug]`).
   - Visibilidad y activación controlada desde el panel administrativo.

3. **Fase 3: Sandbox Finca Ficticia (DataGan 360)**
   - Entorno seguro y clonado del software operativo DataGan 360.
   - Misiones de resolución práctica donde los estudiantes operan inventarios, pesajes, ganancias de peso e índices reproductivos sin comprometer hatos reales.

4. **Acreditación y Certificación Zootécnica**
   - Generación dinámica de diplomas verificados con firma del Equipo Directivo de TecnoGan.
   - Requisito de aprobación con mérito (avance igual o superior al 80%).
   - Desglose de competencias zootécnicas adquiridas, horas acreditadas y calificación promedio obtenida.
   - Opciones integradas para previsualización, impresión en alta calidad y enlace público verificable.

---

## Arquitectura y Tecnologías

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript estricto.
- **Estilos e Interfaz:** Tailwind CSS, Lucide React, Canvas-Confetti para retroalimentación formativa.
- **Base de Datos y Tiempo Real:** Firebase Realtime Database (RTDB) para cursos, lecciones, telemetría y certificados.
- **Autenticación:** Firebase Authentication con persistencia de perfil y sincronización de identidad.
- **Almacenamiento Multimedia:** Cloudflare R2 (Worker optimizado) para videos, documentos de estudio y portadas de cursos.
- **Despliegue y Distribución:** Firebase Hosting con optimizaciones de caché estático en [https://datagan-course.web.app](https://datagan-course.web.app).

---

## Estructura del Proyecto

```text
Datagan Course/
├── G-DOCS/                         # Documentación técnica y ejecutiva (.docx)
├── frontend/                       # Aplicación Next.js 16
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/              # Panel Studio (Cursos, Temarios, Recursos, Fases)
│   │   │   │   ├── analytics/      # Monitoreo de telemetría y diplomas
│   │   │   │   ├── metrics/        # Catálogo de 73 métricas zootécnicas
│   │   │   │   ├── missions/       # Gestor de misiones para Sandbox
│   │   │   │   └── scenarios/      # Gestor de escenarios de Reflejo Operativo
│   │   │   ├── certificate/        # Vista pública y descarga de certificados
│   │   │   ├── course/             # Aula virtual del estudiante
│   │   │   ├── scenarios/          # Reproductor interactivo de Fase 2
│   │   │   ├── login/ & register/  # Acceso y registro de usuarios
│   │   │   └── page.tsx            # Portada principal y catálogo de cursos
│   │   ├── components/             # Componentes modulares (PopQuizModal, VideoPlayer, etc.)
│   │   ├── context/                # Contexto de autenticación y estado global
│   │   ├── lib/                    # Configuración de Firebase y subida a R2
│   │   └── types/                  # Definiciones de tipos TypeScript
│   └── package.json
├── firebase.json                   # Reglas de enrutamiento y despliegue Hosting
├── database.rules.json             # Reglas de seguridad para RTDB
└── README.md                       # Documentación principal del repositorio
```

---

## Puesta en Marcha en Local

### 1. Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm o yarn.
- Cuenta o emulador de Firebase configurado.

### 2. Instalación de Dependencias

```bash
cd frontend
npm install
```

### 3. Configuración de Variables de Entorno

Crear el archivo `frontend/.env.local` con las credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://tu-proyecto-rtdb.firebaseio.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="tu-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="tu-app-id"
```

### 4. Ejecución en Modo Desarrollo

```bash
cd frontend
npm run dev
```

La plataforma estará accesible en `http://localhost:3000`.

### 5. Compilación y Despliegue a Producción

Para compilar la aplicación estática y desplegar en Firebase Hosting:

```bash
# Compilar build optimizado
cd frontend
npm run build

# Desplegar en Firebase Hosting (desde el directorio raíz)
cd ..
firebase deploy --only hosting --project datagan-course
```

---

## Panel de Administración (Admin Studio)

Ubicado en `/admin`, permite la gestión integral del contenido educativo:
- **Gestión Multi-Curso:** Crear, editar y eliminar cursos completos con asignación de título, slug, horas acreditadas, categoría, nivel y subida directa de portada a Cloudflare R2.
- **Reordenamiento Intuitivo:** Soporte para arrastrar y soltar (Drag & Drop) y controles rápidos de subida/bajada (▲ / ▼) tanto para módulos como para lecciones.
- **Gestor de Recursos:** Carga de documentos de soporte (Word, Excel, PDF), enlaces y creación de Pop Quizes evaluativos interactivos.
- **Control de Fases:** Toggles para activar o pausar la visibilidad de la Fase 2 (Reflejo Operativo) y Fase 3 (Sandbox), ajustando además el modo de acceso (global o in-course).
- **Reglas de Progresión:** Selección entre avance libre, secuencial estricto por lección o secuencial por módulo completo.
- **Visibilidad y Modalidades de Acceso:** Control de cursos públicos vs borradores (restringidos a instructores), y modelos de matrícula gratuita o de pago con gestión de precios y licencias criptográficas de acceso.
- **Gobernanza DevOps (Modo Simulación):** Conmutador exclusivo para operadores en la barra superior de administración que permite evaluar la plataforma bajo restricciones de estudiante común.
- **Certificación con Trazabilidad Temporal:** Visualización de la hora exacta de expedición en el panel de acreditación oficial.
