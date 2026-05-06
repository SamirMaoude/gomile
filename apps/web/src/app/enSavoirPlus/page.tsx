import HeroSection from "@/components/sections/HeroSection/HeroSection";
import HeroSection2 from "@/components/sections/HeroSection/HeroSection2";
import StepSection from "@/components/sections/StepSection/StepSection";
import TeamSection from "@/components/sections/TeamSection/TeamSection";
import BackGround from "@/components/ui/design-system/background/background";
import Card from "@/components/ui/design-system/cards/card";
import FooterLP from "@/components/ui/design-system/header_footer/footerlp";
import Footer from "@/components/ui/design-system/header_footer/footerlp";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import { Clock, MapPin, Shield, Smartphone, Truck, Headphones } from "lucide-react"

export default function landingpage() {
    return(
    
        <main>
            <Navigation theme="landingpage"/>
            <HeroSection2/>
            <TeamSection/>
            <FooterLP/>
        </main>
    )
}