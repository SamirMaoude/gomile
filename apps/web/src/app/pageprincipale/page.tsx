// app/page.tsx
import Button from "@/components/ui/design-system/button/button";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Container from "@/components/ui/elements/container";
import {Navigation} from "@/components/ui/navigation/navigation";
import Typography from "@/components/ui/design-system/typography";
import Link from "next/link";
import Background from "@/components/ui/design-system/background/background";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
export default function HomePage() {
  return (
    <Background>
      <Navigation theme="landingpage"/>

      <main className="flex flex-1 flex-col p-6 items-center justify-center">

        <div className="flex flex-col w-250 h-150 bg-bg-card mx-auto gap-3 items-center justify-center p-2 rounded-card shadow-lg border-2 border-gray-200">
          
          <Typography variant="h1" weight="bold" theme="black" className="text-center">Bienvenue sur GoMile</Typography>
          
          <div className="flex-1 flex gap-5 w-full">
            
            <Container className="flex-1 flex flex-col gap-2 items-center justify-center bg-white rounded-card shadow border-2 border-gray-200" size="full">
              <div className="flex flex-col">
                <Typography variant="h4" weight="bold" theme="black" className="text-center">Je suis un commerçant</Typography>
                <Typography variant="span" theme="black" className="text-center">Gérez vos livraisons en toute simplicité avec GoMile, votre partenaire de confiance pour une logistique efficace et sans stress.</Typography>
              </div>
              <div className="w-64 h-64 bg-cover bg-center" style={{ backgroundImage: "url('../images/commercant.png')" }}></div>
              
              <Button variant="filled" size="md">Je m'inscris</Button>
            
              <Button variant="filled" size="md">Je me connecte</Button>
            </Container>
            
            <Container className="flex-1 flex flex-col gap-2 items-center justify-center bg-white rounded-card shadow border-2 border-gray-200" size = 'full'>
              <div className="flex flex-col">
                <Typography variant="h4" weight="bold" theme="black" className="text-center">Je suis un livreur</Typography>
                <Typography variant="span" theme="black" className="text-center">Devenez votre propre patron et livrez quand vous voulez</Typography>
              </div>
              <div className="w-64 h-64 bg-cover bg-center" style={{ backgroundImage: "url('../images/livreur.png')" }}></div>
              <Button variant="filled" size="md">Je m'inscris</Button>
              <Button variant="filled" size="md">Je me connecte</Button>
            </Container>
          
          </div>
        
        </div>
      
      </main>


      <Footerlp />
    </Background>
  );
}



