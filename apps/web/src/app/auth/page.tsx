import Button from "@/components/ui/design-system/button/button";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Container from "@/components/ui/elements/container";
import Typography from "@/components/ui/design-system/typography";
import NavigationDefault from "@/components/ui/header/navigation-default";
import {
  backgroundImageStyle,
  driverImageStyle,
  merchantImageStyle,
  styles,
} from "../styles";

export default function AuthPage() {
  return (
    <div className={styles.page} style={backgroundImageStyle}>
      <NavigationDefault />

      <main className={styles.main}>
        <div className={styles.content}>
          <Typography
            variant="h1"
            weight="bold"
            theme="black"
            className={styles.title}
          >
            Bienvenue sur GoMile
          </Typography>

          <div className={styles.cardsGrid}>
            <Container className={styles.choiceCard} fullwidth={true}>
              <div className={styles.choiceHeader}>
                <Typography
                  variant="h4"
                  weight="bold"
                  theme="black"
                  className={styles.choiceTitle}
                >
                  Je suis un commerçant
                </Typography>
              </div>

              <div
                className={styles.choiceImage}
                style={merchantImageStyle}
              />

              <div className={styles.merchantActions}>
                <Button
                  variant="filled"
                  size="md"
                  href="/merchant/register"
                  fullWidth
                >
                  Je m&apos;inscris
                </Button>
                <Button
                  variant="filled"
                  size="md"
                  href="/merchant/login"
                  fullWidth
                >
                  Je me connecte
                </Button>
              </div>
            </Container>

            <Container className={styles.choiceCard} fullwidth={true}>
              <div className={styles.choiceHeader}>
                <Typography
                  variant="h4"
                  weight="bold"
                  theme="black"
                  className={styles.choiceTitle}
                >
                  Je suis un livreur
                </Typography>
              </div>

              <div
                className={styles.choiceImage}
                style={driverImageStyle}
              />

              <div className={styles.driverActions}>
                <Button
                  variant="filled"
                  size="md"
                  href="/driver/register"
                  fullWidth
                >
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
