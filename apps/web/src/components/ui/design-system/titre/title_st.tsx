
import Typography from "@/components/ui/design-system/typography";
import Container from "../../elements/container";

interface Title_STProps {
    title: string;
    sub_title?: string;
}

export default function Title_ST({title, sub_title}: Title_STProps) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Typography variant='h1' weight='bold' theme="black" Component="h1">{title}</Typography>
            <Typography variant='h6' weight='light' theme='grey' Component="p">{sub_title}</Typography>
        </div>
    )
}