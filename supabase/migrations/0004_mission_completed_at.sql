-- completed_at automático según estado (PRD sección 16: misiones).
create or replace function public.sync_mission_completed_at()
returns trigger
language plpgsql
as $$
begin
    if new.status = 'completada' and old.status is distinct from 'completada' then
        new.completed_at := now();
    elsif new.status is distinct from 'completada' then
        new.completed_at := null;
    end if;
    return new;
end;
$$;

create trigger trg_mission_progress_completed_at
    before insert or update on public.mission_progress
    for each row execute function public.sync_mission_completed_at();