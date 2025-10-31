-- Политики безопасности для Supabase Storage
-- Выполните этот SQL в Supabase SQL Editor

-- ШАГ 1: Создаем bucket для изображений (если еще не создан)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ШАГ 2: Удаляем старые политики если они есть (чтобы избежать конфликтов)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are accessible to all" ON storage.objects;

-- ШАГ 3: Создаем новые политики

-- Политика: любой аутентифицированный пользователь может загружать файлы
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Политика: любой аутентифицированный пользователь может обновлять свои файлы
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'images');

-- Политика: любой аутентифицированный пользователь может удалять свои файлы
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = owner);

-- Политика: все могут читать публичные изображения
CREATE POLICY "Public images are accessible to all"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- ШАГ 4: Убедимся, что RLS включен
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ШАГ 5: Проверка политик (опционально)
-- Выполните это, чтобы увидеть созданные политики:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects';
