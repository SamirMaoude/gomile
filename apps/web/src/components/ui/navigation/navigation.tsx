import clsx from "clsx"
import Typography from "../design-system/typography"
import Container from "../elements/container"
import { Logo } from "@/components/Logo/Logo"
import Link from "next/link"

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
  theme = "header",
}: Props) => {
    const style1 = "hover:text-primary-green-dark transition-colors duration-200"
  return (
    <Container
      Component="div"
      size="full"
      className={clsx(
        "w-full px-6 py-4",
        headerThemeClasses[theme]
      )}
    >
      <div className="flex items-center justify-evenly">
        <div>
          <Logo size="sm" />
        </div>

        <div className={clsx("flex items-center gap-10", textThemeClasses[text_theme])}>
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
        
        <div className={clsx("flex items-center gap-10", textThemeClasses[text_theme])}>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/pageprincipale">S'inscrire</a>
          </Typography>
          <Typography theme={text_theme} weight="medium" variant="h6" className={style1}>
            <a href="/pageprincipale">Se connecter</a>
          </Typography>
        </div>
      </div>
    </Container>
  )
}