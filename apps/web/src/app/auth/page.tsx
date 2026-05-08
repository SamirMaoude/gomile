import Button from "@/components/ui/design-system/button/button";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Typography from "@/components/ui/design-system/typography";
import Background from "@/components/ui/design-system/background/background";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import animationStyles from "./auth.module.css";
import { styles } from "./style";

export default function AuthPage() {
  return (
    <Background className="min-h-dvh">
      <div className={styles.pageShell}>
        <Navigation theme="landingpage" />

        <main className={styles.main}>
          <Typography
            variant="h1"
            weight="bold"
            theme="black"
            className={`${styles.title} ${animationStyles.animatedTitle}`}
          >
            Bienvenue sur GoMile
          </Typography>

          <div className={styles.content}>
            <div className={styles.optionsGrid}>
              <Container
                className={`${styles.optionCard} ${animationStyles.optionCardAnimated}`}
                size="full"
              >
                <div
                  className={styles.optionImage}
                  style={{ backgroundImage: "url('/images/commercant.png')" }}
                />

                <Button
                  variant="filled"
                  size="md"
                  href="/merchant/register"
                  className={styles.merchantButton}
                >
                  Je suis commerçant
                </Button>
              </Container>

              <Container
                className={`${styles.optionCard} ${animationStyles.optionCardAnimated}`}
                size="full"
              >
                <div
                  className={styles.optionImage}
                  style={{ backgroundImage: "url('/images/livreur.png')" }}
                />

                <Button
                  variant="filled"
                  size="md"
                  href="/driver/register"
                  className={styles.driverButton}
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
