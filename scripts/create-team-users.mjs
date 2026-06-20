#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
const team = [
  { name: "Daniel Briones", email: process.env.NORLINSA_DANIEL_EMAIL, password: process.env.NORLINSA_DANIEL_PASSWORD },
  { name: "Jorge Santillan", email: process.env.NORLINSA_JORGE_EMAIL, password: process.env.NORLINSA_JORGE_PASSWORD },
  { name: "Favio Mosquera", email: process.env.NORLINSA_FAVIO_EMAIL, password: process.env.NORLINSA_FAVIO_PASSWORD },
];
if (!url || !key || team.some(({ email, password }) => !email || !password)) {
  throw new Error("Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y los tres pares NORLINSA_*_EMAIL / NORLINSA_*_PASSWORD.");
}
if (team.some(({ password }) => password.length < 10)) throw new Error("Use contraseñas temporales de al menos 10 caracteres.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: organization, error: organizationError } = await supabase.from("organizations").select("id").eq("slug", "norlinsa").single();
if (organizationError) throw organizationError;

for (const member of team) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: member.email,
    password: member.password,
    email_confirm: true,
    user_metadata: { full_name: member.name },
  });
  if (error && !error.message.toLowerCase().includes("already")) throw error;
  let userId = data.user?.id;
  if (!userId) {
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    userId = users.users.find((user) => user.email?.toLowerCase() === member.email.toLowerCase())?.id;
  }
  if (!userId) throw new Error(`No se pudo encontrar el usuario ${member.email}.`);
  const { error: membershipError } = await supabase.from("organization_members").upsert({ organization_id: organization.id, user_id: userId, role: "operator" }, { onConflict: "organization_id,user_id" });
  if (membershipError) throw membershipError;
  console.log(`Acceso configurado: ${member.name}`);
}
