# MONEYA vs gestores de gastos — comparativa

Fecha de consulta: 2026-10-20 · Origen: benchmark con fuentes + auditoría interna (2 agentes). Lo no verificable va marcado [hipótesis].

## Hallazgo central
Ningún gestor mainstream es **PWA**: son apps nativas (Play/App Store) con web companion opcional. Que MONEYA sea PWA es una **diferencia** (instalable desde navegador, shell offline), pero no basta: un gestor "básico usable" necesita registro transaccional + categorías + presupuesto + sync. MONEYA hoy es **bienestar conductual**, no gestor: calcula y muestra un resumen mensual por **agregados**, no registra **movimientos**.

## Tabla (fuente primaria, 2026-10-20)

| App | Registro | Categorías | Presupuesto+alertas | Multi-disp./offline | PWA? | Precio |
|---|---|---|---|---|---|---|
| Monefy | Manual | Custom + auto | Mensual | Sync Drive/Dropbox | No (nativa) | Free / Premium ~$60 año |
| Mobills | Manual | Custom | Mensual + metas | Sync nube online/offline | No | Free limitado / Premium |
| Money Manager | Manual (doble entrada) | Custom subcat | Sem/mens/anual | iCloud/PC | No | Free+ads / $9.99 único |
| Spendee | Manual o banco | Custom | Sí | Sync; web | No | Free / $1.99–5.99 mes |
| Wallet | Manual o banco | Custom + subcat | Recurrentes + alertas | Sync nube + web | No | Free manual / Premium sync |
| Fintonic | **Solo automático** (banco) | Automáticas | Por partida + alertas | Nativa + web | No | Free (cobra a entidades) |
| YNAB | Manual o import | Custom | Sí (envelopes) | Multi-dispositivo | No | $14.99/mes, sin free |
| **MONEYA** | **Solo agregados** (2 campos) | Binario esencial/no | No | **PWA + offline-shell** | **Sí** | Gratis (demo local) |

Fuentes: fintonic.com/es-ES/alertas · play.google.com Mobills · monefy.com · youneedabudget.com/pricing · budgetbakers.com Wallet · spendee.com/pricing · realbyteapps.com Money Manager · mipresupuesto.co (LATAM) · [hipótesis] "Alkanza/Tyba/Buda" no son gestores de gastos personal.

## 6 features que un gestor "básico usable" debe tener
1. Registro manual en ≤3 toques (monto + categoría), sin obligar banco.
2. Categorías personalizables con auto-sugerencia.
3. Presupuesto por categoría/mes con alertas de exceso.
4. Visual por categoría (torta) + total mes a la vista.
5. Sync multi-dispositivo con modo offline.
6. Exportación (CSV/JSON) + backup.

## Lo que MONEYA tiene (verificado)
Resumen mensual por fuente, gastos en 2 buckets, saldo, flujo, inventario de deudas, 3 métricas (cobertura, ratio de deuda, concentración), panel de hoy, simulador, misiones, PWA (manifest/SW/prompt), formato CL/PE.

## Lo que le falta (verificado, file:linea en el repo)
1. Registro de gastos individuales (transacciones con fecha/monto/nota) — no existe (solo `foto-financiera.tsx:194-195`).
2. Historial multi-mes — `listarSnapshots` existe pero **0 usos**; localStorage guarda 1 solo mes.
3. Categorías + presupuesto por categoría con alerta — no existe.
4. Exportación local — solo con cuenta Supabase.
5. Búsqueda/filtro — no existe.
6. Sincronización entre dispositivos — requiere backend (O1 diferida).

## Lectura estratégica [opinión]
- Los **#1–#5 no requieren backend** → MONEYA puede pasar de "foto mensual" a "gestor local" creíble manteniendo el PWA como ventaja.
- El **#6 (sync)** es el único que separa un gestor serio de uno de nicho y queda bloqueado por O1.
- Ventaja que MONEYA sí tiene sobre los gestores: la capa de **comprensión** (métricas, simulador, test CFPB, lenguaje llano) que ninguno combina con tracking. No perder eso al añadir tracking.
