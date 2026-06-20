insert into public.organizations (name, slug) values ('NORLINSA', 'norlinsa') on conflict (slug) do nothing;

-- Después de invitar a cada integrante desde Authentication > Users, vincúlelos así:
-- insert into public.organization_members (organization_id, user_id, role)
-- select o.id, 'UUID-DEL-USUARIO'::uuid, 'operator' from public.organizations o where o.slug = 'norlinsa';
