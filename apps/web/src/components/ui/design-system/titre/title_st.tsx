
import Typography from "@/components/ui/design-system/typography";

interface Title_STProps {
    title: string;
    sub_title?: string;
}

export default function Title_ST({title, sub_title}: Title_STProps) {
    return (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <Typography variant='h1' weight='bold' theme="black" Component="h1">{title}</Typography>
            {sub_title ? (
                <Typography variant='h6' weight='light' theme='grey' Component="p" className="max-w-2xl">
                    {sub_title}
                </Typography>
            ) : null}
        </div>
    )
}
