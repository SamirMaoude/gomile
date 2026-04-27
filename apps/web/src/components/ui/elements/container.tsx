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
  fullwidth?: boolean;
  className?: string;
  Component?: ContainerTag;
  padding?: boolean;
  bg_theme?: 'white' | 'blue' | 'hero';
}

const sizeClasses: Record<string, string> = {
        sm:   'max-w-2xl mx-auto',
        md:   'max-w-4xl mx-auto',
        lg:   'max-w-6xl mx-auto',
        xl:   'max-w-7xl mx-auto',
        full: 'w-full',
    }

export default function Container({ children, size = 'md', fullwidth, className, Component='div', padding = true, bg_theme }: ContainerProps) {
    if (fullwidth) size = 'full';
    return (
        <Component className={clsx(sizeClasses[size], bg_theme ? background_theme[bg_theme] : undefined, className, padding? 'py-3 px-6 sm:px-8 lg:px-10': '')}>
            {children}
        </Component>
    );
}
