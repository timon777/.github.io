-- Úmit Platform Database Schema (Simplified - without PostGIS)
-- Упрощенная схема без PostGIS для быстрого старта

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES (ENUMS)
-- ============================================

CREATE TYPE user_role AS ENUM ('beneficiary', 'donor', 'volunteer', 'shelter', 'ngo', 'admin');
CREATE TYPE help_category AS ENUM ('food', 'clothing', 'medicine', 'household', 'construction', 'transport', 'medical_service', 'legal_service', 'psychological_service', 'animal_care');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE offer_type AS ENUM ('goods', 'service');
CREATE TYPE offer_status AS ENUM ('active', 'reserved', 'completed');
CREATE TYPE response_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE shelter_type AS ENUM ('animal', 'human');
CREATE TYPE emergency_type AS ENUM ('natural_disaster', 'accident', 'evacuation');

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'beneficiary',
  phone TEXT,
  avatar TEXT,
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT DEFAULT 'Казахстан',
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON public.locations(latitude, longitude);

CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category help_category NOT NULL,
  status request_status DEFAULT 'pending',
  priority priority DEFAULT 'medium',
  beneficiary_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_category ON public.help_requests(category);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON public.help_requests(created_at DESC);

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

CREATE TABLE IF NOT EXISTS public.donor_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category help_category NOT NULL,
  type offer_type NOT NULL DEFAULT 'goods',
  status offer_status DEFAULT 'active',
  donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  images TEXT[],
  quantity NUMERIC,
  unit TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_donor_offers_status ON public.donor_offers(status);
CREATE INDEX IF NOT EXISTS idx_donor_offers_category ON public.donor_offers(category);
CREATE INDEX IF NOT EXISTS idx_donor_offers_created_at ON public.donor_offers(created_at DESC);

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

CREATE TABLE IF NOT EXISTS public.offered_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offered_items_response ON public.offered_items(response_id);

CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type shelter_type NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  images TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  manager_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shelter_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  received NUMERIC DEFAULT 0 CHECK (received >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  requests_created INTEGER DEFAULT 0,
  requests_completed INTEGER DEFAULT 0,
  donations_made INTEGER DEFAULT 0,
  volunteer_hours NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type emergency_type NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  active BOOLEAN DEFAULT TRUE,
  priority_boost INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.request_volunteers (
  request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (request_id, volunteer_id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_help_requests_updated_at BEFORE UPDATE ON public.help_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_donor_offers_updated_at BEFORE UPDATE ON public.donor_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_responses_updated_at BEFORE UPDATE ON public.responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_shelters_updated_at BEFORE UPDATE ON public.shelters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Пользователь'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

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

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.users FOR DELETE USING (auth.uid() = id);

-- Locations policies
CREATE POLICY "Locations are viewable by everyone" ON public.locations FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create locations" ON public.locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Help requests policies
CREATE POLICY "Help requests are viewable by everyone" ON public.help_requests FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create help requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = beneficiary_id);
CREATE POLICY "Users can update own help requests" ON public.help_requests FOR UPDATE USING (auth.uid() = beneficiary_id);
CREATE POLICY "Users can delete own help requests" ON public.help_requests FOR DELETE USING (auth.uid() = beneficiary_id);

-- Needed items policies
CREATE POLICY "Needed items are viewable by everyone" ON public.needed_items FOR SELECT USING (TRUE);
CREATE POLICY "Request owners can manage needed items" ON public.needed_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.help_requests WHERE id = needed_items.request_id AND beneficiary_id = auth.uid())
);

-- Donor offers policies
CREATE POLICY "Donor offers are viewable by everyone" ON public.donor_offers FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create donor offers" ON public.donor_offers FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own offers" ON public.donor_offers FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Donors can delete own offers" ON public.donor_offers FOR DELETE USING (auth.uid() = donor_id);

-- Responses policies
CREATE POLICY "Responses are viewable by everyone" ON public.responses FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create responses" ON public.responses FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own responses" ON public.responses FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Donors can delete own responses" ON public.responses FOR DELETE USING (auth.uid() = donor_id);

-- Offered items policies
CREATE POLICY "Offered items are viewable by everyone" ON public.offered_items FOR SELECT USING (TRUE);
CREATE POLICY "Response owners can manage offered items" ON public.offered_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.responses WHERE id = offered_items.response_id AND donor_id = auth.uid())
);

-- Shelters policies
CREATE POLICY "Shelters are viewable by everyone" ON public.shelters FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create shelters" ON public.shelters FOR INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers can update own shelters" ON public.shelters FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Managers can delete own shelters" ON public.shelters FOR DELETE USING (auth.uid() = manager_id);

-- Shelter needs policies
CREATE POLICY "Shelter needs are viewable by everyone" ON public.shelter_needs FOR SELECT USING (TRUE);
CREATE POLICY "Shelter managers can manage needs" ON public.shelter_needs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shelters WHERE id = shelter_needs.shelter_id AND manager_id = auth.uid())
);

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (TRUE);

-- User stats policies
CREATE POLICY "User stats are viewable by everyone" ON public.user_stats FOR SELECT USING (TRUE);

-- Emergencies policies
CREATE POLICY "Emergencies are viewable by everyone" ON public.emergencies FOR SELECT USING (TRUE);

-- Request volunteers policies
CREATE POLICY "Request volunteers are viewable by everyone" ON public.request_volunteers FOR SELECT USING (TRUE);
CREATE POLICY "Volunteers can join requests" ON public.request_volunteers FOR INSERT WITH CHECK (auth.uid() = volunteer_id);
CREATE POLICY "Volunteers can leave requests" ON public.request_volunteers FOR DELETE USING (auth.uid() = volunteer_id);

-- Success!
SELECT 'Úmit Platform database schema created successfully!' AS message;
