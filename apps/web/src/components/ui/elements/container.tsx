import React from "react";
import clsx from "clsx";

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerTag = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form';
const background_theme = {
    white: "bg-white",
    blue: "bg-primary-blue-dark",
    hero: "bg-linear-to-br from-blue-100 to-green-100"
}

type ContainerProps<T extends ContainerTag = 'div'> = React.ComponentPropsWithoutRef<T> & {
  children: React.ReactNode;
  size?: ContainerSize;
  fullwidth?: boolean;
  className?: string;
  Component?: T;
  padding?: boolean;
  bg_theme?: 'white' | 'blue' | 'hero';
};

const sizeClasses: Record<string, string> = {
        sm:   'max-w-2xl mx-auto',
        md:   'max-w-4xl mx-auto',
        lg:   'max-w-6xl mx-auto',
        xl:   'max-w-7xl mx-auto',
        full: 'w-full',
    }

export default function Container<T extends ContainerTag = 'div'>({ children, size = 'md', fullwidth, className, Component, padding = true, bg_theme, ...props }: ContainerProps<T>) {
    if (fullwidth) size = 'full';
    const Element = (Component ?? 'div') as React.ElementType;

    return React.createElement(
        Element,
        {
            className: clsx(sizeClasses[size], bg_theme ? background_theme[bg_theme] : undefined, className, padding? 'py-3 px-6 sm:px-8 lg:px-10': ''),
            ...props,
        },
        children,
    );
}
