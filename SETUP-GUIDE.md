# 🎯 Финальная настройка Supabase

Выполните эти шаги для завершения настройки проекта.

---

## 1️⃣ Настройка CORS и Authentication

### Откройте: **Authentication** → **URL Configuration**

Установите:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** Добавьте:
  ```
  http://localhost:3000/**
  ```

✅ Сохраните изменения

---

## 2️⃣ Добавление полей в таблицу users

### Откройте: **SQL Editor**

Выполните:

```sql
-- Добавление полей для профиля
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Проверка
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('avatar_url', 'bio', 'phone');
```

Должны увидеть:
- `avatar_url | text` ✅
- `bio | text` ✅
- `phone | text` (или другой тип) ✅

---

## 3️⃣ Настройка Storage (если ещё не сделано)

### Шаг 1: Создание bucket

**Storage** → **New bucket**
- Name: `images`
- **Public bucket:** ✅ ВКЛ
- **Create bucket**

### Шаг 2: Настройка политик

**Storage** → bucket **"images"** → **Policies**

#### Создайте 3 политики:

**Политика 1: Загрузка (INSERT)**
- Name: `Users can upload images`
- Operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `true`

**Политика 2: Чтение (SELECT)**
- Name: `Anyone can view images`
- Operation: `SELECT`
- Target roles: `public`
- Policy definition: `true`

**Политика 3: Удаление (DELETE)**
- Name: `Users can delete their own images`
- Operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `auth.uid() = owner`

✅ Должны быть 3 активные политики

---

## 4️⃣ Проверка работоспособности

### 1. Запустите приложение:

```bash
# Если порт занят
npm run kill-port && npm run dev

# Или просто
npm run dev
```

### 2. Откройте: `http://localhost:3000`

### 3. Протестируйте:

- ✅ Вход в систему
- ✅ Редактирование профиля (`/profile/edit`)
- ✅ Загрузка аватара
- ✅ Сохранение биографии
- ✅ Подача жалобы на запрос/предложение/отзыв
- ✅ Админ-панель модерации (`/admin/moderation`)

---

## 🐛 Если возникают ошибки:

### CORS ошибка:
- Проверьте Site URL в **Authentication** → **URL Configuration**
- Должно быть точно: `http://localhost:3000`

### Storage RLS ошибка:
- Убедитесь, что bucket `images` **публичный**
- Проверьте, что есть все 3 политики
- Попробуйте временно: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;` (только для теста!)

### Порт меняется:
```bash
npm run kill-port && npm run dev
```

---

## ✅ Готово!

После выполнения всех шагов:
- ✅ Система модерации работает
- ✅ Редактирование профиля работает
- ✅ Загрузка изображений работает
- ✅ Порт фиксирован на 3000
- ✅ Все функции Этапа 2 реализованы

---

## 📚 Полезные ссылки:

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Storage Docs:** https://supabase.com/docs/guides/storage
- **RLS Policies:** https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 Этап 2 завершен!

Реализовано:
1. ✅ Система отзывов и рейтингов
2. ✅ Система верификации
3. ✅ Система модерации
4. ✅ Редактирование профиля

Следующий этап: Этап 3 (по желанию)
