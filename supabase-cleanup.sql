-- Úmit Platform Database Cleanup
-- ВНИМАНИЕ: Этот скрипт УДАЛИТ ВСЕ ДАННЫЕ!
-- Используйте только если хотите начать с чистого листа

-- Удаляем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_update_location_geom ON public.locations;
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_help_requests_updated_at ON public.help_requests;
DROP TRIGGER IF EXISTS trigger_donor_offers_updated_at ON public.donor_offers;
DROP TRIGGER IF EXISTS trigger_responses_updated_at ON public.responses;
DROP TRIGGER IF EXISTS trigger_shelters_updated_at ON public.shelters;

-- Удаляем функции
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_location_geom();

-- Удаляем таблицы (в правильном порядке из-за внешних ключей)
DROP TABLE IF EXISTS public.request_volunteers CASCADE;
DROP TABLE IF EXISTS public.emergencies CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.shelter_needs CASCADE;
DROP TABLE IF EXISTS public.shelters CASCADE;
DROP TABLE IF EXISTS public.offered_items CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.donor_offers CASCADE;
DROP TABLE IF EXISTS public.needed_items CASCADE;
DROP TABLE IF EXISTS public.help_requests CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Удаляем типы
DROP TYPE IF EXISTS emergency_type CASCADE;
DROP TYPE IF EXISTS shelter_type CASCADE;
DROP TYPE IF EXISTS response_status CASCADE;
DROP TYPE IF EXISTS offer_status CASCADE;
DROP TYPE IF EXISTS offer_type CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS help_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Готово!
SELECT 'Database cleaned successfully! You can now run the schema script.' AS message;
