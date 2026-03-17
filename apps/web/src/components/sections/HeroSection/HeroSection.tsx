
import BackGround from "@/components/ui/design-system/background/background";
import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import Image from "next/image";
import Badge from "@/components/ui/design-system/cards/badge";
import { Package } from 'lucide-react';
import Link from "next/link";


export default function HeroSection(){
    const statsStyle = "flex gap-30  items-center"
    const statStyle = "flex flex-col justify-between"
    return (
        
            <Container Component="section" size='full' className="hero-container" bg_theme="hero">
                    <div className="flex flex-col justify-center gap-5 flex-1 ">
                        <Badge label="Livraison rapide et fiable" icon={<Package size={18} />} variant="green" className="w-max"></Badge>
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
                            <Link href="/pageprincipale">
                                <Button size='md'>Rejoindre notre communauté</Button>
                            </Link>
                            <Link href="/enSavoirPlus">
                            <Button theme="blue" size="md" className="">Nous connaître</Button>
                            </Link>
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