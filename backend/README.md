# Dumas Task API

API REST para la gestión de tareas, desarrollada con NestJS 11, Prisma ORM y PostgreSQL.

## Entorno de desarrollo
* NodeJS v22+
* npm v10+
* PostgreSQL v12+

## Instalación
La siguiente descripción de instalación se realiza considerando un sistema local con Ubuntu 20.04. Para otras distribuciones de sistemas operativos pueden haber variaciones en los comandos indicados.

### nvm-sh
*nvm-sh* es una herramienta que facilita la instalación de múltiples versiones de NodeJS en el sistema, por lo cual permite elegir la versión específica a utilizar. Para su instalación se debe contar con cURL instalado:
```
sudo apt update
sudo apt install curl
```
Instalar *nvm-sh* a través del script de instalación proporcionado en la [documentación oficial](https://github.com/nvm-sh/nvm):
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
Ejecutar el siguiente comando para que la consola del sistema reconozca las instrucciones de *nvm-sh* en las siguientes sesiones de trabajo:
```
source ~/.bashrc
```
Cerrar la sesión actual y volver a abrir la consola para continuar con la instalación.

### Node.js
Con la ayuda de *nvm-sh* ya es posible instalar la versión de *NodeJS* requerida a través del siguiente comando:
```
nvm install 22
```
Verificar la versión de *NodeJS* instalada:
```
node --version
```
Verificar la versión de npm instalada:
```
npm --version
```

### PostgreSQL
Instalar *PostgreSQL* en el sistema:
```
sudo apt install postgresql postgresql-contrib libpq-dev
```
Cambiar a usuario postgres e ingresar a la consola de PostgreSQL:
```
sudo su - postgres
psql
```
Crear un rol para el usuario actual, con permiso de creación de bases de datos y establecer su password de acceso:
```
create role 'tu_usuario' with createdb login password 'tu_password';
```
Crear la base de datos de la aplicación:
```
create database dumasdb owner 'tu_usuario';
```
Salir de la consola psql:
```
\q
```
Salir de la consola como usuario postgres:
```
exit
```
Probar acceso a psql con el nuevo usuario creado:
```
psql -d dumasdb
```

## Desplegar en entorno de desarrollo

### Clonar repositorio e instalar dependencias
Clonar el repositorio e ingresar al directorio de la aplicación:
```
git clone https://github.com/Rthel-dev/Dumas-challenge.git dumas-app
cd dumas-app/backend
```
Generar archivo de variables de entorno de la aplicación copiando archivo .env.example a .env y editarlo:
```
cp .env.example .env
nano .env
```
Cambiar valores de variables de entorno:
```
DB_USER='tu_usuario'
DB_PASS='tu_password'
DB_HOST='localhost'
DB_PORT=5432
DB_NAME='dumasdb'
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

JWT_ACCESS_SECRET='clave_secreta_acceso_min_32_caracteres'
JWT_REFRESH_SECRET='clave_secreta_refresh_min_32_caracteres'
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false

ALLOWED_ORIGINS=direcciones_permitidas_separadas_por_coma  ej.: http://localhost:4200,
PORT=3000
```
Instalar dependencias:
```
npm install
```
Generar el cliente de Prisma:
```
npx prisma generate
```
Ejecutar las migraciones de la base de datos:
```
npx prisma migrate dev
```
Desplegar la aplicación en entorno de desarrollo:
```
npm run start:dev
```
La aplicación estará disponible en `http://localhost:3000` y la documentación de la API (Swagger) en `http://localhost:3000/api`.

## Endpoints de la API

### Auth (`/auth`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Renovar access token | No (usa cookie refresh_token) |
| POST | `/auth/logout` | Cerrar sesión | Sí |

### Users (`/users`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/users/me` | Obtener perfil del usuario autenticado | Sí |

### Tasks (`/tasks`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/tasks` | Crear nueva tarea | Sí |
| GET | `/tasks` | Listar tareas del usuario | Sí |
| GET | `/tasks/:id` | Obtener tarea por ID | Sí |
| PATCH | `/tasks/:id` | Actualizar tarea | Sí |
| DELETE | `/tasks/:id` | Eliminar tarea | Sí |

## Desplegar en producción (instalación directa en servidor)

### Requisitos previos
Instalar *nvm-sh*, *Node.js* y *PostgreSQL* en el servidor siguiendo los mismos pasos descritos en la sección de [Instalación](#instalación).

### Configurar la aplicación
Clonar el repositorio e ingresar al directorio de la aplicación:
```
git clone https://github.com/Rthel-dev/Dumas-challenge.git dumas-app
cd dumas-app/backend
```
Generar archivo de variables de entorno y editarlo:
```
cp .env.example .env
nano .env
```
Configurar las variables de entorno con valores de producción:
```
DB_USER='usuario_produccion'
DB_PASS='password_seguro_produccion'
DB_HOST='direccion_servidor_bd'
DB_PORT=5432
DB_NAME='dumasdb'
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

JWT_ACCESS_SECRET='clave_secreta_acceso_produccion_min_32_caracteres'
JWT_REFRESH_SECRET='clave_secreta_refresh_produccion_min_32_caracteres'
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=true

ALLOWED_ORIGINS=direcciones_permitidas_separadas_por_coma   ej.: https://dominio-frontend.com,
PORT=3000
```
Instalar dependencias:
```
npm install
```
Generar el cliente de Prisma:
```
npx prisma generate
```
Aplicar las migraciones en la base de datos de producción:
```
npx prisma migrate deploy
```
Compilar la aplicación:
```
npm run build
```
Iniciar la aplicación en modo producción:
```
npm run start:prod
```
La documentación de la API (Swagger) estará disponible en `http://direccion_servidor:3000/api`.

### Exponer la aplicación y mantener el proceso activo
Para exponer la aplicación y mantenerla ejecutándose de forma continua en el servidor, se recomienda utilizar un gestor de procesos como [PM2](https://pm2.keymetrics.io/):
```
npm install -g pm2
pm2 start dist/src/main.js --name dumas-api
pm2 save
pm2 startup
```

## Tests
Ejecutar tests unitarios:
```
npm test
```
Ejecutar tests con reporte de cobertura:
```
npm run test:cov
```
Ejecutar tests de integración:
```
npm run test:integration
```
