-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'professional', 'enterprise');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'trialing', 'canceled', 'expired');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (true);

-- Create function to auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'starter', 'trialing', now() + INTERVAL '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create subscription
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create index for fast lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();