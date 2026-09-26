'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

export function CountUp({ value, suffix = '', duration = 900, delay = 120, className }: Props) {
  const [mostrado, setMostrado] = useState(value);
  const internos = useRef(value);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMostrado(value);
      return;
    }
    let frame = 0;
    const inicio = performance.now() + delay;
    const id = window.setTimeout(() => {
      const animar = (now: number) => {
        const t = Math.min(1, (now - inicio) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = value * eased;
        internos.current = v;
        setMostrado(v);
        if (t < 1) frame = window.requestAnimationFrame(animar);
      };
      frame = window.requestAnimationFrame(animar);
    }, delay);
    return () => {
      window.clearTimeout(id);
      window.cancelAnimationFrame(frame);
    };
  }, [value, duration, delay]);

  const texto = internos.current.toLocaleString('es-CL', { maximumFractionDigits: 1 }) + suffix;
  return (
    <span className={className} aria-hidden="true">
      {texto}
    </span>
  );
}