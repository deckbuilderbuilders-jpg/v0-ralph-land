-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create builds table to store build history
CREATE TABLE IF NOT EXISTS public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- App details
  app_name TEXT NOT NULL,
  app_description TEXT NOT NULL,
  prd TEXT,
  
  -- Build metadata
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'building', 'completed', 'failed')),
  complexity TEXT CHECK (complexity IN ('simple', 'medium', 'complex', 'enterprise')),
  
  -- Cost tracking
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  estimated_tokens INTEGER,
  actual_tokens_input INTEGER DEFAULT 0,
  actual_tokens_output INTEGER DEFAULT 0,
  
  -- Stripe
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10, 2),
  
  -- Build progress
  total_iterations INTEGER DEFAULT 1,
  completed_iterations INTEGER DEFAULT 0,
  current_phase TEXT,
  
  -- Generated output
  files_count INTEGER DEFAULT 0,
  lines_of_code INTEGER DEFAULT 0,
  
  -- GitHub
  github_repo_url TEXT,
  github_repo_owner TEXT,
  github_repo_name TEXT,
  
  -- Vercel deployment
  vercel_project_id TEXT,
  vercel_deployment_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create build_files table to store generated files
CREATE TABLE IF NOT EXISTS public.build_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  iteration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create build_logs table for detailed build history
CREATE TABLE IF NOT EXISTS public.build_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  iteration INTEGER,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create token_usage table for tracking actual usage vs estimates
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  iteration INTEGER NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  model TEXT NOT NULL,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for builds
CREATE POLICY "Users can view own builds" ON public.builds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own builds" ON public.builds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds" ON public.builds
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for build_files
CREATE POLICY "Users can view own build files" ON public.build_files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_files.build_id AND builds.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own build files" ON public.build_files
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_files.build_id AND builds.user_id = auth.uid())
  );

-- RLS Policies for build_logs
CREATE POLICY "Users can view own build logs" ON public.build_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_logs.build_id AND builds.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own build logs" ON public.build_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_logs.build_id AND builds.user_id = auth.uid())
  );

-- RLS Policies for token_usage  
CREATE POLICY "Users can view own token usage" ON public.token_usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = token_usage.build_id AND builds.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own token usage" ON public.token_usage
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.builds WHERE builds.id = token_usage.build_id AND builds.user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON public.builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON public.builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_build_files_build_id ON public.build_files(build_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_build_id ON public.build_logs(build_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_build_id ON public.token_usage(build_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
