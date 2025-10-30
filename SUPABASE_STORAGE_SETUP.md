# Настройка Supabase Storage для изображений

## Этап 1: Создание bucket для изображений

### В Supabase Dashboard:

1. Перейдите в раздел **Storage** → **Buckets**
2. Нажмите **New Bucket**
3. Укажите название: `images`
4. Выберите **Public bucket** (для публичного доступа к изображениям)
5. Нажмите **Create bucket**

## Этап 2: Настройка политик доступа (Storage Policies)

### Политики для bucket `images`:

```sql
-- 1. Разрешить всем пользователям загружать изображения
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] IN ('users', 'requests', 'offers', 'messages')
);

-- 2. Разрешить пользователям удалять свои изображения
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Разрешить публичный доступ к изображениям (для чтения)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

## Структура папок в bucket `images`:

```
images/
├── users/         - аватары пользователей
├── requests/      - фото для запросов помощи
├── offers/        - фото для предложений доноров
└── messages/      - изображения в сообщениях чата
```

## Как использовать в коде:

### Загрузка изображения:

```typescript
import { storageService } from '@/services/supabase'

// Загрузить изображение
const handleImageUpload = async (file: File) => {
  try {
    const { path, url } = await storageService.uploadImage(file, 'requests')
    console.log('Uploaded:', url)
    return url
  } catch (error) {
    console.error('Upload error:', error)
  }
}
```

### Получение публичного URL:

```typescript
const publicUrl = await storageService.getPublicUrl('images', 'requests/abc123.jpg')
```

### Удаление изображения:

```typescript
await storageService.deleteFile('images', 'requests/abc123.jpg')
```

## Ограничения размера файлов

В Supabase Dashboard → Storage → Settings можно настроить:
- Максимальный размер файла (рекомендуется 5MB для изображений)
- Разрешенные MIME-типы: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## Оптимизация изображений

Рекомендуется использовать Supabase Image Transformation API:

```typescript
// Получить изображение с измененным размером
const resizedUrl = supabase
  .storage
  .from('images')
  .getPublicUrl('requests/image.jpg', {
    transform: {
      width: 800,
      height: 600,
      quality: 80
    }
  })
```

## Проверка работы Storage

После настройки можно протестировать загрузку через Supabase Dashboard:
1. Storage → images → Upload file
2. Загрузите тестовое изображение
3. Проверьте, что оно доступно по публичной ссылке

## Troubleshooting

### Ошибка "Access denied"
- Проверьте, что bucket создан как **Public**
- Проверьте Storage Policies
- Убедитесь, что пользователь аутентифицирован

### Ошибка "File too large"
- Проверьте настройки максимального размера файла в Storage Settings
- Сожмите изображение перед загрузкой

### Изображения не отображаются
- Проверьте CORS настройки в Supabase Dashboard
- Убедитесь, что URL правильно сформирован
- Проверьте политику "Anyone can view images"
