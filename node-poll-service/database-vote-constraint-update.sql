-- Script para actualizar la restricción única en la tabla de votos
-- Esto cambiará la restricción para que un usuario solo pueda votar una vez por encuesta (no por pregunta)

-- Primero, eliminamos cualquier restricción única existente
ALTER TABLE condo360_votes DROP INDEX IF EXISTS unique_user_poll_question;
ALTER TABLE condo360_votes DROP INDEX IF EXISTS unique_user_poll;

-- Agregamos la nueva restricción única (usuario + encuesta)
ALTER TABLE condo360_votes ADD UNIQUE INDEX unique_user_poll (wp_user_id, poll_id);