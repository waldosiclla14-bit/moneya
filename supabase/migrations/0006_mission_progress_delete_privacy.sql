-- Completar el derecho al olvido: borrado del progreso de misiones del usuario (0005 cubrió profiles y events).
create policy "mission_progress_delete_own" on public.mission_progress
    for delete using (user_id = auth.uid());
