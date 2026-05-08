import HeroSection from "@/components/sections/HeroSection/HeroSection";
import StepSection from "@/components/sections/StepSection/StepSection";
import Card from "@/components/ui/design-system/cards/card";
import FooterLP from "@/components/ui/design-system/header_footer/footerlp";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import { BadgeEuro, Clock, Headphones, MapPin, Shield, Smartphone } from "lucide-react"

export default function LandingPage() {
    return (
        <main>
            <Navigation theme="landingpage"/>
            <HeroSection/>
            <Container size='full' Component="section" className="section-container" padding={false}>
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 lg:gap-16">
                    <Title_ST title="Pourquoi choisir GoMile?" sub_title="Découvrez les avantages de notre service de livraison rapide et fiable."></Title_ST>
                    <div className="grid-3-cols gap-8 lg:gap-10">
                        <Card className="h-full min-h-56" icon={<Clock size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                        <Card className="h-full min-h-56" icon={<MapPin size={22} />} iconTheme="blue" title="Dessert toute la région" description="Recevez vos colis en moins d'une heure."></Card>
                        <Card className="h-full min-h-56" icon={<Shield size={22} />} iconTheme="green" title="Protection" description="Recevez vos colis en moins d'une heure."></Card>
                        <Card className="h-full min-h-56" icon={<Smartphone size={22} />} iconTheme="blue" title="Facilité d'utilisation" description="Recevez vos colis en moins d'une heure."></Card>
                        <Card className="h-full min-h-56" icon={<BadgeEuro size={22} />} iconTheme="green" title="Tarifs pour tous" description="Choisissez l'abonnement qui vous correspond au mieux."></Card>
                        <Card className="h-full min-h-56" icon={<Headphones size={22} />} iconTheme="blue" title="Service d'assistance" description="Recevez vos colis en moins d'une heure."></Card>
                    </div>
                </div>
            </Container>
            <StepSection/>
            <FooterLP/>
        </main>
    )
}
