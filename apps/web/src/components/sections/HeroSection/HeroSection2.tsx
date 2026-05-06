import BackGround from "@/components/ui/design-system/background/background";
import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import Image from "next/image";
import Badge from "@/components/ui/design-system/cards/badge";
import { Package } from 'lucide-react';


export default function HeroSection2(){
    return (
        <Container Component="section" size='full' padding={false} className="flex centered h-[50vh]" bg_theme="hero">
            <div className="flex flex-col items-center justify-center p-5 gap-5">
                <Typography variant="h1" weight="bold" theme="black" Component="h1">
                        Notre histoire, vos {" "}
                        <Typography variant="h1" weight="bold" theme='primary' Component="span">
                            livraisons
                        </Typography>
                    </Typography>
                    
                <Typography variant='h4' weight='light' theme='grey' Component='p'>
                    Découvrez l'équipe passionnée derrière GoMile et notre engagement à révolutionner la livraison de colis. 
                    Nous sommes une équipe de professionnels dévoués, animés par la volonté de fournir un service de livraison rapide, 
                    fiable et convivial. Notre histoire est celle d'une vision partagée : 
                    rendre la livraison de colis plus efficace et accessible à tous. 
                    Rejoignez-nous dans cette aventure passionnante et découvrez comment nous transformons la façon dont les colis sont livrés.
                </Typography>
            </div>
        </Container>
    )
}