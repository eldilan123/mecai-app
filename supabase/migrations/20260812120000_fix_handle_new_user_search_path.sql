-- ============================================================
-- MIGRACIÓN 005: fix de search_path en handle_new_user() (HU-04 patch)
-- ============================================================
--
-- Fix aplicado en producción el 2026-08-12 vía SQL Editor.
-- Este archivo asegura que futuras regeneraciones de BD (supabase db reset)
-- ya incluyan el fix. Ver conversación de Claude para contexto completo.
--
-- Qué pasaba: la versión original (migración 001) declaraba la función como
-- SECURITY DEFINER pero sin `SET search_path`, y hacía `INSERT INTO profiles`
-- sin calificar el schema. SECURITY DEFINER cambia el USUARIO con el que corre
-- la función, no su search_path — ese lo hereda de quien la llama. El trigger
-- lo dispara GoTrue al insertar en auth.users, en un contexto donde `public`
-- no está en el search_path, así que `profiles` no resolvía y el registro de
-- usuarios fallaba con 500 ("relation profiles does not exist").
--
-- La migración 001 ya quedó corregida in-place, así que en una BD nueva esta
-- migración es un no-op. Se mantiene igual para las BD que ya aplicaron la
-- versión rota. `CREATE OR REPLACE` es idempotente: correrla de más no rompe.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;
