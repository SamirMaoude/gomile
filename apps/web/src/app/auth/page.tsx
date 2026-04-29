import Button from "@/components/ui/design-system/button/button";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Typography from "@/components/ui/design-system/typography";
import Background from "@/components/ui/design-system/background/background";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";

export default function AuthPage() {
  return (
    <Background className="min-h-dvh">
      <div className="flex min-h-dvh flex-col">
        <Navigation theme="landingpage" />

        <main className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-5 sm:py-5 md:py-8 lg:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-none flex-col items-center justify-center gap-3 rounded-card border-2 border-gray-200 bg-bg-card p-3 shadow-lg sm:gap-4 sm:p-4 md:rounded-2xl md:p-5 xl:min-h-[34rem]">
            <Typography
              variant="h1"
              weight="bold"
              theme="black"
              className="text-center text-[clamp(1.4rem,4.5vw,3rem)] leading-tight"
            >
              Bienvenue sur GoMile
            </Typography>

            <div className="grid w-full gap-2 sm:gap-4 md:grid-cols-2">
              <Container
                className="flex min-h-[9.5rem] flex-col items-center justify-center gap-2 rounded-card border-2 border-gray-200 bg-white p-3 shadow sm:min-h-[13rem] sm:gap-4 md:min-h-[20rem]"
                size="full"
              >
                <div
                  className="aspect-square w-[clamp(5.5rem,26vw,16rem)] bg-cover bg-center sm:w-40 md:w-56 lg:w-64"
                  style={{ backgroundImage: "url('/images/commercant.png')" }}
                />

                <Button
                  variant="filled"
                  size="md"
                  href="/merchant/register"
                  className="w-full max-w-64 px-3 text-center text-xs sm:text-sm md:text-base [&>span]:min-w-0 [&>span]:break-words"
                >
                  Je suis un commerçant
                </Button>
              </Container>

              <Container
                className="flex min-h-[9.5rem] flex-col items-center justify-center gap-2 rounded-card border-2 border-gray-200 bg-white p-3 shadow sm:min-h-[13rem] sm:gap-4 md:min-h-[20rem]"
                size="full"
              >
                <div
                  className="aspect-square w-[clamp(5.5rem,26vw,16rem)] bg-cover bg-center sm:w-40 md:w-56 lg:w-64"
                  style={{ backgroundImage: "url('/images/livreur.png')" }}
                />

                <Button
                  variant="filled"
                  size="md"
                  href="/driver/register"
                  className="w-full max-w-64 px-3 text-center text-xs sm:text-sm md:text-base [&>span]:min-w-0 [&>span]:break-words"
                >
                  Je suis livreur
                </Button>
              </Container>
            </div>
          </div>
        </main>
      </div>

      <Footerlp />
    </Background>
  );
}
