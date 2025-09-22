# Guía de Instalación del Sistema Condo360 Polls

## Descripción General

Este documento proporciona instrucciones para instalar y configurar el sistema Condo360 Polls, que consiste en:
1. Un microservicio Node.js para manejar las operaciones de encuestas
2. Un plugin de WordPress para integración frontend

## Requisitos Previos

- Node.js 14+ instalado
- Base de datos MySQL (compartida con WordPress)
- WordPress 5.0+ instalado
- Gestor de paquetes npm o yarn

## Pasos de Instalación

### 1. Configurar el Microservicio Node.js

1. Navegar al directorio `node-poll-service`:
   ```bash
   cd node-poll-service
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Editar el archivo `.env` con tus credenciales de base de datos:
   ```
   DB_HOST=localhost
   DB_USER=nombre_de_usuario_mysql
   DB_PASSWORD=contraseña_mysql
   DB_NAME=nombre_de_la_base_de_datos_de_wordpress
   PORT=4000
   ```

5. Configurar las tablas de la base de datos ejecutando el script SQL en `database-setup.sql`:
   ```bash
   mysql -u tu_usuario -p nombre_de_tu_base_de_datos < database-setup.sql
   ```

6. Iniciar el servicio:
   ```bash
   npm start
   ```
   
   O para desarrollo con reinicio automático:
   ```bash
   npm run dev
   ```

### 2. Instalar el Plugin de WordPress

1. Copiar el directorio `wordpress-plugin/condo360-polls` al directorio de plugins de WordPress:
   ```bash
   cp -r wordpress-plugin/condo360-polls /ruta/a/wordpress/wp-content/plugins/
   ```

2. En el panel de administración de WordPress, ir a Plugins y activar "Condo360 Polls"

3. Si tu servicio Node.js se ejecuta en una URL diferente a `http://localhost:4000`, actualiza la variable `$api_url` en `condo360-polls.php`

### 3. Uso del Sistema

#### Crear Encuestas

1. Como administrador, ir al panel de administración de WordPress
2. Navegar a "Cartas Consulta" en el menú principal
3. Completar la pregunta de la encuesta y las opciones (una por línea)
4. Hacer clic en "Crear Encuesta"

#### Mostrar Encuestas

Usar el shortcode `[condo360_polls]` en cualquier entrada o página para mostrar las encuestas abiertas.

#### Mostrar Resultados

Usar el shortcode `[condo360_poll_results id="X"]` donde X es el ID de la encuesta para mostrar los resultados.

### 4. Roles de Usuario

- **Administradores**: Pueden crear encuestas y ver resultados
- **Suscriptores/Residentes**: Pueden votar en encuestas y ver resultados

### 5. Solución de Problemas

1. **El servicio no inicia**: Verificar que las credenciales de la base de datos en `.env` sean correctas
2. **Las encuestas no se muestran**: Verificar que el servicio Node.js esté en ejecución y accesible
3. **La votación no funciona**: Asegurarse de que los usuarios estén conectados a WordPress
4. **Problemas de CORS**: Verificar que la URL del sitio WordPress coincida con la configuración de CORS en el servicio Node.js

### 6. Notas de Seguridad

- El servicio Node.js valida todos los IDs de usuarios de WordPress contra la base de datos