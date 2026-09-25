-- Habilitar borrado de los datos del usuario (PRD sección 13: exportar/eliminar datos desde V1).
create policy "profiles_delete_own" on public.profiles
    for delete using (auth.uid() = id);

create policy "events_delete_own" on public.events
    for delete using (auth.uid() = user_id);