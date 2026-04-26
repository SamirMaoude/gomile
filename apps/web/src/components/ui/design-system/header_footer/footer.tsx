import React from 'react'
import Link from 'next/link'

/* ─── Icônes réseaux sociaux (inline SVG) ───────────────── */
const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
)

/* ─── Données ───────────────────────────────────────────── */
const legalLinks = [
  { label: "Conditions d'Utilisation", href: '/conditions' },
  { label: 'Politique de Confidentialité', href: '/confidentialite' },
  { label: 'Contactez-nous', href: '/contact' },
]

const socialLinks = [
  { label: 'Facebook',  href: 'https://facebook.com',  icon: <IconFacebook /> },
  { label: 'LinkedIn',  href: 'https://linkedin.com',  icon: <IconLinkedIn /> },
  { label: 'Instagram', href: 'https://instagram.com', icon: <IconInstagram /> },
]

/* ─── Composant ─────────────────────────────────────────── */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-sm font-body text-footer-text/80 whitespace-nowrap">
            © {currentYear} GoMile. Tous droits réservés.
          </p>

          {/* Liens légaux */}
          <nav aria-label="Liens légaux">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-body text-footer-text/80 hover:text-footer-text transition-colors duration-200 whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Réseaux sociaux */}
          <ul className="flex items-center gap-3" aria-label="Réseaux sociaux">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-footer-text/80 hover:text-footer-text hover:bg-white/10 transition-all duration-200"
                >
                  {social.icon}
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </footer>
  )
}