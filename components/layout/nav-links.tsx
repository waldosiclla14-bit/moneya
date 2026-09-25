import Link from 'next/link';

const links = [
  { href: '/simular', label: 'Simular' },
  { href: '/finanzas', label: 'Finanzas' },
  { href: '/perfil', label: 'Perfil' },
  { href: '/misiones', label: 'Misiones' },
  { href: '/datos', label: 'Datos LATAM' },
  { href: '/aprender', label: 'Aprender' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/login', label: 'Entrar' },
];

export function NavLinks() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="transition-colors duration-200 hover:text-ink"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}