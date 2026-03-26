import clsx from "clsx"

interface Props{
    text_theme?: "white" | "black" | "grey" | "primaryG" | "primaryB"
    theme?: "landingpage" | "header"
}
import landingpage from "@/app/landingpage/page";
import Typography from "../design-system/typography";
import Container from "../elements/container";
import {Logo} from "@/components/Logo/Logo";

const text_theme = {
    white: "text-white",
    black: "text-black",
    grey: "text-gray-500",
    primaryG: "text-primary-green",
    primaryB: "text-primary-blue",
}

const header_theme = {
    landingpage: "bg-linear-to-tl from-blue-500 to-green-500",
    header: "bg-primary-green"
}
export const Navigation = ({text_theme='black', theme='header'}: Props) => {
    return (
            <Container Component="header" className={clsx("fixed top-0 left-0 w-full flex items-center justify-between py-1.5 z-50 h-5 sm:h-10 lg:h-18", header_theme[theme])} size='full'> { /*à verifier*/}
                <div className = "px-10">
                    <Logo size="md"/>
                </div>
                <div>
                    <Typography className="flex items-center gap-4" theme = "white" weight = "medium" variant = "span">
                        <span>À PROPOS</span>
                        <span>CONTACT</span>
                    </Typography>
                </div>    
            </Container>
        )
    }