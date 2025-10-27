# Настройка Supabase для Úmit Platform

Инструкция по созданию базы данных для социального реестра адресной помощи.

## 📋 Шаг 1: Подготовка

Убедитесь, что у вас есть:
- ✅ Аккаунт в [Supabase](https://supabase.com)
- ✅ Созданный проект в Supabase
- ✅ Доступ к SQL Editor в Dashboard

## 🗄️ Шаг 2: Создание схемы базы данных

1. **Откройте Supabase Dashboard** → ваш проект
2. Перейдите в **SQL Editor** (левое меню)
3. Создайте **New Query**
4. **Скопируйте содержимое** файла `supabase-schema.sql`
5. **Вставьте в редактор** и нажмите **Run**

⏱️ Выполнение займет 10-30 секунд.

### Что будет создано:

#### Таблицы:
- `users` - профили пользователей
- `locations` - местоположения
- `help_requests` - запросы помощи
- `needed_items` - необходимые предметы
- `donor_offers` - предложения доноров (реестр)
- `responses` - отклики на запросы
- `offered_items` - предложенные предметы
- `shelters` - приюты
- `shelter_needs` - потребности приютов
- `achievements` - достижения волонтеров
- `user_stats` - статистика пользователей
- `emergencies` - чрезвычайные ситуации
- `request_volunteers` - связь волонтеров с запросами

#### Безопасность:
- ✅ Row Level Security (RLS) для всех таблиц
- ✅ Политики доступа (прозрачность данных)
- ✅ Триггеры для авто-создания профилей
- ✅ Функции для обновления updated_at

#### Дополнительно:
- ✅ PostGIS для геопоиска
- ✅ Индексы для быстрого поиска
- ✅ Автоматические триггеры

## 🔍 Шаг 3: Проверка

После выполнения скрипта проверьте:

1. **Table Editor** → должны появиться все 13 таблиц
2. **Database** → **Policies** → должны быть политики RLS
3. **Database** → **Functions** → должны быть функции

## 🎯 Шаг 4: Подключение к приложению

Скопируйте из **Settings** → **API**:
- Project URL
- anon public key

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🚀 Шаг 5: Запуск приложения

```bash
npm run dev
```

Приложение автоматически:
- ✅ Подключится к Supabase, если `.env` настроен
- ✅ Будет использовать mock данные, если база пуста
- ✅ Переключится в demo режим, если `.env` отсутствует

## 📊 Добавление демо данных

После создания пользователей через регистрацию:

1. Откройте `supabase-demo-data.sql`
2. Замените `USER_UUID_HERE` на реальные UUID
3. Раскомментируйте INSERT запросы
4. Выполните в SQL Editor

**Или** оставьте demo режим - приложение покажет 12 mock объявлений.

## 🔧 Полезные SQL запросы

### Получить все активные предложения:
```sql
SELECT 
  o.*,
  u.first_name,
  u.last_name,
  l.address,
  l.city
FROM public.donor_offers o
JOIN public.users u ON o.donor_id = u.id
JOIN public.locations l ON o.location_id = l.id
WHERE o.status = 'active'
ORDER BY o.created_at DESC;
```

### Проверить пользователей:
```sql
SELECT * FROM public.users;
```

### Статистика пользователя:
```sql
SELECT 
  u.first_name,
  s.requests_created,
  s.donations_made
FROM public.users u
JOIN public.user_stats s ON u.id = s.user_id;
```

## 🛡️ Безопасность

### Row Level Security (RLS)

Все таблицы защищены RLS политиками:

- **Чтение** - доступно всем (прозрачность платформы)
- **Создание** - только авторизованные пользователи
- **Обновление** - только владельцы записей
- **Удаление** - только владельцы записей

### Примеры политик:

**Пользователи могут обновлять только свой профиль:**
```sql
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

**Доноры могут управлять своими предложениями:**
```sql
CREATE POLICY "Donors can update own offers"
  ON public.donor_offers FOR UPDATE
  USING (auth.uid() = donor_id);
```

## 🗺️ PostGIS для геопоиска

База данных поддерживает географический поиск:

```sql
-- Найти все предложения в радиусе 5 км от точки
SELECT 
  o.title,
  ST_Distance(l.geom, ST_SetSRID(ST_MakePoint(71.4491, 51.1694), 4326)) as distance_meters
FROM public.donor_offers o
JOIN public.locations l ON o.location_id = l.id
WHERE ST_DWithin(
  l.geom,
  ST_SetSRID(ST_MakePoint(71.4491, 51.1694), 4326),
  5000 -- 5 км в метрах
)
ORDER BY distance_meters;
```

## 🔄 Обновление схемы

При изменении типов в TypeScript (`src/types/index.ts`):

1. Обновите соответствующие таблицы в SQL
2. Добавьте миграцию через Supabase CLI
3. Или выполните ALTER TABLE в SQL Editor

## 📝 Примечания

- **PostGIS** может потребовать активации в **Database** → **Extensions**
- **Триггеры** автоматически создают профиль при регистрации
- **Demo режим** безопасен - не требует подключения к БД
- **Mock данные** хранятся в `src/services/mockData.ts`

## 🆘 Troubleshooting

### "Role postgis does not exist"
→ Активируйте PostGIS в **Database** → **Extensions**

### "Permission denied for table"
→ Проверьте RLS политики в **Database** → **Policies**

### "Function handle_new_user already exists"
→ Это нормально при повторном запуске. Используйте `CREATE OR REPLACE`

### Приложение показывает mock данные
→ Это нормально! База пуста - fallback работает корректно

## 📚 Дополнительно

- [Документация Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostGIS Documentation](https://postgis.net/docs/)

---

**Готово!** Теперь у вас полностью настроенная база данных для Úmit платформы 🎉
