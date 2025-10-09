# Plugin de WordPress Condo360 Surveys

Plugin de WordPress para gestionar encuestas de condominio con capacidades de votación de residentes.

## Características

- Votación de encuestas de residentes a través de shortcode
- Panel de administración para gestión de encuestas
- Interfaz de creación de encuestas
- Visualización de resultados
- Integración con el sistema de usuarios de WordPress
- Notificaciones por email automáticas
- Descarga de reportes PDF
- Vista detallada de votantes

## Instalación

1. Sube la carpeta del plugin a `/wp-content/plugins/condo360-surveys`
2. Activa el plugin a través de la pantalla de plugins de WordPress
3. Configura la URL de la API en el `functions.php` de tu tema:
   ```php
   define('CONDO360_SURVEYS_API_URL', 'http://your-domain.com:3000/polls');
   ```

## Uso

### Frontend

Usa el shortcode `[condo360_surveys]` para mostrar las encuestas disponibles a los residentes.

### Administración

Accede al menú "Cartas Consulta" en la administración de WordPress para:
- Ver todas las encuestas
- Crear nuevas encuestas
- Ver resultados de encuestas
- Ver detalles de votantes
- Descargar reportes PDF

## Requisitos

- WordPress 5.0 o superior
- API backend de Node.js ejecutándose
- Base de datos MySQL (compartida con WordPress)
- Servidor SMTP configurado para notificaciones

## Plantillas

El plugin incluye plantillas personalizables en la carpeta `/templates`:
- `frontend-surveys.php` - Visualización de encuestas para residentes
- `admin-dashboard.php` - Panel de administración de encuestas
- `admin-create-survey.php` - Formulario de creación de encuestas
- `admin-select-survey.php` - Selección de encuestas para resultados
- `admin-survey-results.php` - Visualización de resultados de encuestas
- `admin-voters-detail.php` - Detalles de votantes
- `resident-survey-results.php` - Resultados para residentes

## Estilos

El plugin incluye archivos CSS en `/assets/css`:
- `surveys.css` - Estilos del frontend (compatible con el tema Astra)
- `admin.css` - Estilos de la interfaz de administración

## JavaScript

El plugin incluye archivos JavaScript en `/assets/js`:
- `surveys.js` - Interacción de encuestas del frontend
- `admin.js` - Funcionalidad dinámica de formularios de administración