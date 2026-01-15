-- ========================================
-- Этап 2: Расширенные возможности
-- ========================================

-- 1. СИСТЕМА ВЕРИФИКАЦИИ
-- ========================================

-- Типы верификации
CREATE TYPE verification_type AS ENUM (
  'individual',      -- Физическое лицо
  'organization',    -- Организация (НКО, приют)
  'business',        -- Бизнес
  'government'       -- Государственная организация
);

-- Статусы верификации
CREATE TYPE verification_status AS ENUM (
  'pending',         -- Ожидает рассмотрения
  'under_review',    -- На рассмотрении
  'approved',        -- Одобрено
  'rejected',        -- Отклонено
  'expired'          -- Истекла
);

-- Таблица запросов на верификацию
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type verification_type NOT NULL,
  status verification_status DEFAULT 'pending',

  -- Документы и информация
  full_name TEXT,
  organization_name TEXT,
  registration_number TEXT,       -- ИНН/БИН для организаций
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,

  -- Загруженные документы
  documents TEXT[],                -- Массив ссылок на документы

  -- Дополнительная информация
  description TEXT,
  website TEXT,

  -- Рассмотрение заявки
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Срок действия верификации
  verified_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для верификации
CREATE INDEX idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_type ON public.verification_requests(type);

-- Обновление поля verified в users при одобрении
CREATE OR REPLACE FUNCTION update_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.users
    SET verified = TRUE
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' OR NEW.status = 'expired' THEN
    UPDATE public.users
    SET verified = FALSE
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_verification
AFTER UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_user_verification();


-- 2. СИСТЕМА РЕЙТИНГОВ И ОТЗЫВОВ
-- ========================================

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Кто оставил отзыв
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- О ком отзыв
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Контекст отзыва (необязательно)
  request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.donor_offers(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE,

  -- Рейтинг и текст
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Категории оценки (опционально)
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),

  -- Модерация
  is_visible BOOLEAN DEFAULT TRUE,
  moderated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  moderation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ограничение: один отзыв от одного пользователя к другому по одному контексту
  CONSTRAINT unique_review_per_context UNIQUE (reviewer_id, reviewee_id, request_id, offer_id, response_id)
);

-- Индексы для отзывов
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_visible ON public.reviews(is_visible);

-- Автоматический пересчет рейтинга пользователя
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Рассчитываем средний рейтинг для пользователя
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
    AND is_visible = TRUE;

  -- Обновляем рейтинг пользователя
  UPDATE public.users
  SET rating = ROUND(avg_rating, 1)
  WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating_insert
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER trigger_update_user_rating_update
AFTER UPDATE ON public.reviews
FOR EACH ROW
WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.is_visible IS DISTINCT FROM NEW.is_visible)
EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER trigger_update_user_rating_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();


-- 3. СИСТЕМА МОДЕРАЦИИ
-- ========================================

-- Типы модерируемого контента
CREATE TYPE moderation_content_type AS ENUM (
  'help_request',
  'donor_offer',
  'review',
  'user_profile',
  'message'
);

-- Причины модерации
CREATE TYPE moderation_reason AS ENUM (
  'spam',
  'inappropriate',
  'fraud',
  'harassment',
  'misinformation',
  'other'
);

-- Таблица флагов модерации
CREATE TABLE IF NOT EXISTS public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Что модерируется
  content_type moderation_content_type NOT NULL,
  content_id UUID NOT NULL,

  -- Кто пожаловался
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason moderation_reason NOT NULL,
  description TEXT,

  -- Статус рассмотрения
  status verification_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для модерации
CREATE INDEX idx_moderation_flags_content ON public.moderation_flags(content_type, content_id);
CREATE INDEX idx_moderation_flags_status ON public.moderation_flags(status);
CREATE INDEX idx_moderation_flags_reporter ON public.moderation_flags(reporter_id);


-- 4. РАСШИРЕННАЯ СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ
-- ========================================

-- Добавляем новые поля в user_stats (если таблица уже существует)
-- Эти поля будут использоваться для более детальной статистики

ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS total_reviews_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS positive_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS negative_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) DEFAULT 0, -- Процент откликов
ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 0,   -- В часах
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();


-- 5. RLS ПОЛИТИКИ
-- ========================================

-- Включаем RLS для новых таблиц
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

-- Политики для verification_requests
CREATE POLICY "Users can view their own verification requests"
ON public.verification_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create verification requests"
ON public.verification_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update verification requests"
ON public.verification_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Политики для reviews
CREATE POLICY "Anyone can view visible reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (is_visible = TRUE);

CREATE POLICY "Users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (reviewer_id = auth.uid());

CREATE POLICY "Admins can moderate reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Политики для moderation_flags
CREATE POLICY "Users can create moderation flags"
ON public.moderation_flags FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own flags"
ON public.moderation_flags FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all moderation flags"
ON public.moderation_flags FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update moderation flags"
ON public.moderation_flags FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- 6. УВЕДОМЛЕНИЯ ДЛЯ НОВЫХ СОБЫТИЙ
-- ========================================

-- Уведомление при одобрении верификации
CREATE OR REPLACE FUNCTION notify_verification_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      NEW.user_id,
      'verification_approved',
      'Верификация одобрена',
      'Ваш запрос на верификацию был одобрен!',
      '/profile'
    );
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      NEW.user_id,
      'verification_rejected',
      'Верификация отклонена',
      COALESCE('Причина: ' || NEW.rejection_reason, 'Ваш запрос на верификацию был отклонен.'),
      '/profile'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_verification_status
AFTER UPDATE ON public.verification_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_verification_approved();

-- Уведомление при получении отзыва
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    from_user_id
  ) VALUES (
    NEW.reviewee_id,
    'system',
    'Новый отзыв',
    'Вы получили новый отзыв с оценкой ' || NEW.rating || ' звёзд',
    '/profile',
    NEW.reviewer_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();
