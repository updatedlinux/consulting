# Resumen del Sistema Condo360 Polls - Componentes

## Microservicio Node.js (node-poll-service)

Ubicación: `node-poll-service/`

### Componentes:
1. **Package.json** - Dependencias del proyecto y scripts
2. **Configuración de Base de Datos** - Configuración del pool de conexiones MySQL
3. **Modelos**:
   - Poll.js - Operaciones de base de datos de encuestas
   - Vote.js - Operaciones de base de datos de votos
4. **Servicios**:
   - wordpressUserService.js - Validación de usuarios de WordPress
5. **Controladores**:
   - pollController.js - Implementaciones de endpoints API
6. **Rutas**:
   - pollRoutes.js - Definiciones de rutas API con documentación Swagger
7. **Aplicación Principal**:
   - index.js - Configuración de la aplicación Express
8. **Configuración de Base de Datos**:
   - database-setup.sql - Esquema SQL para encuestas y votos
9. **Configuración**:
   - .env.example - Plantilla de variables de entorno
10. **Documentación**:
    - README.md - Documentación del servicio
    - Swagger UI - Documentación interactiva de la API

## Plugin de WordPress (wordpress-plugin/condo360-polls)

Ubicación: `wordpress-plugin/condo360-polls/`

### Componentes:
1. **Archivo Principal del Plugin**:
   - condo360-polls.php - Inicialización del plugin y shortcodes
2. **Recursos**:
   - polls.js - Funcionalidad JavaScript frontend
   - polls.css - Estilos frontend
3. **Documentación**:
   - README.md - Documentación del plugin

## Endpoints API

Todos los endpoints están disponibles bajo el prefijo `/api/`:

1. POST /api/polls - Crear encuesta (solo administradores)
2. GET /api/polls - Listar encuestas abiertas
3. GET /api/polls/{id} - Obtener detalles de encuesta
4. POST /api/polls/{id}/vote - Votar en encuesta
5. GET /api/polls/{id}/results - Obtener resultados de encuesta

## Documentación de la API (Swagger)

La documentación interactiva de la API está disponible en:
- Desarrollo: `http://localhost:4000/api-docs`
- Producción: `https://api.bonaventurecclub.com/api-docs`

## Shortcodes de WordPress

1. [condo360_polls] - Mostrar encuestas abiertas
2. [condo360_poll_results id="X"] - Mostrar resultados de encuesta

## Tablas de Base de Datos

1. condo360_polls - Preguntas y opciones de encuestas
2. condo360_votes - Votos de usuarios en encuestas

## Configuración de Proxy Reverso

El sistema está configurado para funcionar con SSL offloading a través de un proxy reverso (como Nginx Proxy Manager) con el FQDN:
- `https://api.bonaventurecclub.com`