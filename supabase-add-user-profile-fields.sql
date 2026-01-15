-- Добавление полей для профиля пользователя
-- Выполните этот SQL в Supabase SQL Editor

-- Добавляем колонку avatar_url для аватара пользователя
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Добавляем колонку bio для биографии пользователя
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Комментарии для документации
COMMENT ON COLUMN public.users.avatar_url IS 'URL аватара пользователя из storage';
COMMENT ON COLUMN public.users.bio IS 'Биография пользователя (О себе)';
