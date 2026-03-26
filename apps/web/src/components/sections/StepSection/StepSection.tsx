
import BackGround from "@/components/ui/design-system/background/background";
import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import Image from "next/image";
import { Package, Maximize, MapPinCheckInside, CircleCheckBig } from "lucide-react";
import Card from "@/components/ui/design-system/cards/card";
import Title_ST from "@/components/ui/design-system/titre/title_st";


export default function StepSection(){
    const stepsStyle = "flex gap-5"
    const stepStyle = "flex flex-col"
    return (
        
            <Container Component="section" size='full' className="flex flex-col items-center min-h-screen gap-20 px-6 sm:px-8 lg:px-10" bg_theme="hero">
                <Title_ST title="Comment ça marche?" sub_title="Découvrez comment notre service de livraison rapide et fiable fonctionne en quelques étapes simples."></Title_ST>
                <section className="flex w-full gap-10 items-center">
                    <div className="flex flex-col w-full gap-10">
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Package size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Titre</Typography>
                                <Typography theme='grey' weight="light">Description</Typography>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Maximize size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Titre</Typography>
                                <Typography theme='grey' weight="light">Description</Typography>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<MapPinCheckInside size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Titre</Typography>
                                <Typography theme='grey' weight="light">Description</Typography>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<CircleCheckBig size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Titre</Typography>
                                <Typography theme='grey' weight="light">Description</Typography>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-100 w-full rounded-3xl overflow-hidden">
                        <Image
                            src="/images/Livreur.png"
                            alt="Livreur à vélo"
                            fill
                            className="object-cover"
                        />
                    </div>
                </section>
        
            </Container>
        
        
    )
}