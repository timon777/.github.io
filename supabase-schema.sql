-- Úmit Platform Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('beneficiary', 'donor', 'volunteer', 'shelter', 'ngo', 'admin');
CREATE TYPE help_category AS ENUM ('food', 'clothing', 'medicine', 'household', 'construction', 'transport', 'medical_service', 'legal_service', 'psychological_service', 'animal_care');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE shelter_type AS ENUM ('animal', 'human');
CREATE TYPE response_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE emergency_type AS ENUM ('natural_disaster', 'accident', 'evacuation');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'beneficiary',
  avatar TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT DEFAULT 'Казахстан',
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help requests table
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category help_category NOT NULL,
  status request_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  beneficiary_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Shelters table
CREATE TABLE public.shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type shelter_type NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  images TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0,
  manager_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status response_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergencies table
CREATE TABLE public.emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type emergency_type NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  priority_boost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_help_requests_beneficiary ON public.help_requests(beneficiary_id);
CREATE INDEX idx_help_requests_status ON public.help_requests(status);
CREATE INDEX idx_help_requests_category ON public.help_requests(category);
CREATE INDEX idx_help_requests_created ON public.help_requests(created_at DESC);
CREATE INDEX idx_shelters_type ON public.shelters(type);
CREATE INDEX idx_shelters_verified ON public.shelters(verified);
CREATE INDEX idx_responses_request ON public.responses(request_id);
CREATE INDEX idx_responses_donor ON public.responses(donor_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_rating ON public.users(rating DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for locations table
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create locations" ON public.locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for help_requests table
CREATE POLICY "Anyone can view help requests" ON public.help_requests FOR SELECT USING (true);
CREATE POLICY "Beneficiaries can create requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = beneficiary_id);
CREATE POLICY "Beneficiaries can update own requests" ON public.help_requests FOR UPDATE USING (auth.uid() = beneficiary_id);
CREATE POLICY "Beneficiaries can delete own requests" ON public.help_requests FOR DELETE USING (auth.uid() = beneficiary_id);

-- RLS Policies for shelters table
CREATE POLICY "Anyone can view shelters" ON public.shelters FOR SELECT USING (true);
CREATE POLICY "Shelter managers can create shelters" ON public.shelters FOR INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Shelter managers can update own shelters" ON public.shelters FOR UPDATE USING (auth.uid() = manager_id);

-- RLS Policies for responses table
CREATE POLICY "Anyone can view responses" ON public.responses FOR SELECT USING (true);
CREATE POLICY "Donors can create responses" ON public.responses FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own responses" ON public.responses FOR UPDATE USING (auth.uid() = donor_id);

-- RLS Policies for achievements table
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "System can create achievements" ON public.achievements FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for emergencies table
CREATE POLICY "Anyone can view emergencies" ON public.emergencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage emergencies" ON public.emergencies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shelters_updated_at BEFORE UPDATE ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'beneficiary')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('request-images', 'request-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shelter-images', 'shelter-images', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for request images
CREATE POLICY "Request images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'request-images');
CREATE POLICY "Authenticated users can upload request images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'request-images' AND auth.role() = 'authenticated');

-- Storage policies for shelter images
CREATE POLICY "Shelter images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'shelter-images');
CREATE POLICY "Authenticated users can upload shelter images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shelter-images' AND auth.role() = 'authenticated');

-- Insert some sample data (optional)
-- Sample locations
INSERT INTO public.locations (address, city, region, latitude, longitude) VALUES
  ('ул. Абая 150', 'Алматы', 'Алматы', 43.2220, 76.8512),
  ('мкр. Аксай-3, д. 25', 'Алматы', 'Алматы', 43.2566, 76.9286);
