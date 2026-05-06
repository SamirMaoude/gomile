import clsx from "clsx"
import Typography from "../design-system/typography"
import Container from "../elements/container"
import { Logo } from "@/components/Logo/Logo"

interface Props {
  text_theme?: "white" | "black" | "grey" | "primaryG" | "primaryB"
  theme?: "landingpage" | "header"
}

const textThemeClasses = {
  white: "text-white",
  black: "text-black",
  grey: "text-gray-500",
  primaryG: "text-primary-green",
  primaryB: "text-primary-blue",
}

const headerThemeClasses = {
  landingpage: "bg-linear-to-tl from-blue-500 to-green-500",
  header: "bg-primary-green",
}

export const Navigation = ({
  text_theme = "white",
  theme = "landingpage",
}: Props) => {
    const style1 = "hover:text-primary-green-dark transition-colors duration-200"
  return (
    <Container
      Component="div"
      size="full"
      padding={false}
      className={clsx(
        "w-full px-6 py-4 sm:px-8 lg:px-10",
        headerThemeClasses[theme]
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-around gap-6">
        <div>
          <Logo size="sm" />
        </div>

        <div className={clsx("hidden md:flex items-center gap-8 lg:gap-10", textThemeClasses[text_theme])}>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="#contact">Contact</a>
          </Typography>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/faq">FAQ</a>
          </Typography>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/enSavoirPlus">En savoir plus</a>
          </Typography>
        </div>

        <div className={clsx("hidden md:flex items-center gap-6 lg:gap-8", textThemeClasses[text_theme])}>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/auth">S&apos;inscrire</a>
          </Typography>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/merchant/login">Se connecter</a>
          </Typography>
        </div>
      </div>
    </Container>
  )
}
