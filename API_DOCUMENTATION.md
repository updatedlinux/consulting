# Documentación de Endpoints de la API

## URL Base
Todos los endpoints tienen el prefijo `/polls`

## Endpoints de Gestión de Encuestas

### Crear Nueva Encuesta
**POST** `/polls/surveys`

Crea una nueva encuesta con preguntas y opciones.

**Cuerpo de la Solicitud:**
```json
{
  "title": "string",
  "description": "string",
  "start_date": "YYYY-MM-DD HH:MM:SS",
  "end_date": "YYYY-MM-DD HH:MM:SS",
  "questions": [
    {
      "question_text": "string",
      "question_order": "integer (opcional, por defecto: 1)",
      "options": [
        {
          "option_text": "string"
        }
      ]
    }
  ]
}
```

**Respuesta:**
```json
{
  "message": "Encuesta creada exitosamente",
  "survey_id": "integer"
}
```

**Validación:**
- Todos los campos excepto description son requeridos
- La fecha de fin debe ser posterior a la fecha de inicio
- Cada pregunta debe tener al menos una opción

### Obtener Encuestas Activas
**GET** `/polls/surveys`

Recupera todas las encuestas que están actualmente activas (estado abierto y dentro del rango de fechas).

**Response:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "status": "open|closed",
    "created_at": "datetime",
    "questions": [
      {
        "id": "integer",
        "survey_id": "integer",
        "question_text": "string",
        "question_order": "integer",
        "created_at": "datetime",
        "options": [
          {
            "id": "integer",
            "question_id": "integer",
            "option_text": "string",
            "option_order": "integer",
            "created_at": "datetime"
          }
        ]
      }
    ]
  }
]
```

### Get Specific Survey
**GET** `/polls/surveys/:id`

Retrieves a specific survey by ID.

**Response:**
Same as above but for a single survey.

### Vote in a Survey
**POST** `/polls/surveys/:id/vote`

Records a user's vote in a survey.

**Request Body:**
```json
{
  "wp_user_id": "integer",
  "responses": [
    {
      "question_id": "integer",
      "option_id": "integer"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Vote recorded successfully"
}
```

**Validation:**
- User must exist in wp_users
- User must not have already participated
- All survey questions must be answered
- Survey must be open and within date range

### Get Survey Results
**GET** `/polls/surveys/:id/results`

Retrieves results for a specific survey.

**Query Parameters:**
- `admin` (optional): Set to "true" to bypass result availability checks

**Response:**
```json
{
  "survey": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "open|closed",
    "start_date": "datetime",
    "end_date": "datetime"
  },
  "questions": [
    {
      "id": "integer",
      "question_text": "string",
      "question_order": "integer",
      "options": [
        {
          "id": "integer",
          "option_text": "string",
          "option_order": "integer",
          "response_count": "integer"
        }
      ]
    }
  ]
}
```

**Availability:**
- Results are only available for closed surveys or when accessed by admin

### Close a Survey
**PUT** `/polls/surveys/:id/close`

Manually closes a survey.

**Response:**
```json
{
  "message": "Survey closed successfully"
}
```

### Get All Surveys (Admin)
**GET** `/polls/surveys/all`

Retrieves all surveys for admin panel with participation statistics.

**Response:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "status": "open|closed",
    "created_at": "datetime",
    "participant_count": "integer",
    "question_count": "integer"
  }
]
```

### Obtener Detalles de Votantes de Encuesta
**GET** `/polls/surveys/:id/voters`

Recupera información detallada sobre quién votó en una encuesta.

**Respuesta:**
```json
{
  "survey": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "open|closed",
    "start_date": "datetime",
    "end_date": "datetime"
  },
  "statistics": {
    "total_eligible_voters": "integer",
    "actual_voters": "integer",
    "participation_percentage": "string"
  },
  "voters": [
    {
      "id": "integer",
      "username": "string",
      "email": "string",
      "display_name": "string",
      "voted_at": "datetime"
    }
  ]
}
```

### Generar Reporte PDF
**GET** `/polls/surveys/:id/pdf`

Genera un reporte PDF con gráficos de barras y resultados detallados para una encuesta.

**Respuesta:**
- Content-Type: `application/pdf`
- Descarga de archivo con resultados de encuesta y gráficos de barras

**Nota:** Utiliza PDFKit para generar PDFs sin dependencias del sistema operativo.

### Obtener Estado de Cola de Emails
**GET** `/polls/email-queue-status`

Recupera el estado actual de la cola de notificaciones por email.

**Respuesta:**
```json
{
  "waiting": "integer",
  "active": "integer",
  "completed": "integer",
  "failed": "integer"
}
```

**Nota:** El sistema de cola utiliza Node.js nativo sin Redis. Los emails se procesan en lotes de 30 cada 2 minutos.

## Respuestas de Error

Todos los endpoints pueden devolver las siguientes respuestas de error:

**400 Bad Request**
```json
{
  "error": "Descripción del error"
}
```

**404 Not Found**
```json
{
  "error": "Recurso no encontrado"
}
```

**500 Internal Server Error**
```json
{
  "error": "¡Algo salió mal!"
}
```

## Autenticación

La API no implementa autenticación por sí misma. En su lugar:
- Los IDs de usuario de WordPress se pasan en los cuerpos de las solicitudes
- WordPress maneja la autenticación de usuarios
- La API valida que los IDs de usuario existan en la tabla wp_users

## Limitación de Velocidad

No se implementa limitación de velocidad en la API. Si es necesario, esto debe manejarse a nivel de servidor (nginx, Apache, etc.).

## CORS

CORS está habilitado para todos los orígenes para permitir solicitudes desde el frontend de WordPress.