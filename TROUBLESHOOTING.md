# ✅ Решение проблемы регистрации - Итоговый отчет

## 🔴 Исходная проблема

При регистрации пользователя возникала ошибка:
```
{"code":"unexpected_failure","message":"Database error saving new user"}
```

---

## 🔍 Диагностика (пошаговая)

### Этап 1: Проверка API ключа
**Проблема:** Ошибка `No API key found in request`
**Причина:** `.env` файл не был обновлен с реальными Supabase credentials
**Решение:** Обновлен `.env` файл с настоящими URL и ANON_KEY

### Этап 2: Проверка базы данных
**Проблема:** `Database error saving new user`
**Причина:** SQL скрипт был выполнен, но триггер не работал
**Диагностика:**
- ✅ Таблица `users` существует
- ✅ Триггер `on_auth_user_created` существует
- ✅ Функция `handle_new_user()` существует
- ❌ RLS политика для INSERT отсутствует

**Решение:** Добавлена RLS политика:
```sql
CREATE POLICY "Allow user creation during signup" ON public.users
  FOR INSERT
  WITH CHECK (true);
```

### Этап 3: Проверка триггера
**Проблема:** После добавления RLS всё равно ошибка
**Причина:** В логах PostgreSQL: `type "user_role" does not exist`
**Диагностика:**
- Enum тип `user_role` существует в базе ✅
- Колонка `role` правильно использует `USER-DEFINED` тип ✅
- **НО** функция триггера была создана ДО создания типа и кэшировала ошибку ❌

**Решение:** Полное пересоздание функции триггера:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'beneficiary'::public.user_role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Финальное решение

### Выполненные SQL команды:

1. **Откат заблокированной транзакции:**
```sql
ROLLBACK;
```

2. **Проверка существования типа:**
```sql
SELECT n.nspname as schema, t.typname as type_name
FROM pg_type t
LEFT JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'user_role';
-- Результат: тип существует в схеме public ✅
```

3. **Добавление RLS политики для INSERT:**
```sql
CREATE POLICY "Allow user creation during signup" ON public.users
  FOR INSERT
  WITH CHECK (true);
```

4. **Пересоздание функции триггера с правильным search_path:**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'beneficiary'::public.user_role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 Результат

- ✅ Регистрация работает
- ✅ Пользователи создаются в таблице `public.users`
- ✅ Триггер корректно обрабатывает метаданные из `raw_user_meta_data`
- ✅ RLS политики настроены правильно

---

## 📝 Важные выводы

### Почему это произошло?

1. **Порядок выполнения SQL:** Скорее всего при первом запуске `supabase-schema.sql` часть команд была выполнена не полностью или с ошибками
2. **Кэширование функций PostgreSQL:** После первой ошибки функция триггера "запомнила" что типа не существует
3. **RLS политики:** Были созданы только для SELECT и UPDATE, но не для INSERT

### Как избежать в будущем?

1. **Выполнять SQL скрипты целиком** через Supabase SQL Editor (не по частям)
2. **Проверять логи PostgreSQL** сразу после выполнения
3. **Всегда создавать RLS политики для всех операций:** SELECT, INSERT, UPDATE, DELETE
4. **При ошибках с типами** - делать `DROP FUNCTION ... CASCADE` и пересоздавать

---

## 🚀 Дополнительная работа

В процессе решения также был добавлен:

- **DEMO MODE** - возможность работы без Supabase (с mock данными)
- **Debug логирование** - показывает конфигурацию Supabase при запуске
- **Документация DEMO_MODE.md** - как работать без БД

---

## 📊 Текущие настройки

### RLS Политики на таблице users:

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
```

Результат:
- ✅ `Allow user creation during signup` (INSERT)
- ✅ `Users can update own profile` (UPDATE)
- ✅ `Users can view all profiles` (SELECT)

### Триггеры:

```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Результат:
- ✅ `on_auth_user_created` активен на таблице `auth.users`

---

**Дата решения:** 27 октября 2025
**Статус:** ✅ РЕШЕНО
