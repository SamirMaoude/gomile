
import BackGround from "@/components/ui/design-system/background/background";
import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import Image from "next/image";

export default function HeroSection(){
    const statsStyle = "flex gap-30  items-center"
    const statStyle = "flex flex-col justify-between"
    return (
        
            <Container Component="section" size='full' className="flex justify-center items-center min-h-screen gap-10" bg_theme="hero">
                    <div className="flex flex-col justify-center gap-5 flex-1 ">
                            <Typography variant="h1" weight="bold" theme="black" Component="h1">
                                Votre solution pour {" "}
                                <Typography variant="h1" weight="bold" theme='primaryG' Component="span">
                                    livrer vos colis sereinement
                                </Typography>
                            </Typography>
                            
                        <Typography variant='p' weight='light' theme='grey' Component='p'>
                            blablabla
                        </Typography>
                        <div className="flex gap-2">
                            <Button size='sm'>Rejoindre notre communauté</Button>
                            <Button theme="blue" size="md" className="">En savoir plus</Button>
                        </div>
                    
                        <div className={statsStyle}>
                            <div className={statStyle}>
                                <Typography variant='h5' weight='bold' theme='primaryG' Component="span">
                                    stats
                                </Typography>
                                <Typography variant='p' weight='light' theme="grey" Component="p">
                                    texte
                                </Typography>
                            </div>
                            <div className={statStyle}>
                                <Typography variant='h5' weight='bold' theme='primaryG' Component="span">
                                    stats
                                </Typography>
                                <Typography variant='p' weight='light' theme="grey" Component="p">
                                    texte
                                </Typography>
                            </div>
                            <div className={statStyle}>
                                <Typography variant='h5' weight='bold' theme='primaryG' Component="span">
                                    stats
                                </Typography>
                                <Typography variant='p' weight='light' theme="grey" Component="p">
                                    texte
                                </Typography>
                            </div>
                        </div>

                    </div>
                    <div className="relative h-170 w-170 rounded-3xl overflow-hidden">
                        <Image
                            src="/images/Livreur.png"
                            alt="Livreur à vélo"
                            fill
                            className="object-cover"
                        />
                    </div>
        
            </Container>
        
        
    )
}