-- Migration: Create gamification tables
-- Description: Tables to track user progress, activities, and suggestions

-- Table: user_progress
-- Tracks overall user level and points
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 3),
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  videos_opened INTEGER NOT NULL DEFAULT 0 CHECK (videos_opened >= 0),
  arts_clicked INTEGER NOT NULL DEFAULT 0 CHECK (arts_clicked >= 0),
  calendar_used INTEGER NOT NULL DEFAULT 0 CHECK (calendar_used >= 0),
  tools_used INTEGER NOT NULL DEFAULT 0 CHECK (tools_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table: user_activities
-- Logs individual user actions for history
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('video', 'art', 'calendar', 'tool')),
  points_earned INTEGER NOT NULL CHECK (points_earned >= 0),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: user_suggestions
-- Stores user feedback and suggestions
CREATE TABLE IF NOT EXISTS public.user_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON public.user_progress(level);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_status ON public.user_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_created_at ON public.user_suggestions(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_suggestions_updated_at
  BEFORE UPDATE ON public.user_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_suggestions
CREATE POLICY "Users can view their own suggestions"
  ON public.user_suggestions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert suggestions"
  ON public.user_suggestions FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.user_progress TO authenticated;
GRANT ALL ON public.user_activities TO authenticated;
GRANT ALL ON public.user_suggestions TO authenticated;
GRANT SELECT ON public.user_suggestions TO anon;
GRANT INSERT ON public.user_suggestions TO anon;
