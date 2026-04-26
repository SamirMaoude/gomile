import React from "react";
import clsx from "clsx";
interface ContainerProps {
    children: React.ReactNode;
    fullwidth?: boolean;
    className?: string;
}

export default function Container({ children, fullwidth = false, className }: ContainerProps) {
    return (
        <div className={clsx(fullwidth ? "w-full" : "max-w-7xl", "px-4 sm:px-6 lg:px-8 mx-auto", className)}>
            {children}
        </div>
    );
}
