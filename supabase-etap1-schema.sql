-- ============================================
-- Úmit Platform - Этап 1: Уведомления, Чаты, Изображения
-- ============================================
-- Расширение схемы базы данных для критичного функционала
-- Выполняйте ПОСЛЕ supabase-schema.sql
-- ============================================

-- ============================================
-- 1. НОВЫЕ ENUM ТИПЫ
-- ============================================

-- Типы уведомлений
CREATE TYPE notification_type AS ENUM (
  'response_received',      -- Получен отклик на ваш запрос
  'response_accepted',      -- Ваш отклик принят
  'response_rejected',      -- Ваш отклик отклонен
  'request_status_changed', -- Статус запроса изменен
  'offer_status_changed',   -- Статус предложения изменен
  'new_message',            -- Новое сообщение в чате
  'request_matched',        -- Найдено подходящее предложение
  'offer_matched',          -- Найден подходящий запрос
  'verification_approved',  -- Верификация одобрена
  'verification_rejected',  -- Верификация отклонена
  'system'                  -- Системное уведомление
);

-- ============================================
-- 2. ТАБЛИЦЫ
-- ============================================

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Ссылка на связанный ресурс (/requests/xxx, /offers/xxx)
  read BOOLEAN DEFAULT FALSE,
  -- Связанные сущности (nullable, в зависимости от типа)
  request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.donor_offers(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Кто инициировал событие
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрой выборки
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = FALSE;

-- Таблица чатов
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Участники чата (всегда два пользователя для приватного чата)
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Связь с запросом или предложением (контекст чата)
  request_id UUID REFERENCES public.help_requests(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES public.donor_offers(id) ON DELETE SET NULL,
  -- Метаданные
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Уникальность: один чат между двумя пользователями
  CONSTRAINT unique_chat_users CHECK (user1_id < user2_id)
);

-- Индексы для быстрого поиска чатов
CREATE INDEX IF NOT EXISTS idx_chats_user1 ON public.chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2 ON public.chats(user2_id);
CREATE INDEX IF NOT EXISTS idx_chats_request ON public.chats(request_id);
CREATE INDEX IF NOT EXISTS idx_chats_offer ON public.chats(offer_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON public.chats(last_message_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chats_unique_users ON public.chats(user1_id, user2_id);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  -- Поддержка вложений (изображения, файлы)
  attachments TEXT[], -- массив URL изображений/файлов
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрой выборки сообщений
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON public.messages(chat_id, created_at DESC);

-- ============================================
-- 3. ТРИГГЕРЫ И ФУНКЦИИ
-- ============================================

-- Функция для обновления last_message_at в чате
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления last_message_at
CREATE TRIGGER trigger_messages_update_chat
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- Функция для создания уведомления о новом сообщении
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Определить получателя (тот, кто НЕ отправитель)
  SELECT
    CASE
      WHEN c.user1_id = NEW.sender_id THEN c.user2_id
      ELSE c.user1_id
    END INTO recipient_id
  FROM public.chats c
  WHERE c.id = NEW.chat_id;

  -- Получить имя отправителя
  SELECT u.first_name || ' ' || u.last_name INTO sender_name
  FROM public.users u
  WHERE u.id = NEW.sender_id;

  -- Создать уведомление
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    from_user_id
  ) VALUES (
    recipient_id,
    'new_message',
    'Новое сообщение',
    sender_name || ': ' || LEFT(NEW.content, 50),
    '/messages/' || NEW.chat_id,
    NEW.sender_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомления о новом сообщении
CREATE TRIGGER trigger_messages_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Функция для создания уведомления о новом отклике
CREATE OR REPLACE FUNCTION notify_new_response()
RETURNS TRIGGER AS $$
DECLARE
  beneficiary_id UUID;
  donor_name TEXT;
  request_title TEXT;
BEGIN
  -- Получить ID благополучателя и название запроса
  SELECT r.beneficiary_id, r.title INTO beneficiary_id, request_title
  FROM public.help_requests r
  WHERE r.id = NEW.request_id;

  -- Получить имя донора
  SELECT u.first_name || ' ' || u.last_name INTO donor_name
  FROM public.users u
  WHERE u.id = NEW.donor_id;

  -- Создать уведомление
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    request_id,
    response_id,
    from_user_id
  ) VALUES (
    beneficiary_id,
    'response_received',
    'Новый отклик на ваш запрос',
    donor_name || ' откликнулся на "' || LEFT(request_title, 30) || '"',
    '/requests/' || NEW.request_id,
    NEW.request_id,
    NEW.id,
    NEW.donor_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомления о новом отклике
CREATE TRIGGER trigger_responses_notify
  AFTER INSERT ON public.responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_response();

-- Функция для создания уведомления об изменении статуса отклика
CREATE OR REPLACE FUNCTION notify_response_status_change()
RETURNS TRIGGER AS $$
DECLARE
  donor_id UUID;
  beneficiary_name TEXT;
  notif_type notification_type;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  -- Только если статус действительно изменился
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Получить ID донора
    SELECT r.donor_id INTO donor_id FROM public.responses r WHERE r.id = NEW.id;

    -- Получить имя благополучателя
    SELECT u.first_name || ' ' || u.last_name INTO beneficiary_name
    FROM public.help_requests req
    JOIN public.users u ON req.beneficiary_id = u.id
    WHERE req.id = NEW.request_id;

    -- Определить тип уведомления и текст
    IF NEW.status = 'accepted' THEN
      notif_type := 'response_accepted';
      notif_title := 'Ваш отклик принят!';
      notif_message := beneficiary_name || ' принял ваш отклик';
    ELSIF NEW.status = 'rejected' THEN
      notif_type := 'response_rejected';
      notif_title := 'Ваш отклик отклонен';
      notif_message := beneficiary_name || ' отклонил ваш отклик';
    ELSE
      RETURN NEW; -- Не создавать уведомление для других статусов
    END IF;

    -- Создать уведомление
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link,
      request_id,
      response_id,
      from_user_id
    ) VALUES (
      donor_id,
      notif_type,
      notif_title,
      notif_message,
      '/requests/' || NEW.request_id,
      NEW.request_id,
      NEW.id,
      (SELECT beneficiary_id FROM public.help_requests WHERE id = NEW.request_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для уведомления об изменении статуса отклика
CREATE TRIGGER trigger_responses_status_notify
  AFTER UPDATE ON public.responses
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_response_status_change();

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Включить RLS для новых таблиц
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Политики для notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Политики для chats
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Политики для messages
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = chat_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = chat_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = chat_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- ============================================
-- СПРАВКА
-- ============================================

/*
ИСПОЛЬЗОВАНИЕ:

1. Уведомления:
   - Создаются автоматически через триггеры при событиях
   - Пользователи видят только свои уведомления
   - Можно пометить как прочитанные

2. Чаты:
   - Приватные чаты между двумя пользователями
   - Связаны с контекстом (запрос или предложение)
   - Автоматическая сортировка по последнему сообщению

3. Сообщения:
   - Real-time через Supabase Realtime
   - Поддержка вложений (изображения)
   - Автоматические уведомления о новых сообщениях

4. Storage для изображений:
   - Создайте bucket 'images' в Supabase Storage
   - Настройте публичный доступ для чтения
   - Структура: users/, requests/, offers/, messages/
*/
