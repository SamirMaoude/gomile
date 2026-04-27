import React from 'react'
import Container from '@/components/ui/elements/container'
import Typography from '@/components/ui/design-system/typography'
import SocialIcon from '@/components/ui/design-system/socialIcons'
import { Logo } from '@/components/Logo/Logo'

/* ─── Données des colonnes ───────────────────────────── */
const links = {
  Produit: [
    { label: 'Tarifs',          href: '#' },
    { label: 'API',             href: '#' },
    { label: 'Application',     href: '#' },
  ],
  Support: [
    { label: "Centre d'aide", href: '#' },
    { label: 'FAQ',           href: '#' }
  ],
}

/* ─── Icônes sociales ────────────────────────────────── */
const socials: { name: React.ComponentProps<typeof SocialIcon>['name']; href: string; label: string }[] = [
  { name: 'facebook',  href: '#', label: 'Facebook'  },
  { name: 'x',         href: '#', label: 'Twitter/X' },
  { name: 'instagram', href: '#', label: 'Instagram' },
  { name: 'linkedin',  href: '#', label: 'LinkedIn'  },
]

/* ─── Footer ─────────────────────────────────────────── */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <Container Component="footer" size="full" padding={false} bg_theme='blue' className="w-full px-6 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-3">

            {/* Colonne marque */}
            <div className="flex flex-col gap-5">
                {/* Logo + nom */}
                <div className="flex items-center gap-3">
                    <Logo size="sm" />
                    <Typography variant="h5" weight="bold" theme="white">
                        GoMile
                    </Typography>
                </div>

            {/* Accroche */}
            <Typography variant="p" theme="white">
                Votre service de livraison rapide et fiable.
                Disponible 7j/7 pour tous vos besoins de livraison.
            </Typography>

            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-1">
                {socials.map(({ name, href, label }) => (
                <SocialIcon
                    key={name}
                    name={name}
                    href={href}
                    label={label}
                    size={16}
                    className="rounded-lg bg-primary-blue text-white hover:scale-100 hover:bg-primary-green hover:text-white"
                />
                ))}
            </div>
            </div>

            {(Object.entries(links) as [string, { label: string; href: string }[]][]).map(([section, items]) => (
                <div key={section} className="flex-1 flex flex-col gap-4">
                    <Typography variant="h6" weight="semibold" theme="white">
                    {section}
                    </Typography>
                    <ul className="flex flex-col gap-2.5">
                    {items.map(({ label, href }) => (
                        <li key={label}>
                        <a
                            href={href}
                            className="text-sm text-white/50 link"
                        >
                            {label}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
            ))}
        </div>

        {/* Séparateur */}
        <div className="border-t border-white" />

        {/* Copyright */}
        <Typography variant="p" Component='p' theme="white" className="text-center text-sm">
            © {year} GoMile. Tous droits réservés.
        </Typography>
        </div>
    </Container>
  )
}
