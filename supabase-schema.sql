-- Úmit Platform Database Schema
-- Полная схема базы данных для социального реестра адресной помощи

-- ============================================
-- 1. EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- для работы с геоданными

-- ============================================
-- 2. CUSTOM TYPES (ENUMS)
-- ============================================

-- Роли пользователей
CREATE TYPE user_role AS ENUM ('beneficiary', 'donor', 'volunteer', 'shelter', 'ngo', 'admin');

-- Категории помощи
CREATE TYPE help_category AS ENUM (
  'food',
  'clothing',
  'medicine',
  'household',
  'construction',
  'transport',
  'medical_service',
  'legal_service',
  'psychological_service',
  'animal_care'
);

-- Статусы запросов
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');

-- Приоритеты
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Типы предложений (товар/услуга)
CREATE TYPE offer_type AS ENUM ('goods', 'service');

-- Статусы предложений доноров
CREATE TYPE offer_status AS ENUM ('active', 'reserved', 'completed');

-- Статусы откликов
CREATE TYPE response_status AS ENUM ('pending', 'accepted', 'rejected');

-- Типы приютов
CREATE TYPE shelter_type AS ENUM ('animal', 'human');

-- Типы чрезвычайных ситуаций
CREATE TYPE emergency_type AS ENUM ('natural_disaster', 'accident', 'evacuation');

-- ============================================
-- 3. TABLES
-- ============================================

-- Таблица профилей пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'beneficiary',
  phone TEXT,
  avatar TEXT, -- URL аватара
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица местоположений
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT DEFAULT 'Казахстан',
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  geom GEOMETRY(Point, 4326), -- PostGIS точка для геопоиска
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для быстрого геопоиска
CREATE INDEX IF NOT EXISTS idx_locations_geom ON public.locations USING GIST(geom);

-- Триггер для автообновления geom при изменении координат
CREATE OR REPLACE FUNCTION update_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_geom
  BEFORE INSERT OR UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION update_location_geom();

-- Таблица запросов помощи
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category help_category NOT NULL,
  status request_status DEFAULT 'pending',
  priority priority DEFAULT 'medium',
  beneficiary_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  images TEXT[], -- массив URL изображений
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_category ON public.help_requests(category);
CREATE INDEX IF NOT EXISTS idx_help_requests_beneficiary ON public.help_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON public.help_requests(created_at DESC);

-- Таблица необходимых предметов для запросов помощи
CREATE TABLE IF NOT EXISTS public.needed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  received NUMERIC DEFAULT 0 CHECK (received >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_needed_items_request ON public.needed_items(request_id);

-- Таблица предложений доноров (реестр объявлений)
CREATE TABLE IF NOT EXISTS public.donor_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category help_category NOT NULL,
  type offer_type NOT NULL DEFAULT 'goods',
  status offer_status DEFAULT 'active',
  donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  images TEXT[], -- массив URL изображений
  quantity NUMERIC, -- для товаров
  unit TEXT, -- единица измерения
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- срок действия объявления
);

-- Индексы для реестра
CREATE INDEX IF NOT EXISTS idx_donor_offers_status ON public.donor_offers(status);
CREATE INDEX IF NOT EXISTS idx_donor_offers_category ON public.donor_offers(category);
CREATE INDEX IF NOT EXISTS idx_donor_offers_type ON public.donor_offers(type);
CREATE INDEX IF NOT EXISTS idx_donor_offers_donor ON public.donor_offers(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_offers_created_at ON public.donor_offers(created_at DESC);

-- Таблица откликов на запросы помощи
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status response_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_request ON public.responses(request_id);
CREATE INDEX IF NOT EXISTS idx_responses_donor ON public.responses(donor_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON public.responses(status);

-- Таблица предложенных предметов в откликах
CREATE TABLE IF NOT EXISTS public.offered_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offered_items_response ON public.offered_items(response_id);

-- Таблица приютов
CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type shelter_type NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  images TEXT[], -- массив URL изображений
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  manager_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shelters_type ON public.shelters(type);
CREATE INDEX IF NOT EXISTS idx_shelters_verified ON public.shelters(verified);
CREATE INDEX IF NOT EXISTS idx_shelters_manager ON public.shelters(manager_id);

-- Таблица потребностей приютов
CREATE TABLE IF NOT EXISTS public.shelter_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  received NUMERIC DEFAULT 0 CHECK (received >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shelter_needs_shelter ON public.shelter_needs(shelter_id);

-- Таблица достижений волонтеров
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- URL или название иконки
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);

-- Таблица статистики пользователей
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  requests_created INTEGER DEFAULT 0,
  requests_completed INTEGER DEFAULT 0,
  donations_made INTEGER DEFAULT 0,
  volunteer_hours NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица чрезвычайных ситуаций
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type emergency_type NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  active BOOLEAN DEFAULT TRUE,
  priority_boost INTEGER DEFAULT 10, -- на сколько повышается приоритет
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_emergencies_active ON public.emergencies(active);
CREATE INDEX IF NOT EXISTS idx_emergencies_location ON public.emergencies(location_id);

-- Таблица связей волонтеров с запросами
CREATE TABLE IF NOT EXISTS public.request_volunteers (
  request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (request_id, volunteer_id)
);

CREATE INDEX IF NOT EXISTS idx_request_volunteers_request ON public.request_volunteers(request_id);
CREATE INDEX IF NOT EXISTS idx_request_volunteers_volunteer ON public.request_volunteers(volunteer_id);

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_donor_offers_updated_at
  BEFORE UPDATE ON public.donor_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_responses_updated_at
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shelters_updated_at
  BEFORE UPDATE ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция создания профиля пользователя при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Пользователь'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Создаем статистику для нового пользователя
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автосоздания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offered_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelter_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_volunteers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ПОЛИТИКИ ДЛЯ users
-- ============================================

-- Все могут читать профили пользователей
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (TRUE);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Пользователи могут удалять свой профиль
CREATE POLICY "Users can delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ locations
-- ============================================

-- Все могут читать местоположения
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (TRUE);

-- Авторизованные пользователи могут создавать местоположения
CREATE POLICY "Authenticated users can create locations"
  ON public.locations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ПОЛИТИКИ ДЛЯ help_requests
-- ============================================

-- Все могут читать запросы помощи
CREATE POLICY "Help requests are viewable by everyone"
  ON public.help_requests FOR SELECT
  USING (TRUE);

-- Авторизованные пользователи могут создавать запросы
CREATE POLICY "Authenticated users can create help requests"
  ON public.help_requests FOR INSERT
  WITH CHECK (auth.uid() = beneficiary_id);

-- Авторы могут обновлять свои запросы
CREATE POLICY "Users can update own help requests"
  ON public.help_requests FOR UPDATE
  USING (auth.uid() = beneficiary_id);

-- Авторы могут удалять свои запросы
CREATE POLICY "Users can delete own help requests"
  ON public.help_requests FOR DELETE
  USING (auth.uid() = beneficiary_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ needed_items
-- ============================================

-- Все могут читать необходимые предметы
CREATE POLICY "Needed items are viewable by everyone"
  ON public.needed_items FOR SELECT
  USING (TRUE);

-- Владельцы запросов могут управлять needed_items
CREATE POLICY "Request owners can manage needed items"
  ON public.needed_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.help_requests
      WHERE id = needed_items.request_id
      AND beneficiary_id = auth.uid()
    )
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ donor_offers
-- ============================================

-- Все могут читать предложения доноров
CREATE POLICY "Donor offers are viewable by everyone"
  ON public.donor_offers FOR SELECT
  USING (TRUE);

-- Авторизованные пользователи могут создавать предложения
CREATE POLICY "Authenticated users can create donor offers"
  ON public.donor_offers FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- Владельцы могут обновлять свои предложения
CREATE POLICY "Donors can update own offers"
  ON public.donor_offers FOR UPDATE
  USING (auth.uid() = donor_id);

-- Владельцы могут удалять свои предложения
CREATE POLICY "Donors can delete own offers"
  ON public.donor_offers FOR DELETE
  USING (auth.uid() = donor_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ responses
-- ============================================

-- Все могут читать отклики (прозрачность)
CREATE POLICY "Responses are viewable by everyone"
  ON public.responses FOR SELECT
  USING (TRUE);

-- Авторизованные пользователи могут создавать отклики
CREATE POLICY "Authenticated users can create responses"
  ON public.responses FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- Владельцы могут обновлять свои отклики
CREATE POLICY "Donors can update own responses"
  ON public.responses FOR UPDATE
  USING (auth.uid() = donor_id);

-- Владельцы могут удалять свои отклики
CREATE POLICY "Donors can delete own responses"
  ON public.responses FOR DELETE
  USING (auth.uid() = donor_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ offered_items
-- ============================================

-- Все могут читать предложенные предметы
CREATE POLICY "Offered items are viewable by everyone"
  ON public.offered_items FOR SELECT
  USING (TRUE);

-- Владельцы откликов могут управлять offered_items
CREATE POLICY "Response owners can manage offered items"
  ON public.offered_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.responses
      WHERE id = offered_items.response_id
      AND donor_id = auth.uid()
    )
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ shelters
-- ============================================

-- Все могут читать приюты
CREATE POLICY "Shelters are viewable by everyone"
  ON public.shelters FOR SELECT
  USING (TRUE);

-- Авторизованные пользователи могут создавать приюты
CREATE POLICY "Authenticated users can create shelters"
  ON public.shelters FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

-- Менеджеры могут обновлять свои приюты
CREATE POLICY "Managers can update own shelters"
  ON public.shelters FOR UPDATE
  USING (auth.uid() = manager_id);

-- Менеджеры могут удалять свои приюты
CREATE POLICY "Managers can delete own shelters"
  ON public.shelters FOR DELETE
  USING (auth.uid() = manager_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ shelter_needs
-- ============================================

-- Все могут читать потребности приютов
CREATE POLICY "Shelter needs are viewable by everyone"
  ON public.shelter_needs FOR SELECT
  USING (TRUE);

-- Менеджеры приютов могут управлять потребностями
CREATE POLICY "Shelter managers can manage needs"
  ON public.shelter_needs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shelters
      WHERE id = shelter_needs.shelter_id
      AND manager_id = auth.uid()
    )
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ achievements
-- ============================================

-- Все могут читать достижения
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (TRUE);

-- Только система может создавать достижения (через service_role)
-- Пользователи не могут создавать/изменять свои достижения напрямую

-- ============================================
-- ПОЛИТИКИ ДЛЯ user_stats
-- ============================================

-- Все могут читать статистику
CREATE POLICY "User stats are viewable by everyone"
  ON public.user_stats FOR SELECT
  USING (TRUE);

-- Пользователи могут просматривать свою статистику
-- Обновление статистики происходит через триггеры и функции

-- ============================================
-- ПОЛИТИКИ ДЛЯ emergencies
-- ============================================

-- Все могут читать чрезвычайные ситуации
CREATE POLICY "Emergencies are viewable by everyone"
  ON public.emergencies FOR SELECT
  USING (TRUE);

-- Только админы могут создавать ЧС (требуется отдельная роль admin)

-- ============================================
-- ПОЛИТИКИ ДЛЯ request_volunteers
-- ============================================

-- Все могут читать связи волонтеров с запросами
CREATE POLICY "Request volunteers are viewable by everyone"
  ON public.request_volunteers FOR SELECT
  USING (TRUE);

-- Волонтеры могут присоединяться к запросам
CREATE POLICY "Volunteers can join requests"
  ON public.request_volunteers FOR INSERT
  WITH CHECK (auth.uid() = volunteer_id);

-- Волонтеры могут покидать запросы
CREATE POLICY "Volunteers can leave requests"
  ON public.request_volunteers FOR DELETE
  USING (auth.uid() = volunteer_id);

-- ============================================
-- 6. КОММЕНТАРИИ К ТАБЛИЦАМ
-- ============================================

COMMENT ON TABLE public.users IS 'Профили пользователей (расширение auth.users)';
COMMENT ON TABLE public.locations IS 'Местоположения для всех сущностей';
COMMENT ON TABLE public.help_requests IS 'Запросы помощи от бенефициаров';
COMMENT ON TABLE public.needed_items IS 'Необходимые предметы для запросов помощи';
COMMENT ON TABLE public.donor_offers IS 'Предложения доноров (реестр объявлений)';
COMMENT ON TABLE public.responses IS 'Отклики доноров на запросы помощи';
COMMENT ON TABLE public.offered_items IS 'Предметы, предложенные в откликах';
COMMENT ON TABLE public.shelters IS 'Приюты и социальные центры';
COMMENT ON TABLE public.shelter_needs IS 'Потребности приютов';
COMMENT ON TABLE public.achievements IS 'Достижения волонтеров';
COMMENT ON TABLE public.user_stats IS 'Статистика пользователей';
COMMENT ON TABLE public.emergencies IS 'Чрезвычайные ситуации';
COMMENT ON TABLE public.request_volunteers IS 'Связь волонтеров с запросами помощи';

-- ============================================
-- 7. ЗАВЕРШЕНИЕ
-- ============================================

-- Скрипт успешно выполнен!
-- Теперь база данных готова для использования в Úmit платформе
