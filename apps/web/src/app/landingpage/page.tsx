import HeroSection from "@/components/sections/HeroSection/HeroSection";
import StepSection from "@/components/sections/StepSection/StepSection";
import BackGround from "@/components/ui/design-system/background/background";
import Card from "@/components/ui/design-system/cards/card";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import { Clock, MapPin, Shield, Smartphone, Truck, Headphones } from "lucide-react"

export default function landingpage() {
    return(
    
        <main>
            
            <Navigation text_theme="grey" theme="landingpage"/>
            <HeroSection/>
            <Container size='full' Component="section" className="flex justify-center flex-col items-center min-h-screen">
                <Title_ST title="Pourquoi choisir GoMile?" sub_title="Découvrez les avantages de notre service de livraison rapide et fiable."></Title_ST>
                <div className="mt-5 w-full grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-6 md:grid-rows-2 lg:grid-rows-3">
                    <Card icon={<Clock size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<MapPin size={22} />} iconTheme="blue" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Shield size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Smartphone size={22} />} iconTheme="blue" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Truck size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Headphones size={22} />} iconTheme="blue" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                </div>
            </Container>

            <StepSection></StepSection>

        </main>
    
    )
}