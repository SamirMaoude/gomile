import { Check } from "lucide-react"
import Typography from "../typography"
import Card from "./card"
import Button from "../button/button"


interface Props {
    title: string
    description: string
    price: string
    features: string[]
    icon: React.ReactNode,
    iconTheme?: "gray" | "linear"
    width?: "sm" | "md" | "lg" | "xl" | "fit"
    height?: "sm" | "md" | "lg" | "xl" | "fit"
}

export default function TarifsCard({
  title,
  description,
  price,
  features,
  icon,
  iconTheme = "gray",
  width = "fit",
  height = "fit",
}: Props) {
  return (
    <Card
      icon={icon}
      title={title}
      description={description}
      size="lg"
      iconTheme={iconTheme}
      width={width}
      height={height}
    >
      <div className="mb-4 flex flex-col items-start gap-3">
        <Typography Component="span" variant="h4" weight="bold" theme="black">{price}</Typography>
        <Button href="#" size="sm">Choisir</Button>
      </div>
      <ul className="space-y-1">
        {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
            <div className="bg-primary-green-light rounded-full p-1 mt-1">
                <Check size={14} className="text-primary-green"/>
            </div>
            <Typography Component="span" variant="p" weight="light" theme="primaryG">{feature}</Typography>
        </li>
        ))}
      </ul>
    </Card>
  )
}
