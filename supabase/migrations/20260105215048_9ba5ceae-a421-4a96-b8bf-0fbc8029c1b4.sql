-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- New RLS policies for profiles: users see own profile + profiles of staff they invited
CREATE POLICY "Users can view own profile and invited staff"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR invited_by = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "System can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can delete staff they invited"
ON public.profiles
FOR DELETE
TO authenticated
USING (invited_by = auth.uid());

-- New RLS policies for user_roles: users see own roles + roles of staff they invited
CREATE POLICY "Users can view own roles and invited staff roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = user_roles.user_id 
        AND profiles.invited_by = auth.uid()
    )
);

CREATE POLICY "Admins can manage roles for invited staff"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = user_roles.user_id 
            AND profiles.invited_by = auth.uid()
        )
    )
);

CREATE POLICY "Admins can delete roles for invited staff"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') AND (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = user_roles.user_id 
            AND profiles.invited_by = auth.uid()
        )
    )
);

-- Update trigger to properly set invited_by from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_id UUID;
BEGIN
  -- Get invited_by from metadata if present
  inviter_id := (NEW.raw_user_meta_data ->> 'invited_by')::UUID;
  
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, invited_by)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name', inviter_id);
  
  -- Auto-assign admin role only if NOT invited (they're creating their own account)
  -- Invited users get 'staff' role by default
  IF inviter_id IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'staff');
  END IF;
  
  RETURN NEW;
END;
$$;