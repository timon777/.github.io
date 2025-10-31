# Настройка Storage для загрузки изображений

## Проблема
При попытке выполнить SQL политики через SQL Editor появляется ошибка:
```
ERROR: 42501: must be owner of table objects
```

## Решение: Настройка через UI

### Шаг 1: Создание Bucket

1. Откройте **Supabase Dashboard**
2. Перейдите в **Storage** (левое меню)
3. Нажмите **"New bucket"**
4. Введите имя: `images`
5. Установите **Public bucket: ON** ✅
6. Нажмите **"Create bucket"**

### Шаг 2: Настройка политик

1. Нажмите на созданный bucket **"images"**
2. Перейдите на вкладку **"Policies"**
3. Нажмите **"New Policy"**

#### Политика 1: Загрузка файлов (INSERT)

```
Policy Name: Allow authenticated users to upload
Allowed operation: INSERT
Target roles: authenticated
Policy definition: true
```

Или используйте шаблон:
- Выберите **"Allow uploads for authenticated users only"**
- Нажмите **"Use this template"**

#### Политика 2: Чтение файлов (SELECT)

```
Policy Name: Allow public access
Allowed operation: SELECT
Target roles: public
Policy definition: true
```

Или используйте шаблон:
- Выберите **"Allow public read access"**
- Нажмите **"Use this template"**

#### Политика 3: Удаление своих файлов (DELETE)

```
Policy Name: Allow users to delete own files
Allowed operation: DELETE
Target roles: authenticated
Policy definition: auth.uid() = owner
```

Или используйте шаблон:
- Выберите **"Allow authenticated users to delete own files"**
- Нажмите **"Use this template"**

### Шаг 3: Проверка

После создания политик вы должны увидеть 3 активные политики в списке:
- ✅ Allow authenticated users to upload (INSERT)
- ✅ Allow public access (SELECT)
- ✅ Allow users to delete own files (DELETE)

### Шаг 4: Добавление полей в таблицу users

Выполните этот SQL в **SQL Editor**:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT;
```

## Готово! 🎉

После выполнения всех шагов:
- ✅ Загрузка аватара будет работать
- ✅ Сохранение биографии будет работать
- ✅ Редактирование профиля полностью функционально

## Альтернатива: Быстрая настройка

Если нужно быстро:
1. Создайте bucket `images`
2. Включите **Public bucket: ON**
3. В разделе Policies нажмите **"Add policy from template"**
4. Выберите шаблон **"Allow all operations for authenticated users"**
5. Готово!

## Проверка работоспособности

1. Перейдите на страницу редактирования профиля
2. Попробуйте загрузить аватар
3. Сохраните изменения
4. Аватар должен появиться в профиле
