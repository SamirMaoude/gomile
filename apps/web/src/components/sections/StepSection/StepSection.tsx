import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import Image from "next/image";
import { Package, MapPinCheckInside, Search, Store, Bike } from "lucide-react";
import Card from "@/components/ui/design-system/cards/card";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import clsx from "clsx";
import Link from "next/link";


export default function StepSection(){
    const stepsStyle = "flex items-start gap-4 sm:gap-5"
    const stepStyle = "flex flex-col gap-2"
    return (
            <Container Component="section" size='full' className="section-container" bg_theme="hero" padding={false}>
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
                    <Title_ST title="Comment ça marche?" sub_title="Découvrez comment notre service de livraison rapide et fiable fonctionne en quelques étapes simples."></Title_ST>
                    <section className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:gap-12">
                    <div className={clsx("flex w-full flex-col gap-8")}>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Package size={40}/>} iconTheme="blue" size='sm' className="shrink-0"></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='secondary' weight='semibold' Component="h3" >Étape 1</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Inscription</Typography>
                                <Typography variant="h5" theme='grey' weight="light">Que vous soyez livreur ou commerçant, commencez par 
                                    <Link href="/auth" className="link"> vous inscrire </Link>
                                        et créer votre compte pour accéder à notre plateforme de livraison.
                                </Typography>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<Search size={40}/>} iconTheme="blue" size='sm' className="shrink-0"></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='secondary' weight='semibold' Component="h3" >Étape 2</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>Vérification</Typography>
                                <Typography variant="h5" theme='grey' weight="light">
                                    Notre équipe d&apos;experts se chargera d&apos;examiner votre demande et de vérifier les informations 
                                    fournies pour garantir la sécurité et la fiabilité de notre service.
                                </Typography>
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className={stepsStyle}>
                                <Card iconFull={true} icon={<Store size={40}/>} iconTheme="blue" size='sm' className="shrink-0"></Card>
                                <div className={stepStyle}>
                                    <Typography variant='span' theme='secondary' weight='semibold' Component="h3" >Étape 3 (commerçants)</Typography>
                                    <Typography variant='h4' weight="semibold" Component='h4'>Création</Typography>
                                    <Typography variant="h5" theme='grey' weight="light">
                                        Créez votre boutique et recevez votre clé API pour rejoindre notre
                                        réseau de commerçants et bénéficier de notre service de livraison rapide et fiable pour vos clients.
                                    </Typography>
                                </div>
                            </div>
                            {/* {<div className="border-l border-primary-blue" />} */}
                            <div className={stepsStyle}>
                                <Card iconFull={true} icon={<Bike size={40}/>} iconTheme="blue" size='sm' className="shrink-0"></Card>
                                <div className={stepStyle}>
                                    <Typography variant='span' theme='secondary' weight='semibold' Component="h3" >Étape 3 (livreurs)</Typography>
                                    <Typography variant='h4' weight="semibold" Component='h4'>Téléchargement</Typography>
                                    <Typography variant="h5" theme='grey' weight="light">Téléchargez notre application dédiée aux livreurs faite pour vous
                                        faciliter la gestion de vos livraisons, suivre vos commandes en temps réel et optimiser votre itinéraire
                                         pour une expérience de livraison fluide et efficace.
                                    </Typography>
                                </div>
                            </div>
                        </div>
                        <div className={stepsStyle}>
                            <Card iconFull={true} icon={<MapPinCheckInside size={40}/>} iconTheme="blue" size='sm' className="shrink-0"></Card>
                            <div className={stepStyle}>
                                <Typography variant='span' theme='secondary' weight='semibold' Component="h3" >Étape 4</Typography>
                                <Typography variant='h4' weight="semibold" Component='h4'>C&apos;est parti !</Typography>
                                <Typography variant="h5" theme='grey' weight="light">
                                    Maintenant il n&apos;y a plus qu&apos;à en profiter pour livrer un maximum de colis
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden w-full max-w-sm justify-self-end overflow-hidden rounded-[2rem] lg:block lg:aspect-[4/5]">
                        <Image
                            src="/images/livreur.png"
                            alt="Livreur à vélo"
                            fill
                            sizes="24rem"
                            className="object-contain"
                        />
                    </div>
                    </section>
                </div>
            </Container>
    )
}
