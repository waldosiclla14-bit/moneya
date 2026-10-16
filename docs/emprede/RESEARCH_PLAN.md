# MONEYA Emprende — Plan de investigación

Fecha: 2026-10-13 · Estado: **plan, sin ejecutar** · Fase: investigación (§15). Cero código en esta fase.

## 1. Objetivo
Acompañar de la idea a una actividad sostenible y, cuando corresponda, a su formalización, con rutas personalizadas, verificables y actualizadas para **Perú y Chile**. La formalización no garantiza crédito, subsidios, ventas ni rentabilidad.

## 2. Punto de partida (hipótesis heredadas, no verificadas)
- `gob.pe` bloquea lectura automatizada → revisión manual obligatoria.
- Cifras de UIT, costos de patente municipal y plazos **no verificadas**.
- Posible cambio legislativo del régimen Pyme en Chile (incidencia abierta hasta verificar norma vigente).
- Ruta de extranjeros sin DNI en Perú **sin confirmar**.
- Existe un prototipo PWA independiente v0.1 fuera del repo: si aparece, se audita **antes** de integrar; no se fusiona sin autorización.

## 3. Protocolo de verificación (aplica a cada dato)
1. Todo requisito/cifra/plazo va a `OFFICIAL_SOURCES.md` con URL, **fecha de consulta**, extracto y estado (`verificado` / `no verificado — revisar a mano` / `desactualizado`).
2. Vigencia: verificado en los últimos 90 días o mostrar aviso "información por verificar".
3. Estado del paso ≠ verificación de fuente: "Completado por el usuario" puede coexistir con requisito "no verificado".
4. Cambios legales → incidencia abierta con fecha + contenido marcado "en revisión".

## 4. Qué investigar (por país)
- Formas jurídicas y regímenes tributarios: requisitos, costos, plazos, puertas de entrada oficiales (SII/SUNAT, registros, municipalidades).
- Distinguir siempre: requisito legal / recomendación / buena práctica.
- Migrantes: elegibilidad sin asumir ni negar; sin guardar datos migratorios detallados.
- Programas de apoyo vigentes con fuente y fecha (no promesas).

## 5. Entregables (en orden)
1. `OFFICIAL_SOURCES.md` — registro de fuentes con fecha y estado.
2. `FORMALIZATION_CHILE.md` / `FORMALIZATION_PERU.md` — rutas por país con cada requisito fechado.
3. `PRODUCT_SPEC.md` — perfil de negocio, diagnóstico, ruta por país/actividad, verificación, seguimiento.
4. `MVP_PLAN.md` — perfil, diagnóstico básico, ruta, checklist, fuentes fechadas, cálculos con pruebas.
5. `SECURITY_AND_LEGAL_RISKS.md` — riesgos legales/seguridad (incluye: no automatizar trámites, no pedir claves SII/SUNAT/SUNARP, impuestos como "estimación").

## 6. No-objetivos de esta fase
Sin código, sin integración al repo base, sin automatizar trámites, sin pedir ni almacenar claves de organismos públicos, sin recomendar forma jurídica o régimen sin datos suficientes, sin presentar información general como asesoría legal/tributaria individual.

## 7. Criterio de aceptación
Fase de investigación hecha cuando: cada entregable existe con fuentes fechadas; lo no verificado está marcado (no omitido); el plan MVP tiene criterios testeables; y el dueño autoriza por escrito pasar a diseño/build.
