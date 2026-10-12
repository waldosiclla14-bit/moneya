# ADR-0005. Locale/moneda por país vía `RegionProvider`

- Estado: Aceptado
- Fecha: 2026-10-12
- Contexto:
  - Varios componentes formateaban montos con `es-CL` fijo; un usuario peruano veía formato chileno (TD-6, `docs/audit/TECHNICAL_DEBT.md`).
  - El perfil guarda el país (`country_id`), pero leerlo requiere sesión de Supabase (bloqueada, O1). La demo corre sin sesión.
  - Verificado: los separadores difieren por país — `es-CL` usa `1.234.567` / decimal `,`; `es-PE` usa `1,234,567` / decimal `.`.
- Decisión:
  - Centralizar formatos en `lib/formato/moneda.ts` (fuente única `PAISES`, `PAIS_DEFAULT = 'CL'`; helpers `crearFormateadorMoneda` / `crearFormateadorNumero`).
  - Exponer el país activo con `RegionProvider` + `useRegion()` (`lib/formato/region.tsx`): resuelve el país desde el perfil (`obtenerPerfil`) cuando hay sesión y cae a Chile si no la hay.
  - Consumir `useRegion()` en los componentes que muestran dinero/números; sin UI de cambio manual de región por ahora.
- Alternativas consideradas:
  - **Seguir con `es-CL` fijo:** incorrecto para Perú; descartado.
  - **Detección por navegador (`navigator.language`):** no refleja el país del perfil y puede contradecir los datos guardados; descartado.
  - **Selector manual de moneda:** añade fricción sin demanda actual; pospuesto.
- Consecuencias:
  - Positivas: formato correcto por país cuando hay sesión; fuente única testeable (`lib/formato/__tests__/moneda.test.ts`).
  - Negativas / pendientes: en la demo (sin sesión) **siempre se muestra Chile** (limitación explícita); el cambio real solo se aprecia con Supabase activo (O1). Pendiente: soporte de más países si el alcance crece.
- Referencias: `lib/formato/moneda.ts`, `lib/formato/region.tsx`, `lib/formato/__tests__/moneda.test.ts`, `lib/supabase/onboarding-repo.ts` (`obtenerPerfil`), `docs/audit/TECHNICAL_DEBT.md` (TD-6), `docs/audit/OPEN_QUESTIONS.md` (O4).
