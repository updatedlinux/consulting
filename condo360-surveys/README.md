# API de Condo360 Surveys

Sistema de gestión de encuestas para residentes de condominio construido con Node.js, Express y MySQL.

## Características

- API RESTful para gestión de encuestas
- Integración con el sistema de usuarios de WordPress
- Cierre automático de encuestas
- Documentación Swagger
- Notificaciones por email automáticas
- Generación de reportes PDF
- Sistema de cola de emails nativo
- Vista detallada de votantes

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en el archivo `.env`
4. Inicializa la base de datos usando `init-db.sql`
5. Inicia el servidor:
   ```bash
   npm start
   ```

## Documentación de la API

Una vez que el servidor esté ejecutándose, visita `http://localhost:3000/polls/api-docs` para la documentación de Swagger.

## Endpoints

- `POST /polls/surveys` - Crear una nueva encuesta
- `GET /polls/surveys` - Obtener encuestas activas
- `GET /polls/surveys/:id` - Obtener una encuesta específica
- `POST /polls/surveys/:id/vote` - Enviar un voto
- `GET /polls/surveys/:id/results` - Obtener resultados de encuesta
- `GET /polls/surveys/:id/voters` - Obtener detalles de votantes
- `GET /polls/surveys/:id/pdf` - Generar reporte PDF
- `PUT /polls/surveys/:id/close` - Cerrar una encuesta
- `GET /polls/email-queue-status` - Estado de la cola de emails

## Base de Datos

El sistema utiliza la misma base de datos que WordPress y requiere las siguientes tablas:
- condo360_surveys
- condo360_questions
- condo360_question_options
- condo360_survey_participants
- condo360_survey_responses

## Notificaciones por Email

El sistema envía automáticamente notificaciones por email a todos los usuarios con rol "Subscriptor" cuando se crea una nueva encuesta:

- **Configuración SMTP**: Configura tus credenciales SMTP en el archivo `.env`
- **Cola de Emails**: Sistema nativo de Node.js sin dependencias externas
- **Procesamiento por Lotes**: Envía emails en lotes de 30 cada 2 minutos
- **Template**: Diseño HTML profesional compatible con el tema Astra