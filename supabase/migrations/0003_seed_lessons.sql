-- ============================================================================
-- MONEYA LATAM — Seed biblioteca (PRD sección 34 / ítem 8 del alcance)
-- 10 artículos ORIGINALES de MONEYA (redacción propia, inspirada en los 5 ejes
-- del PRD: margen de error, suficiente, consumo de estatus, riqueza invisible
-- y suerte/riesgo). NO reproduce texto de terceros y NO inventa cifras:
-- los consejos son cualitativos y remiten a las métricas propias de la app.
-- Fuente espejo en la app: lib/aprender/lessons.ts (debe mantenerse en paridad).
-- ============================================================================

begin;

with lecturas as (
    select * from (values
        ('que-es-margen-de-error', 'Qué es el margen de error',
         'El margen de error no es cuánto ganas, sino cuánto te sobra entre lo que entra y lo que sale cada mes. Es el espacio que te permite equivocarte sin caer.',
         $$Una de las diferencias más grandes en las finanzas personales no está en el sueldo, sino en el espacio entre lo que entra y lo que sale cada mes. Ese espacio es tu margen de error: la capacidad de absorber un golpe sin que se te caiga la vida.

Si se descompone el refrigerador, si el colegio cobra un permiso, si un mes sale más caro, qué pasa. Para la persona sin margen, cualquier imprevisto se convierte en deuda. Para la que tiene margen, es un ajuste incómodo y nada más.

En MONEYA medimos una parte de ese margen con los meses de cobertura: cuántos meses podrías sostener tus gastos esenciales con lo que tienes líquido, si tu ingreso desapareciera. Es una cifra simple, con fórmula visible, y no necesita que ganes más para mejorar: puedes bajar gastos, aumentar lo que guardas o las dos cosas.

El margen no es un capricho de conservador. Es la diferencia entre decidir con calma y decidir con miedo. Y se construye poco a poco: se trata de que cada mes te sobre algo, por pequeño que sea.$$,
         'room_for_error'::public.lesson_topic, 3),

        ('margen-para-imprevistos', 'El colchón no es un lujo, es margen',
         'Piensa el ahorro de emergencia no como un producto financiero, sino como el espacio que protege tus decisiones de los sobresaltos.',
         $$La palabra colchón suena a lujo o a excepción. En realidad es la parte más práctica de tus finanzas: dinero líquido al que puedes llegar sin vender nada, sin pedir crédito y sin esperar.

La regla mental simple es definir cuántos meses de gastos esenciales quieres tener disponibles. Ese número no es una meta mágica: es un espacio de decisión. Con cero meses, cualquier imprevisto te obliga a elegir entre deuda cara o dejar de pagar otras cosas. Con un mes, ganas aire. Con tres, la mayoría de los imprevistos del día a día dejan de ser una crisis. En tu app puedes ver tu propio número con los meses de cobertura, en lugar de perseguir un porcentaje inventado.

Parte del valor del colchón no se nota hasta que lo necesitas: no rinde intereses, no se ve en las redes y nadie te felicita. Pero hace que el resto de tus decisiones financieras sean menos urgentes y mejores.

Empieza por cualquier monto. Lo importante es que el flujo mensual sobre, y que lo que sobre no se confunda con un extra para gastar en el primer impulso.$$,
         'room_for_error'::public.lesson_topic, 3),

        ('que-es-suficiente', '¿Cuánto es suficiente?',
         'Suficiente no es una cifra universal: es una conversación honesta contigo sobre qué te alcanza para vivir bien.',
         $$Todos conocemos la pregunta de cuánto necesito para vivir tranquilo y la sensación de que la respuesta siempre es un poco más. La trampa está en tratar suficiente como una cifra que viene de afuera: el auto del compañero, el viaje del amigo, la vitrina del vecino.

Suficiente es una respuesta propia, y se construye en dos pasos. Primero, lo objetivo: cuánto necesitas cada mes para cubrir lo esencial, tus metas y un margen para imprevistos. Ese número puedes verlo con tus métricas en MONEYA, sin opiniones. Segundo, lo subjetivo: qué parte de tu vida estarías dispuesto a no aumentar para conservar libertad.

El riesgo no es querer más; es no saber cuándo parar. Cuando suficiente no está definido, el ingreso sube y el estilo de vida sube con él, y la sensación de escasez queda igual. Cuando está definido, cada ingreso extra deja de ser automáticamente un gasto extra y se vuelve una decisión.$$,
         'never_enough'::public.lesson_topic, 3),

        ('la-escalera-del-mas', 'La escalera sin techo',
         'Por qué es tan difícil sentirse satisfecho y qué ayuda a no caer en el nunca suficiente.',
         $$Hay una dinámica que se repite en casi todas las finanzas: el ingreso sube, las expectativas suben, y al final del mes vuelve a no sobrar nada. No es falta de disciplina: es que la referencia con la que medimos suficiente es móvil.

Cuando comparamos nuestro consumo con el del círculo que tenemos cerca, siempre hay alguien con más. Comparar es gratis y rápido, y por eso es la comparación favorita del cerebro. El problema es que rara vez comparamos lo que no se ve: la deuda que sostiene el auto del vecino, las cuotas detrás de la pantalla del bar.

Dos cosas ayudan. La primera es compararte con tu historia, no con la de otros: tu punto de partida, tu progreso, tu margen. La segunda es definir lo que suficiente significa para ti con números propios, como tus meses de cobertura o tu meta de ahorro, y dejar que ese número, no el vecino, marque el ritmo.

El nunca suficiente no se cura ganando más. Se cura dándole un número a suficiente.$$,
         'never_enough'::public.lesson_topic, 3),

        ('consumir-para-quien', '¿Para quién es ese auto?',
         'El consumo de estatus nos rodea en silencio. Aprende a detectarlo antes de que se convierta en cuotas.',
         $$Parte de lo que compramos no es para nosotros. Un auto más caro del necesario, el celular del año, la ropa que muestra marca: cada uno manda una señal. El problema no es comprar lo que te gusta, es pagar por la señal sin darte cuenta.

La pregunta que desnuda el consumo de estatus es simple: si nadie pudiera ver esta compra, ¿la haría igual? Si la respuesta es que no, estás comprando la mirada de otros con tu margen.

Esto no es una crítica moral: es una observación sobre cómo funciona la compra impulsiva. La señal se disfruta un instante, cuando la ven; la cuota se paga muchos meses, cuando ya nadie mira. Y el costo oculto más alto es el margen que dejas de construir: cada peso que se va en señal, no está en tu colchón ni en tu libertad futura.

En MONEYA el consejo es práctico y sin juicio: reconocer el gasto de estatus, separarlo del gasto que realmente te sirve, y preguntarte si la señal vale más que el margen que sacrifica. Casi siempre vale menos.$$,
         'status_consumption'::public.lesson_topic, 4),

        ('la-paradoja-de-menos', 'La paradoja de menos',
         'Tener menos cosas visibles puede darte más libertad real. Una idea incómoda y muy rentable.',
         $$Hay una paradoja en el dinero: lo que más se muestra suele ser lo que menos se tiene. Quien parece tenerlo todo en la vitrina, muchas veces está más endeudado que aquel que no muestra nada.

La riqueza que se ve, como autos, relojes y viajes permanentes, es cara de mantener y expone a quien la tiene. La riqueza que no se ve, dinero guardado, deudas bajas y margen para decidir, no da aplausos, pero da opciones.

Lo incómodo es que ambas se persiguen con el mismo ingreso. Si tu presupuesto va a la señal, no va al margen. Por eso el patrón de quien construye libertad no es gastar mejor en público, sino gastar menos en público y más en lo que no se nota.

No se trata de vivir mal, sino de no vivir para la foto. Cuando dejas de competir en la vitrina, el mismo sueldo alcanza para más vida y más tranquilidad. Esa es la paradoja de menos: bajar el consumo visible no se siente como pérdida, se siente como margen.$$,
         'status_consumption'::public.lesson_topic, 4),

        ('riqueza-invisible', 'La riqueza es lo que no ves',
         'Lo que tienes guardado no se ve, y por eso parece que no existe. Pero es lo más real de tus finanzas.',
         $$Hay una diferencia entre parecer rico y ser financieramente estable. Lo primero se construye hacia afuera; lo segundo se construye hacia adentro, en cuentas que nadie ve.

La riqueza que no se ve tiene tres ventajas. Una: no pide mantenimiento ni renovación, un auto caro hay que asegurarlo, cuidarlo y cambiarlo, una posición de liquidez no pide nada. Dos: no genera opiniones, nadie comenta lo bien que te va con tu margen, y eso está bien. Tres: es flexible, porque no está atada a una imagen.

El problema del dinero invisible es psicológico: como no se ve, cuesta creer que existe, y el instinto pide convertirlo en algo visible. Comprar en cuanto sobra es, en el fondo, una manera de confirmar que el dinero es real.

En MONEYA tu riqueza invisible es tan concreta como un número: tu saldo líquido, tu cobertura de meses, tu deuda bajo control. Medirla hace que deje de ser invisible para ti. Y tu relación con el dinero mejora cuando dejas de necesitar que otros la vean.$$,
         'invisible_wealth'::public.lesson_topic, 3),

        ('ahorrar-en-silencio', 'El pago silencioso',
         'Cada compra que no haces es un pago silencioso a favor de tu libertad futura. Así se siente vivirlo.',
         $$Casi todo lo que termina siendo tu patrimonio nació como una compra que decidiste no hacer. Es difícil de ver porque no deja rastro: no hay factura, no hay foto, no hay nadie aplaudiendo. Pero acumulado, es la diferencia entre llegar a fin de mes con deuda y llegar con margen.

Este es el pago silencioso: el dinero que no gastas, bien guardado, sin exhibirse. Se siente raro porque la cultura del consumo premia el rastro visible. Pero quien construye seguridad vive el proceso exactamente al revés: siente la compra cuando la hace, breve, y el ahorro cuando pasa el tiempo, crece.

Lo práctico es automatizar la parte que no depende de tu fuerza de voluntad: que el ahorro se aparte apenas entra el ingreso, antes de que el impulso lo reclame. Así el pago silencioso ocurre solo, todos los meses.

No es sacrificio heroico, es orden. Y a diferencia del gasto visible, que se olvida rápido, el ahorro silencioso se recuerda solo: cada vez que un imprevisto no te tumba, o que llega un mes en que puedes decidir con calma.$$,
         'invisible_wealth'::public.lesson_topic, 3),

        ('suerte-y-riesgo', 'Suerte y riesgo: la misma moneda',
         'Un mismo resultado puede venir de la habilidad, de la suerte o del riesgo. Aprende a no confundir los tres.',
         $$Durante años, decidir bien se confundió con acertar el resultado. Si la inversión subió, se asumió que fue buena; si bajó, que fue mala. Pero el resultado de casi cualquier decisión financiera mezcla tres cosas: tu habilidad, tu suerte y el riesgo que tomaste.

La suerte importa más de lo que nos gusta admitir. Dos personas pueden tomar la misma decisión y obtener resultados opuestos solo por el momento. Por eso copiar ciegamente a quien le fue bien, sin entender su suerte, es de las apuestas más caras.

El riesgo es la otra cara: algunos resultados buenos vienen de decisiones que, repetidas muchas veces, terminan mal. Una apuesta a una sola carta puede salir bien una vez y arruinarte a la décima.

La manera de tratarlos juntos es quitarte la presión del resultado único. En vez de evaluar una decisión por su desenlace, evalúa si, con la misma información y el mismo proceso, la tomarías de nuevo. Esa pregunta separa lo que dependía de ti de lo que dependió del azar. Y en temas de dinero, el proceso repetible vale más que un acierto de suerte.$$,
         'luck_risk'::public.lesson_topic, 4),

        ('proceso-no-resultado', 'Juzga el proceso, no el resultado',
         'Un buen resultado puede esconder una mala decisión y viceversa. Por eso te conviene fijarte en el proceso.',
         $$Existe una trampa estadística muy común: mirar solo a los ganadores. El que ganó la lotería, el amigo que apostó y salió bien, la inversión que todos elogian después de subir. Esta mirada olvida a todos los que hicieron lo mismo y perdieron. Se llama sesgo de supervivencia, y en las conversaciones de dinero está por todas partes.

La mayoría de las historias de éxito financiero que se cuentan son historias de una carta que salió bien. Copiarlas es asumir que la próxima saque la misma carta.

Qué hacer: juzgar decisiones por su proceso, no por su resultado. Antes de tomar una decisión financiera, define de antemano a qué le sirve. ¿Qué información uso? ¿Cuánto puedo perder sin que se caiga mi margen? ¿Lo repetiría cien veces? Si el proceso es sólido, un mal resultado es ruido del azar. Si el proceso es una apuesta, un buen resultado sigue siendo una apuesta.

La ventaja práctica es enorme: el proceso lo controlas, el resultado no. Y tu salud financiera, a diferencia de la lotería, se juega en muchos turnos, no en uno.$$,
         'luck_risk'::public.lesson_topic, 4)
    ) as t(slug, title, summary, body, topic, reading_minutes)
)
insert into public.lessons (slug, title, summary, body, topic, reading_minutes, published, created_at)
select
    l.slug,
    l.title,
    l.summary,
    l.body,
    l.topic,
    l.reading_minutes,
    true,
    '2026-09-24 08:00:00+00'::timestamptz + row_number() over (order by l.slug) * interval '1 minute'
from lecturas l;

commit;