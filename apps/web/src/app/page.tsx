import Button from "@/components/ui/design-system/button/button";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Container from "@/components/ui/elements/container";
import Typography from "@/components/ui/design-system/typography";
import Link from "next/link";
import Background from "@/components/ui/design-system/background/background";
import { Navigation } from "@/components/ui/navigation/navigation";
export default function HomePage() {
  return (
    <Background>
      <Navigation />

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mx-auto flex h-150 w-250 flex-col items-center justify-center gap-3 rounded-card border-2 border-gray-200 bg-bg-card p-2 shadow-lg">
          <Typography
            variant="h1"
            weight="bold"
            theme="black"
            className="text-center"
          >
            Bienvenue sur GoMile
          </Typography>
        </div>
        <div className="flex flex-col w-250 h-150 bg-bg-card mx-auto gap-3 items-center justify-center p-2 rounded-card shadow-lg border-2 border-gray-200">
          
          <Typography variant="h1" weight="bold" theme="black" className="text-center">Bienvenue sur GoMile</Typography>
          
          <div className="flex-1 flex gap-5 w-full">
            
            <Container className="flex-1 flex flex-col gap-2 items-center justify-center bg-white rounded-card shadow border-2 border-gray-200" size="full">
              <div className="flex flex-col">
                <Typography
                  variant="h4"
                  weight="bold"
                  theme="black"
                  className="text-center"
                >
                  Je suis un commerçant
                </Typography>
                <Typography
                  variant="span"
                  theme="black"
                  className="text-center"
                >
                  Gérez vos livraisons en toute simplicité avec GoMile, votre
                  partenaire de confiance pour une logistique efficace et sans
                  stress.
                </Typography>
              </div>
              <div className="w-64 h-64 bg-cover bg-center" style={{ backgroundImage: "url('../images/commercant.png')" }}></div>
              
              <Button variant="filled" size="md">Je m'inscris</Button>
            
              <Button variant="filled" size="md">Je me connecte</Button>
            </Container>
            
            <Container className="flex-1 flex flex-col gap-2 items-center justify-center bg-white rounded-card shadow border-2 border-gray-200" size = 'full'>
              <div className="flex flex-col">
                <Typography
                  variant="h4"
                  weight="bold"
                  theme="black"
                  className="text-center"
                >
                  Je suis un livreur
                </Typography>
                <Typography
                  variant="span"
                  theme="black"
                  className="text-center"
                >
                  Devenez votre propre patron et livrez quand vous voulez
                </Typography>
              </div>

              <div
                className="h-64 w-64 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/livreur.png')" }}
              />

              <div className="flex w-full justify-center">
                <Button variant="filled" size="md" href="/driver/register">
                  Je m&apos;inscris
                </Button>
              </div>
            </Container>
          </div>
        </div>
      </main>

      <Footer />
    </Background>
  );
}
