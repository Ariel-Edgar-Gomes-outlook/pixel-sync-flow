-- Fix security warning: set search_path on check_resource_availability function
CREATE OR REPLACE FUNCTION public.check_resource_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.job_resources
        WHERE resource_id = NEW.resource_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (NEW.reserved_from, NEW.reserved_until) OVERLAPS (reserved_from, reserved_until)
        )
    ) THEN
        RAISE EXCEPTION 'Resource is already booked for the selected time period';
    END IF;
    RETURN NEW;
END;
$$;