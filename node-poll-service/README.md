# Condo360 Poll Service

Microservicio para manejar encuestas en el sistema Condo360, integrado con WordPress.

## Características

- Creación de encuestas con fechas de inicio y fin
- Votación en encuestas abiertas
- Visualización de resultados de encuestas
- Prevención de votos duplicados
- Integración con usuarios de WordPress
- Documentación de API con Swagger
- Visualización de votos por encuesta (solo administradores)

## Endpoints de la API

### Encuestas

- `POST /api/polls` - Crear una nueva encuesta (solo administradores)
- `GET /api/polls` - Obtener todas las encuestas abiertas
- `GET /api/polls/{id}` - Obtener una encuesta por ID
- `POST /api/polls/{id}/vote` - Votar en una encuesta
- `GET /api/polls/{id}/results` - Obtener resultados de una encuesta
- `GET /api/polls/{id}/votes` - Obtener votos de una encuesta (solo administradores)

### Documentación de la API

La documentación de la API está disponible en `/api-docs` cuando se ejecuta en modo desarrollo o cuando la variable de entorno `ENABLE_SWAGGER` está establecida en `true`.