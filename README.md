# Dumas App

Aplicación web para la gestión de tareas. Permite a los usuarios registrarse, iniciar sesión y administrar sus tareas personales con funcionalidades de creación, edición, eliminación y marcado de completitud.

## Estructura del proyecto

Este repositorio está organizado como un monorepo con dos aplicaciones independientes:

```
dumas-app/
├── backend/     → API REST (NestJS 11)
├── frontend/    → Aplicación web SPA (Angular 20)
└── README.md
```

## Aplicaciones

### Backend — Dumas Task API
API REST desarrollada con **NestJS 11**, **Prisma ORM** y **PostgreSQL**. Incluye autenticación basada en JWT (access token + refresh token en cookie httpOnly), validación de datos con class-validator y documentación interactiva con Swagger.

Para instrucciones detalladas de instalación, configuración y despliegue, consultar la documentación específica: [**backend/README.md**](backend/README.md).

### Frontend — Dumas App
Aplicación web tipo Single Page Application (SPA) desarrollada con **Angular 20** utilizando componentes standalone, signals y detección de cambios zoneless. La interfaz está construida con **Bootstrap 5** y **ng-bootstrap**, e incluye un dashboard con estadísticas, listado de tareas con filtros/paginación y formulario de creación de tareas.

Para instrucciones detalladas de instalación, configuración y despliegue, consultar la documentación específica: [**frontend/README.md**](frontend/README.md).

## Entorno de desarrollo
* Node.js v22+
* npm v10+
* PostgreSQL v12+

## Inicio rápido

Clonar el repositorio:
```
git clone https://github.com/Rthel-dev/Dumas-challenge.git dumas-app
cd dumas-app
```

### Levantar el backend
```
cd backend
cp .env.example .env
nano .env                    # Configurar variables de entorno
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```
El backend estará disponible en `http://localhost:3000` y Swagger en `http://localhost:3000/api`.

### Levantar el frontend
```
cd frontend
npm install
npm start
```
La aplicación estará disponible en `http://localhost:4200`.
