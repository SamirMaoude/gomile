import Button from "@/components/ui/design-system/button/button";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Container from "@/components/ui/elements/container";
import Typography from "@/components/ui/design-system/typography";
import NavigationDefault from "@/components/ui/header/navigation-default";

export default function HomePage() {
  return (
    <div
      className="flex h-screen w-full flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <NavigationDefault />

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

          <div className="flex w-full flex-1 gap-5">
            <Container
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-card border-2 border-gray-200 bg-white shadow"
              fullwidth={true}
            >
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

              <div
                className="h-64 w-64 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/commercant.png')" }}
              />

              <Button variant="filled" size="md" href="/merchant/register">
                Je m&apos;inscris
              </Button>
              <Button variant="filled" size="md" href="/merchant/login">
                Je me connecte
              </Button>
            </Container>

            <Container
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-card border-2 border-gray-200 bg-white shadow"
              fullwidth={true}
            >
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
    </div>
  );
}
