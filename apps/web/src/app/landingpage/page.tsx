import HeroSection from "@/components/sections/HeroSection/HeroSection";
import StepSection from "@/components/sections/StepSection/StepSection";
import BackGround from "@/components/ui/design-system/background/background";
import Card from "@/components/ui/design-system/cards/card";
import FooterLP from "@/components/ui/design-system/header_footer/footerlp";
import Footer from "@/components/ui/design-system/header_footer/footerlp";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import Navbar from "@/components/ui/navigation/navbar";
import { Navigation } from "@/components/ui/navigation/navigation";
import { Clock, MapPin, Shield, Smartphone, Truck, Headphones } from "lucide-react"

export default function landingpage() {
    return(
    
        <main>
            
            <Navigation theme="landingpage"/>
            <HeroSection/>
            <Container size='full' Component="section" className="section-container">
                <Title_ST title="Pourquoi choisir GoMile?" sub_title="Découvrez les avantages de notre service de livraison rapide et fiable."></Title_ST>
                <div className="grid-3-cols">
                    <Card icon={<Clock size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<MapPin size={22} />} iconTheme="blue" title="Dessert toute la région" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Shield size={22} />} iconTheme="green" title="Protection" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Smartphone size={22} />} iconTheme="blue" title="Facilité d'utilisation" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Truck size={22} />} iconTheme="green" title="Livraison Express" description="Recevez vos colis en moins d'une heure."></Card>
                    <Card icon={<Headphones size={22} />} iconTheme="blue" title="Service d'assistance" description="Recevez vos colis en moins d'une heure."></Card>
                </div>
            </Container>

            <StepSection></StepSection>
            <FooterLP/>

        </main>
    
    )
}