# Lista de Verificación de Verificación del Sistema Condo360 Polls

## Verificación del Microservicio Node.js

- [ ] Node.js 14+ está instalado y disponible en el sistema
- [ ] Las dependencias se instalaron correctamente con `npm install`
- [ ] El archivo `.env` está configurado con las credenciales correctas de la base de datos
- [ ] Las tablas de la base de datos se crearon ejecutando `database-setup.sql`
- [ ] El servicio se inicia correctamente con `npm start`
- [ ] El servicio responde en el puerto configurado (por defecto 4000)
- [ ] Los endpoints API están accesibles y funcionando correctamente

## Verificación del Plugin de WordPress

- [ ] El plugin se copió correctamente al directorio de plugins de WordPress
- [ ] El plugin está activado en el panel de administración de WordPress
- [ ] El menú "Cartas Consulta" aparece para los administradores
- [ ] El shortcode `[condo360_polls]` muestra encuestas abiertas
- [ ] El shortcode `[condo360_poll_results id="X"]` muestra resultados de encuestas

## Verificación de Funcionalidad

- [ ] Los administradores pueden crear nuevas encuestas
- [ ] Las encuestas creadas se almacenan correctamente en la base de datos
- [ ] Los usuarios registrados pueden votar en encuestas
- [ ] Los votos se registran correctamente en la base de datos
- [ ] Los resultados de las encuestas se calculan y muestran correctamente
- [ ] La seguridad está implementada correctamente (solo administradores pueden crear encuestas)

## Verificación de Integración

- [ ] El plugin de WordPress puede comunicarse con el microservicio Node.js
- [ ] No hay errores de CORS entre WordPress y el servicio Node.js
- [ ] Los datos de usuario se validan correctamente entre WordPress y el servicio Node.js
- [ ] El sistema funciona correctamente en diferentes navegadores

## Pruebas de Rendimiento

- [ ] El sistema maneja múltiples usuarios votando simultáneamente
- [ ] Las respuestas de la API son adecuadamente rápidas
- [ ] La base de datos maneja correctamente las operaciones concurrentes