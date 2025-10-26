# 🚀 Настройка Supabase для Úmit Platform

## 📋 Что такое Supabase?

**Supabase** — это открытая альтернатива Firebase с встроенной PostgreSQL базой данных, аутентификацией, хранилищем файлов и real-time подписками.

### Преимущества Supabase:
- ✅ **Бесплатный тариф** — идеально для MVP
- ✅ **Встроенная аутентификация** — email, OAuth, magic links
- ✅ **PostgreSQL** — мощная реляционная БД
- ✅ **Row Level Security (RLS)** — безопасность на уровне строк
- ✅ **Real-time** — подписки на изменения данных
- ✅ **Storage** — встроенное хранилище файлов
- ✅ **Auto-generated API** — REST и GraphQL из коробки

---

## 🎯 Шаг 1: Создание проекта в Supabase

### 1.1 Регистрация
1. Перейдите на https://supabase.com
2. Нажмите **Start your project**
3. Зарегистрируйтесь через GitHub или email

### 1.2 Создание нового проекта
1. Нажмите **New Project**
2. Выберите организацию
3. Заполните форму:
   - **Name**: `umit-platform`
   - **Database Password**: Придумайте надежный пароль (сохраните его!)
   - **Region**: Выберите ближайший (например, Frankfurt для Казахстана)
   - **Pricing Plan**: Free (для начала)
4. Нажмите **Create new project**
5. Подождите 1-2 минуты пока проект создается

---

## 🗄️ Шаг 2: Настройка базы данных

### 2.1 Запуск SQL схемы
1. В боковом меню выберите **SQL Editor**
2. Нажмите **New query**
3. Скопируйте содержимое файла `supabase-schema.sql`
4. Вставьте в редактор
5. Нажмите **Run** или `Ctrl+Enter`
6. Дождитесь выполнения (зеленая галочка)

### 2.2 Проверка таблиц
1. В боковом меню выберите **Table Editor**
2. Убедитесь, что созданы таблицы:
   - ✅ users
   - ✅ locations
   - ✅ help_requests
   - ✅ shelters
   - ✅ responses
   - ✅ achievements
   - ✅ emergencies

---

## 🔐 Шаг 3: Настройка аутентификации

### 3.1 Базовые настройки
1. В боковом меню выберите **Authentication** → **Providers**
2. Включите **Email**:
   - Enable Email provider
   - Confirm email: **OFF** (для тестирования)
3. Сохраните

### 3.2 Email Templates (опционально)
1. **Authentication** → **Email Templates**
2. Настройте шаблоны писем на русском языке
3. Измените **Confirm signup**, **Reset password** и т.д.

---

## 🔑 Шаг 4: Получение API ключей

### 4.1 Найдите ключи
1. В боковом меню выберите **Settings** → **API**
2. Скопируйте два значения:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (длинный ключ)

### 4.2 Обновите .env файл
```bash
# Откройте .env в корне проекта
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
```

⚠️ **Важно**: Не коммитьте .env в Git! Он уже в .gitignore

---

## 📦 Шаг 5: Storage (Хранилище файлов)

### 5.1 Создание buckets
Buckets уже созданы через SQL схему:
- `avatars` - аватары пользователей
- `request-images` - фото запросов помощи
- `shelter-images` - фото приютов

### 5.2 Проверка
1. **Storage** → Проверьте наличие buckets
2. Убедитесь что они публичные (public)

---

## 🧪 Шаг 6: Тестирование подключения

### 6.1 Установка зависимостей
```bash
npm install
```

### 6.2 Запуск приложения
```bash
npm run dev
```

### 6.3 Тест регистрации
1. Откройте http://localhost:3000
2. Нажмите **Регистрация**
3. Заполните форму:
   - Email: test@example.com
   - Пароль: test123
   - Роль: Волонтер
4. Нажмите **Зарегистрироваться**

### 6.4 Проверка в Supabase
1. **Authentication** → **Users**
2. Должен появиться новый пользователь
3. **Table Editor** → **users**
4. Должна быть запись с данными пользователя

---

## 📊 Шаг 7: Просмотр данных

### 7.1 Table Editor
- Просматривайте и редактируйте данные прямо в интерфейсе
- Добавляйте тестовые записи

### 7.2 SQL Editor
- Пишите SQL запросы для сложной аналитики
- Экспортируйте данные

---

## 🔒 Row Level Security (RLS)

### Что это?
RLS обеспечивает безопасность на уровне строк. Пользователи видят только те данные, к которым у них есть доступ.

### Наши политики:
```sql
-- Пользователи видят все профили
"Users can view all profiles"

-- Пользователи могут редактировать только свой профиль
"Users can update own profile"

-- Запросы помощи может создавать только бенефициар
"Beneficiaries can create requests"
```

Все политики уже настроены в `supabase-schema.sql`

---

## 🌐 Real-time подписки (опционально)

### Включение Real-time
1. **Database** → **Replication**
2. Выберите таблицы для Real-time:
   - help_requests
   - responses
   - emergencies
3. Включите Publication

### Использование в коде
```typescript
// Подписка на новые запросы
supabase
  .channel('help_requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'help_requests'
  }, (payload) => {
    console.log('Новый запрос:', payload)
  })
  .subscribe()
```

---

## 📱 Полезные фичи Supabase

### 1. Database Webhooks
Вызов внешних API при изменении данных

### 2. Edge Functions
Serverless функции на Deno

### 3. Database Functions
PostgreSQL функции для сложной логики

### 4. Extensions
PostGIS для геоданных, pg_cron для задач и т.д.

---

## 🐛 Troubleshooting

### Проблема: "Invalid API key"
**Решение**: Проверьте что VITE_SUPABASE_ANON_KEY скопирован полностью

### Проблема: "Row Level Security policy violation"
**Решение**: Проверьте что RLS политики применены (смотрите SQL схему)

### Проблема: "relation does not exist"
**Решение**: Запустите supabase-schema.sql заново

### Проблема: Не приходит email подтверждения
**Решение**: В тестовом режиме отключите "Confirm email" в Authentication

---

## 📚 Полезные ссылки

- 📖 [Supabase Docs](https://supabase.com/docs)
- 🎓 [Supabase YouTube](https://www.youtube.com/@Supabase)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🔧 [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## 🎯 Следующие шаги

После настройки Supabase:

1. ✅ Протестируйте регистрацию и вход
2. ✅ Создайте тестовые запросы помощи
3. ✅ Добавьте приюты
4. ✅ Загрузите фото через Storage
5. ✅ Настройте деплой на Vercel/Netlify

---

## 💡 Pro Tips

### Бесплатный тариф лимиты:
- 500 MB базы данных
- 1 GB хранилища файлов
- 50,000 активных пользователей
- 2 GB трафика

Для MVP этого более чем достаточно!

### Бэкапы:
Supabase автоматически делает дневные бэкапы на Free плане.

### Миграции:
Используйте Supabase CLI для версионирования схемы БД.

---

**Готово!** 🎉 Ваш Supabase бэкенд настроен и готов к работе!
