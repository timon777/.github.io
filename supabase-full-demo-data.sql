-- ============================================
-- Úmit Platform - Полные демонстрационные данные
-- ============================================
-- Этот скрипт создает полный набор демо-данных для тестирования платформы
-- ВАЖНО: Выполняйте этот скрипт ПОСЛЕ supabase-schema.sql
-- ============================================

-- Очистка существующих демо-данных (опционально)
-- TRUNCATE TABLE public.offered_items, public.responses, public.needed_items,
--   public.donor_offers, public.help_requests, public.shelters,
--   public.achievements, public.user_stats, public.emergencies,
--   public.users, public.locations CASCADE;

-- ============================================
-- 1. МЕСТОПОЛОЖЕНИЯ (Города Казахстана)
-- ============================================

INSERT INTO public.locations (id, address, city, region, latitude, longitude) VALUES
-- Астана
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'пр. Кабанбай батыра, 21', 'Астана', 'Акмолинская область', 51.1694, 71.4491),
('550e8400-e29b-41d4-a716-446655440001', 'ул. Достык, 13', 'Астана', 'Акмолинская область', 51.1801, 71.4460),
('550e8400-e29b-41d4-a716-446655440002', 'мкр. Северное Сияние, 25', 'Астана', 'Акмолинская область', 51.2151, 71.3956),
('550e8400-e29b-41d4-a716-446655440003', 'ул. Сарыарка, 45', 'Астана', 'Акмолинская область', 51.1605, 71.4704),
('550e8400-e29b-41d4-a716-446655440004', 'мкр. Алматы, 8', 'Астана', 'Акмолинская область', 51.1246, 71.4050),

-- Алматы
('550e8400-e29b-41d4-a716-446655440005', 'пр. Абая, 143', 'Алматы', 'Алматинская область', 43.2566, 76.9286),
('550e8400-e29b-41d4-a716-446655440006', 'ул. Толе би, 59', 'Алматы', 'Алматинская область', 43.2627, 76.9488),
('550e8400-e29b-41d4-a716-446655440007', 'мкр. Аксай-3, 12', 'Алматы', 'Алматинская область', 43.2117, 76.8512),
('550e8400-e29b-41d4-a716-446655440008', 'ул. Сатпаева, 90', 'Алматы', 'Алматинская область', 43.2367, 76.9005),

-- Шымкент
('550e8400-e29b-41d4-a716-446655440009', 'пр. Тауке хана, 4', 'Шымкент', 'Туркестанская область', 42.3417, 69.5901),
('550e8400-e29b-41d4-a716-446655440010', 'ул. Байтурсынова, 23', 'Шымкент', 'Туркестанская область', 42.3154, 69.5986),

-- Караганда
('550e8400-e29b-41d4-a716-446655440011', 'пр. Бухар Жырау, 66', 'Караганда', 'Карагандинская область', 49.8047, 73.1094),
('550e8400-e29b-41d4-a716-446655440012', 'ул. Ермекова, 78', 'Караганда', 'Карагандинская область', 49.8333, 73.1667);

-- ============================================
-- 2. ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ
-- ============================================
-- ВАЖНО: Пользователи создаются через Supabase Auth
-- Используйте эти данные для регистрации через интерфейс:
--
-- 1. Админ:
--    Email: admin@umit.kz
--    Password: Admin123!
--    Role: admin
--
-- 2. Донор 1:
--    Email: donor1@umit.kz
--    Password: Donor123!
--    Role: donor
--
-- 3. Донор 2:
--    Email: donor2@umit.kz
--    Password: Donor123!
--    Role: donor
--
-- 4. Благополучатель 1:
--    Email: beneficiary1@umit.kz
--    Password: Bene123!
--    Role: beneficiary
--
-- 5. Благополучатель 2:
--    Email: beneficiary2@umit.kz
--    Password: Bene123!
--    Role: beneficiary
--
-- 6. Волонтер:
--    Email: volunteer@umit.kz
--    Password: Vol123!
--    Role: volunteer
--
-- 7. Менеджер приюта:
--    Email: shelter@umit.kz
--    Password: Shelter123!
--    Role: shelter

-- После регистрации выполните эти INSERT с реальными UUID:
-- Замените 'USER_UUID_ADMIN', 'USER_UUID_DONOR1' и т.д. на реальные UUID

/*
-- Обновление профилей после регистрации
UPDATE public.users SET
  first_name = 'Максим',
  last_name = 'Марченко',
  phone = '+7 777 123 4567',
  verified = true,
  rating = 5.0
WHERE email = 'admin@umit.kz';

UPDATE public.users SET
  first_name = 'Айгуль',
  last_name = 'Нурсултанова',
  phone = '+7 701 234 5678',
  verified = true,
  rating = 4.8
WHERE email = 'donor1@umit.kz';

UPDATE public.users SET
  first_name = 'Ерлан',
  last_name = 'Қасымов',
  phone = '+7 702 345 6789',
  verified = true,
  rating = 4.9
WHERE email = 'donor2@umit.kz';

UPDATE public.users SET
  first_name = 'Асель',
  last_name = 'Смағұлова',
  phone = '+7 777 456 7890',
  verified = false
WHERE email = 'beneficiary1@umit.kz';

UPDATE public.users SET
  first_name = 'Дина',
  last_name = 'Әбдіқалық',
  phone = '+7 708 567 8901',
  verified = false
WHERE email = 'beneficiary2@umit.kz';

UPDATE public.users SET
  first_name = 'Арман',
  last_name = 'Бектасов',
  phone = '+7 775 678 9012',
  verified = true,
  rating = 4.7
WHERE email = 'volunteer@umit.kz';

UPDATE public.users SET
  first_name = 'Гүлнар',
  last_name = 'Тоқтарова',
  phone = '+7 771 789 0123',
  verified = true,
  rating = 4.6
WHERE email = 'shelter@umit.kz';
*/

-- ============================================
-- 3. ЗАПРОСЫ ПОМОЩИ
-- ============================================
-- Замените USER_UUID_BENEFICIARY1 и USER_UUID_BENEFICIARY2 на реальные UUID

/*
INSERT INTO public.help_requests (
  id, title, description, category, status, priority,
  beneficiary_id, location_id, images, created_at
) VALUES
-- Запросы от благополучателя 1
(
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'Требуется продуктовая помощь для многодетной семьи',
  'Семья из 6 человек (4 детей от 2 до 10 лет) остро нуждается в продуктах питания. Отец потерял работу месяц назад, мать в декрете.',
  'food',
  'approved',
  'high',
  'USER_UUID_BENEFICIARY1',
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e'],
  NOW() - INTERVAL '2 days'
),
(
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  'Детская одежда на зиму (3-5 лет)',
  'Нужна теплая зимняя одежда для двоих детей 3 и 5 лет - куртки, штаны, сапоги.',
  'clothing',
  'pending',
  'medium',
  'USER_UUID_BENEFICIARY1',
  '550e8400-e29b-41d4-a716-446655440001',
  NULL,
  NOW() - INTERVAL '1 day'
),

-- Запросы от благополучателя 2
(
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  'Срочно: лекарства для пожилой матери',
  'Мама 78 лет, диабетик, нужен инсулин и тест-полоски. Пенсии не хватает на лекарства.',
  'medicine',
  'approved',
  'urgent',
  'USER_UUID_BENEFICIARY2',
  '550e8400-e29b-41d4-a716-446655440005',
  NULL,
  NOW() - INTERVAL '3 hours'
),
(
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  'Помощь в ремонте протекающей крыши',
  'После дождей крыша протекает, нужны материалы и помощь в ремонте. Живу одна с инвалидностью.',
  'construction',
  'pending',
  'high',
  'USER_UUID_BENEFICIARY2',
  '550e8400-e29b-41d4-a716-446655440006',
  ARRAY['https://images.unsplash.com/photo-1521791055366-0d553872125f'],
  NOW() - INTERVAL '5 days'
),
(
  '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  'Бытовая техника: холодильник',
  'Сломался холодильник, семье из 4 человек негде хранить продукты. Может кто-то отдаст старый, но работающий.',
  'household',
  'approved',
  'medium',
  'USER_UUID_BENEFICIARY2',
  '550e8400-e29b-41d4-a716-446655440006',
  NULL,
  NOW() - INTERVAL '4 days'
);
*/

-- ============================================
-- 4. НЕОБХОДИМЫЕ ПРЕДМЕТЫ ДЛЯ ЗАПРОСОВ
-- ============================================

/*
INSERT INTO public.needed_items (request_id, name, quantity, unit, received) VALUES
-- Для продуктовой помощи
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Мука', 10, 'кг', 0),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Сахар', 5, 'кг', 0),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Растительное масло', 3, 'л', 0),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Макароны', 5, 'кг', 2),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Крупы (гречка, рис)', 8, 'кг', 0),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Консервы мясные', 10, 'банка', 5),

-- Для детской одежды
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Зимняя куртка', 2, 'шт', 0),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Теплые штаны', 2, 'шт', 0),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Зимние сапоги', 2, 'пара', 0),

-- Для лекарств
('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Инсулин длительного действия', 2, 'упаковка', 0),
('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Тест-полоски для глюкометра', 100, 'шт', 0),

-- Для ремонта крыши
('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'Шифер', 15, 'лист', 0),
('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'Гвозди', 2, 'кг', 0),
('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'Рубероид', 2, 'рулон', 0);
*/

-- ============================================
-- 5. ПРЕДЛОЖЕНИЯ ДОНОРОВ (Реестр)
-- ============================================
-- Замените USER_UUID_DONOR1 и USER_UUID_DONOR2 на реальные UUID

/*
INSERT INTO public.donor_offers (
  id, title, description, category, type, status,
  donor_id, location_id, quantity, unit,
  contact_phone, expires_at, created_at
) VALUES
-- Предложения от донора 1
(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  'Детская одежда на 3-5 лет (20 единиц)',
  'Качественная детская одежда в отличном состоянии. Куртки, штаны, свитера, платья. Мой ребенок вырос.',
  'clothing',
  'goods',
  'active',
  'USER_UUID_DONOR1',
  '550e8400-e29b-41d4-a716-446655440002',
  20, 'шт',
  '+7 701 234 5678',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day'
),
(
  '7c9e6679-7425-40de-944b-e07fc1f90ae8',
  'Продукты длительного хранения',
  'Крупы, макароны, консервы, масло. Закупил оптом, готов поделиться.',
  'food',
  'goods',
  'active',
  'USER_UUID_DONOR1',
  '550e8400-e29b-41d4-a716-446655440002',
  NULL, NULL,
  '+7 701 234 5678',
  NOW() + INTERVAL '14 days',
  NOW() - INTERVAL '3 hours'
),

-- Предложения от донора 2
(
  '7c9e6679-7425-40de-944b-e07fc1f90ae9',
  'Бесплатная юридическая консультация',
  'Профессиональный юрист. Помогу с оформлением документов, консультацией по социальным вопросам.',
  'legal_service',
  'service',
  'active',
  'USER_UUID_DONOR2',
  '550e8400-e29b-41d4-a716-446655440003',
  NULL, NULL,
  '+7 702 345 6789',
  NOW() + INTERVAL '60 days',
  NOW() - INTERVAL '5 days'
),
(
  '7c9e6679-7425-40de-944b-e07fc1f90aea',
  'Холодильник Атлант (б/у, рабочий)',
  'Старый, но полностью рабочий холодильник. Морозилка работает. Самовывоз.',
  'household',
  'goods',
  'active',
  'USER_UUID_DONOR2',
  '550e8400-e29b-41d4-a716-446655440003',
  1, 'шт',
  '+7 702 345 6789',
  NOW() + INTERVAL '20 days',
  NOW() - INTERVAL '2 days'
),
(
  '7c9e6679-7425-40de-944b-e07fc1f90aeb',
  'Стройматериалы остались после ремонта',
  'Шифер 10 листов, рубероид 1 рулон, гвозди. Отдам даром, самовывоз.',
  'construction',
  'goods',
  'active',
  'USER_UUID_DONOR2',
  '550e8400-e29b-41d4-a716-446655440004',
  NULL, NULL,
  '+7 702 345 6789',
  NOW() + INTERVAL '15 days',
  NOW() - INTERVAL '6 days'
);
*/

-- ============================================
-- 6. ОТКЛИКИ НА ЗАПРОСЫ ПОМОЩИ
-- ============================================

/*
INSERT INTO public.responses (
  id, request_id, donor_id, message, status, created_at
) VALUES
-- Отклик донора 1 на продуктовую помощь
(
  '8d9e7780-8536-51ef-a55c-f18ed2e01bf8',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'USER_UUID_DONOR1',
  'Могу помочь с продуктами! У меня есть крупы, макароны и консервы. Когда можем встретиться?',
  'accepted',
  NOW() - INTERVAL '1 day'
),

-- Отклик донора 2 на ремонт крыши
(
  '8d9e7780-8536-51ef-a55c-f18ed2e01bf9',
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  'USER_UUID_DONOR2',
  'У меня остались стройматериалы после ремонта. Могу помочь и с работой в выходные.',
  'pending',
  NOW() - INTERVAL '3 hours'
);
*/

-- ============================================
-- 7. ПРЕДЛОЖЕННЫЕ ПРЕДМЕТЫ В ОТКЛИКАХ
-- ============================================

/*
INSERT INTO public.offered_items (response_id, name, quantity, unit) VALUES
-- Для отклика на продукты
('8d9e7780-8536-51ef-a55c-f18ed2e01bf8', 'Гречневая крупа', 3, 'кг'),
('8d9e7780-8536-51ef-a55c-f18ed2e01bf8', 'Рис', 2, 'кг'),
('8d9e7780-8536-51ef-a55c-f18ed2e01bf8', 'Макароны', 2, 'кг'),
('8d9e7780-8536-51ef-a55c-f18ed2e01bf8', 'Консервы мясные', 5, 'банка'),

-- Для отклика на ремонт крыши
('8d9e7780-8536-51ef-a55c-f18ed2e01bf9', 'Шифер', 10, 'лист'),
('8d9e7780-8536-51ef-a55c-f18ed2e01bf9', 'Рубероид', 1, 'рулон'),
('8d9e7780-8536-51ef-a55c-f18ed2e01bf9', 'Гвозди', 1, 'кг');
*/

-- ============================================
-- 8. ПРИЮТЫ
-- ============================================

/*
INSERT INTO public.shelters (
  id, name, description, type, location_id,
  contact_email, contact_phone, verified, rating,
  manager_id, created_at
) VALUES
(
  '9e0e8891-9647-62de-b66d-e29ae3a12ce9',
  'Приют для бездомных животных "Надежда"',
  'Приют для собак и кошек. Принимаем животных, помогаем с лечением и поиском хозяев. Всегда нужны корма и медикаменты.',
  'animal',
  '550e8400-e29b-41d4-a716-446655440007',
  'shelter@umit.kz',
  '+7 771 789 0123',
  true,
  4.6,
  'USER_UUID_SHELTER',
  NOW() - INTERVAL '30 days'
),
(
  '9e0e8891-9647-62de-b66d-e29ae3a12ca0',
  'Центр помощи бездомным "Теплый дом"',
  'Социальный центр для людей без определенного места жительства. Предоставляем ночлег, питание, помощь в социализации.',
  'human',
  '550e8400-e29b-41d4-a716-446655440008',
  'teplo.dom@umit.kz',
  '+7 771 890 1234',
  true,
  4.8,
  'USER_UUID_SHELTER',
  NOW() - INTERVAL '60 days'
);
*/

-- ============================================
-- 9. СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ
-- ============================================

/*
INSERT INTO public.user_stats (
  user_id, requests_created, requests_completed,
  donations_made, volunteer_hours
) VALUES
('USER_UUID_BENEFICIARY1', 5, 2, 0, 0),
('USER_UUID_BENEFICIARY2', 8, 3, 0, 0),
('USER_UUID_DONOR1', 0, 0, 12, 0),
('USER_UUID_DONOR2', 0, 0, 8, 0),
('USER_UUID_VOLUNTEER', 0, 0, 5, 45),
('USER_UUID_SHELTER', 15, 10, 0, 120);
*/

-- ============================================
-- 10. ДОСТИЖЕНИЯ
-- ============================================

/*
INSERT INTO public.achievements (
  user_id, title, description, icon, earned_at
) VALUES
('USER_UUID_DONOR1', 'Первая помощь', 'Совершил первое пожертвование', '🎁', NOW() - INTERVAL '25 days'),
('USER_UUID_DONOR1', 'Щедрое сердце', 'Помог 10 семьям', '❤️', NOW() - INTERVAL '10 days'),
('USER_UUID_DONOR2', 'Первая помощь', 'Совершил первое пожертвование', '🎁', NOW() - INTERVAL '20 days'),
('USER_UUID_VOLUNTEER', 'Помощник', 'Отработал 40+ волонтерских часов', '⭐', NOW() - INTERVAL '5 days');
*/

-- ============================================
-- 11. ЧРЕЗВЫЧАЙНЫЕ СИТУАЦИИ
-- ============================================

/*
INSERT INTO public.emergencies (
  id, title, description, type, location_id,
  active, priority_boost, created_at
) VALUES
(
  'af1f9992-a758-73de-c77e-a30bf4b23db1',
  'Наводнение в Петропавловске',
  'Паводок затопил жилые районы. Срочно требуется помощь пострадавшим семьям.',
  'natural_disaster',
  '550e8400-e29b-41d4-a716-446655440011',
  true,
  2,
  NOW() - INTERVAL '2 days'
);
*/

-- ============================================
-- СПРАВКА ПО ИСПОЛЬЗОВАНИЮ
-- ============================================

/*
ИНСТРУКЦИЯ ПО ЗАПОЛНЕНИЮ БАЗЫ ДЕМО-ДАННЫМИ:

1. Выполните supabase-schema.sql для создания таблиц

2. Зарегистрируйте тестовых пользователей через UI приложения:
   - admin@umit.kz (Admin123!)
   - donor1@umit.kz (Donor123!)
   - donor2@umit.kz (Donor123!)
   - beneficiary1@umit.kz (Bene123!)
   - beneficiary2@umit.kz (Bene123!)
   - volunteer@umit.kz (Vol123!)
   - shelter@umit.kz (Shelter123!)

3. Получите UUID созданных пользователей:
   SELECT id, email FROM auth.users;

4. Замените все placeholder'ы в этом файле:
   - USER_UUID_ADMIN
   - USER_UUID_DONOR1
   - USER_UUID_DONOR2
   - USER_UUID_BENEFICIARY1
   - USER_UUID_BENEFICIARY2
   - USER_UUID_VOLUNTEER
   - USER_UUID_SHELTER

5. Раскомментируйте секции 2-11 и выполните скрипт

6. Проверьте данные через Supabase Table Editor

АЛЬТЕРНАТИВА:
Используйте приложение в Demo Mode (без настройки Supabase).
Mock данные находятся в src/services/mockData.ts
*/

-- ============================================
-- ПОЛЕЗНЫЕ ЗАПРОСЫ ДЛЯ ПРОВЕРКИ
-- ============================================

-- Все активные запросы помощи с деталями
/*
SELECT
  r.id,
  r.title,
  r.category,
  r.priority,
  r.status,
  u.first_name || ' ' || u.last_name as beneficiary,
  l.city,
  r.created_at
FROM public.help_requests r
JOIN public.users u ON r.beneficiary_id = u.id
JOIN public.locations l ON r.location_id = l.id
WHERE r.status IN ('pending', 'approved')
ORDER BY r.priority DESC, r.created_at ASC;
*/

-- Все активные предложения доноров
/*
SELECT
  o.id,
  o.title,
  o.category,
  o.type,
  u.first_name || ' ' || u.last_name as donor,
  u.rating,
  l.city,
  o.created_at
FROM public.donor_offers o
JOIN public.users u ON o.donor_id = u.id
JOIN public.locations l ON o.location_id = l.id
WHERE o.status = 'active'
ORDER BY o.created_at DESC;
*/

-- Статистика по пользователям
/*
SELECT
  u.first_name || ' ' || u.last_name as name,
  u.role,
  u.rating,
  s.requests_created,
  s.donations_made,
  s.volunteer_hours
FROM public.users u
LEFT JOIN public.user_stats s ON u.id = s.user_id
ORDER BY u.role, u.rating DESC;
*/

-- Отклики по запросу с предложенными предметами
/*
SELECT
  r.message,
  r.status,
  u.first_name || ' ' || u.last_name as donor,
  u.rating,
  json_agg(json_build_object(
    'name', oi.name,
    'quantity', oi.quantity,
    'unit', oi.unit
  )) as offered_items
FROM public.responses r
JOIN public.users u ON r.donor_id = u.id
LEFT JOIN public.offered_items oi ON r.id = oi.response_id
WHERE r.request_id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
GROUP BY r.id, r.message, r.status, u.first_name, u.last_name, u.rating
ORDER BY r.created_at DESC;
*/
