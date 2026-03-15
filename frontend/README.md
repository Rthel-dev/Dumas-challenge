# Dumas App

Aplicación web para la gestión de tareas, desarrollada con Angular 20 como Single Page Application (SPA).

## Entorno de desarrollo
* Node.js v22+
* npm v10+
* Angular v20.3.0

## Instalación
Las siguientes instrucciones de instalación se realizan considerando un sistema local con *Ubuntu 24.04*. Para otras distribuciones de sistemas operativos pueden haber variaciones en los comandos indicados.

### NVM
*NVM* es una herramienta que permite la instalación de múltiples versiones de **Node.js** y a su vez, establecer la versión específica a utilizar. Para su instalación, se debe contar con cURL instalado y ejecutar el siguiente script:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
Luego, agregar *nvm* al entorno actual con el siguiente comando en consola:
```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
Verificar la correcta instalación:
```
nvm --version
```
Para mayores detalles, revisar la [documentación oficial](https://github.com/nvm-sh/nvm) de *nvm*.

*NVM* también cuenta con una versión disponible para sistemas operativos basados en Windows. Para mayores detalles de compatibilidad e instrucciones de instalación, consultar la documentación oficial: [NVM for Windows](https://github.com/coreybutler/nvm-windows).

### Node.js
Con NVM instalado, la instalación de **Node.js** requerida se realiza con los siguientes comandos:
```
nvm install 22
nvm use 22
nvm alias default 22
```

## Clonar repositorio, instalar dependencias y desplegar en entorno de desarrollo
Clonar el repositorio e ingresar al directorio de la aplicación:
```
git clone https://github.com/Rthel-dev/Dumas-challenge.git dumas-app
cd dumas-app/frontend
```
Ajustar la dirección de la aplicación backend en el archivo de entorno (opcional):
```
nano src/environments/environment.ts
```
Definir la dirección de la aplicación backend para su correcta comunicación:
```
{
    apiUrl: 'http://localhost:3000'
}
```
Instalar las dependencias:
```
npm install
```
Desplegar la aplicación en entorno de desarrollo:
```
npm start
```
La aplicación estará disponible en `http://localhost:4200`.

## Pruebas de la aplicación
Para ejecutar las pruebas automatizadas del proyecto, ejecutar el siguiente comando:
```
npm run test
```
Para ejecutar las pruebas con reporte de cobertura:
```
npm run test:cov
```
Para realizar pruebas puntuales sobre un grupo de componentes o un directorio, se deben ejecutar mediante el comando __ng__ de *Angular* de la siguiente forma:
```
ng test --include=src/app/directorio_objetivo
```

## Despliegue en producción

### Instalación directa en el servidor
La siguiente descripción del despliegue de la aplicación se realiza para un servidor Ubuntu 24.04. Para otras versiones de distribución pueden haber diferencias en los comandos indicados. Se considera que ya se encuentran instaladas las dependencias necesarias. Para su instalación, ver la sección [__Instalación__](#instalación).

#### Clonar el repositorio, preconfigurar y construir la aplicación
Clonar el repositorio con permisos de superusuario e ingresar al directorio de trabajo. Para ejemplificar se utiliza la carpeta */opt* del sistema:
```
cd /opt
sudo git clone https://github.com/Rthel-dev/Dumas-challenge.git dumas-frontend
```

Cambiar los permisos de acceso a la carpeta de la aplicación e ingresar al directorio:
```
sudo chown -R tu_usuario:tu_usuario dumas-frontend
sudo chmod -R 774 dumas-frontend
cd dumas-frontend/frontend
```

Ajustar los valores de entorno de la aplicación modificando la dirección del backend en el archivo de entorno:
```
nano src/environments/environment.ts
```
Definir la dirección de la aplicación backend de producción:
```
{
    apiUrl: 'https://direccion-api-produccion.com'
}
```

Instalar las dependencias y construir la aplicación:
```
npm install
npm run build
```

#### Instalación de Nginx
Instalar *Nginx* en el servidor:
```
sudo apt update
sudo apt install nginx -y
```

Habilitar el puerto 80 en el firewall de Ubuntu para conexiones __HTTP__ con *Nginx*:
```
sudo ufw allow 80/tcp
```

Verificar el funcionamiento de Nginx:
```
sudo systemctl status nginx
```

#### Desplegar la aplicación construida
Ingresar a la carpeta de proyecto:
```
cd /opt/dumas-frontend/frontend
```
Crear una carpeta de la aplicación y copiar la aplicación construida al directorio __www__ ubicado en la carpeta *var* del sistema:
```
cd dist/frontend/browser
sudo mkdir -p /var/www/dumas-frontend
sudo cp -r ./ /var/www/dumas-frontend/
cd ../../..
```

Asignar los permisos necesarios para la nueva carpeta:
```
sudo chown -R www-data:www-data /var/www/dumas-frontend
sudo chmod -R 764 /var/www/dumas-frontend
```

Crear el archivo de configuración de *Nginx* para la aplicación:
```
sudo nano /etc/nginx/sites-available/dumas-frontend
```
Ingresar la siguiente configuración:
```
server {
    listen 80;
    server_name nombre_de_tu_servidor;
    root /var/www/dumas-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Agregar la aplicación a los sitios habilitados mediante la creación de un enlace simbólico:
```
sudo ln -s /etc/nginx/sites-available/dumas-frontend /etc/nginx/sites-enabled/
```

Verificar la configuración de *Nginx* con el siguiente comando:
```
sudo nginx -t
```

Recargar *Nginx* para aplicar los cambios realizados:
```
sudo systemctl reload nginx
```

#### Actualizar la aplicación
Para actualizar la aplicación a su versión más reciente, se debe ingresar a la carpeta de la aplicación y ejecutar el siguiente comando:
```
cd /opt/dumas-frontend/frontend
git pull origin main
```

Instalar las nuevas dependencias y volver a construir la aplicación:
```
npm install
npm run build
```

Copiar la aplicación construida al directorio de trabajo de *Nginx* y recargar el servicio:
```
sudo cp -r dist/frontend/browser/* /var/www/dumas-frontend/
sudo systemctl reload nginx
```

#### Cambiar despliegue a HTTPS
Para obtener los certificados SSL del sitio mediante el uso de *Let's Encrypt*, se utiliza su herramienta __Certbot__ para la obtención del certificado. Para ello, se debe instalar *Certbot* junto con el plugin necesario para su uso con *Nginx* con los siguientes comandos:
```
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```
Una vez instalado, para generar los certificados para los dominios de la aplicación, es necesario establecerlos en el campo *server_name* del archivo de configuración de *Nginx*, para ello, editar el archivo de configuración:
```
sudo nano /etc/nginx/sites-available/dumas-frontend
```
Editar la línea referente al nombre del servidor y establecer el dominio a utilizar:
```
server_name tudominio.cl;
```
Recargar *Nginx* para aplicar los cambios realizados:
```
sudo systemctl reload nginx
```
Ejecutar el siguiente comando de __Certbot__ para obtener el certificado SSL:
```
sudo certbot --nginx -d tudominio.cl -d www.tudominio.cl
```
Este comando obtendrá los certificados necesarios para el sitio y reconfigurará el archivo de configuración de *Nginx* para su uso en *HTTPS*, agregando la redirección del tráfico HTTP a HTTPS.

El certificado tiene una validez por 90 días. La renovación se puede realizar de forma automática mediante *Certbot*. Para verificar la renovación automática, ejecutar el siguiente comando:
```
sudo systemctl status certbot.timer
```
Para ejecutar la renovación de forma manual, ejecutar:
```
sudo certbot renew --dry-run
```
