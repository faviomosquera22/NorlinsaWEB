insert into public.organizations (name, slug) values ('NORLINSA', 'norlinsa') on conflict (slug) do nothing;

-- Después de crear los tres usuarios en Authentication > Users, vincúlelos así:
-- insert into public.organization_members (organization_id, user_id, role)
-- select o.id, 'UUID-DEL-USUARIO'::uuid, 'operator' from public.organizations o where o.slug = 'norlinsa';
--
-- Alternativamente, ejecute `npm run create:team` de forma local con los correos
-- y la contraseña temporal definidos en `.env.local`. El script confirma el correo
-- y asigna exactamente el mismo rol `operator` a los tres integrantes.
