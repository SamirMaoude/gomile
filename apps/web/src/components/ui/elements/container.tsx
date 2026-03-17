import React from "react";
import clsx from "clsx";

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerTag = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
const background_theme = {
    white: "bg-white",
    blue: "bg-primary-blue-dark",
    hero: "bg-linear-to-br from-blue-100 to-green-100"
}

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
  Component?: ContainerTag;
  padding?: boolean;
  bg_theme?: 'white' | 'blue' | 'hero';
}

const sizeClasses: Record<string, string> = {
        sm:   'max-w-2xl mx-auto',   // ~672px  → formulaires, articles
        md:   'max-w-4xl mx-auto',   // ~896px  → contenu centré
        lg:   'max-w-6xl mx-auto',   // ~1152px → pages standard
        xl:   'max-w-7xl mx-auto',   // ~1280px → par défaut actuel
        full: 'w-full',              // → sections pleine largeur
    }



export default function Container({ children, size = 'md', className, Component='div', padding = true, bg_theme='white' }: ContainerProps) {
    return (
        <Component className={clsx(sizeClasses[size], background_theme[bg_theme], className, padding? 'py-3 px-6 sm:px-8 lg:px-10': '')}>
            {children}
        </Component>
    );
}
