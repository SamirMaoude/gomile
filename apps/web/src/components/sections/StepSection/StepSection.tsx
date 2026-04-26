
import BackGround from "@/components/ui/design-system/background/background";
import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";
import Image from "next/image";
import { Package, Maximize, MapPinCheckInside, CircleCheckBig, Search, Store, Bike } from "lucide-react";
import Card from "@/components/ui/design-system/cards/card";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import clsx from "clsx";
import Link from "next/link";


export default function StepSection(){
    const stepsStyle = "flex items-start gap-5"
    const stepStyle = "flex-col"
    return (
        
            <Container Component="section" size='full' className="section-container" bg_theme="hero">
                <Title_ST title="Comment ça marche?" sub_title="Découvrez comment notre service de livraison rapide et fiable fonctionne en quelques étapes simples."></Title_ST>
                <section className="flex w-full gap-10 items-center">
                    <div className={clsx("flex-col", "w-full gap-10")}>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Package size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Inscription</Typography>
                                <Typography variant="h5" theme='grey' weight="light">Que vous soyez livreur ou commerçant, commencez par 
                                    <Link href="/pageprincipale" className="link"> vous inscrire </Link>
                                        et créer votre compte pour accéder à notre plateforme de livraison.
                                </Typography>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Search size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 2</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Vérification</Typography>
                                <Typography variant="h5" theme='grey' weight="light">
                                    Notre équipe d'experts se chargera d'examiner votre demande et de vérifier les informations 
                                    fournies pour garantir la sécurité et la fiabilité de notre service.
                                </Typography>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className={stepsStyle}>
                                <Card iconFull={true} icon={<Store size={40}/>} iconTheme="blue" size='sm'></Card>
                                <div className={stepStyle}>
                                    <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 3 (commerçants)</Typography>
                                    <Typography variant='h4' weight="semibold" Component='h4'>Création</Typography>
                                    <Typography variant="h5" theme='grey' weight="light">
                                        Créez votre boutique et recevez votre clé API pour rejoindre notre a
                                        réseau de commerçants et bénéficier de notre service de livraison rapide et fiable pour vos clients.
                                    </Typography>
                                </div>
                            </div>
                            {/* {<div className="border-l border-primary-blue" />} */}
                            <div className={stepsStyle}>
                                <Card iconFull={true} icon={<Bike size={40}/>} iconTheme="blue" size='sm'></Card>
                                <div className={stepStyle}>
                                    <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 3 (livreurs)</Typography>
                                    <Typography variant='h4' weight="semibold" Component='h4'>Téléchargement</Typography>
                                    <Typography variant="h5" theme='grey' weight="light">Téléchargez notre appliction dédiée aux livreurs faite pour vous
                                        faciliter la gestion de vos livraisons, suivre vos commandes en temps réel et optimiser votre itinéraire
                                         pour une expérience de livraison fluide et efficace.
                                    </Typography>
                                </div>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<MapPinCheckInside size={40}/>} iconTheme="blue" size='sm'></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='primaryB' weight='semibold' Component="h3" >Étape 4</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>C'est parti !</Typography>
                                <Typography variant="h5" theme='grey' weight="light">
                                    Maintenant il n'y a plus qu'à en profiter pour livrer un maximum de colis
                                </Typography>
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