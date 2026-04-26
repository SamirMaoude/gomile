import React from "react";
import { Typography } from "@/components/ui/design-system/typography";


export const PagePrincipale = () => {
    return (
        <div>
            <Typography variant="h1" weight="bold" theme="primary">
                Bienvenue sur la page principale
            </Typography>
            <Typography variant="p" weight="normal" theme="grey">
                Ceci est un exemple de page principale utilisant le composant Typography.
            </Typography>
        </div>
    );
}