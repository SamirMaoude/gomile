'use client'

import Button from "@/components/ui/design-system/button/button";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import Image from "next/image";
import Badge from "@/components/ui/design-system/cards/badge";
import { Package } from 'lucide-react';
import Link from "next/link";

export default function HeroSection(){
    return (
            <Container Component="section" size='full' className="hero-container" bg_theme="hero" padding={false}>
                <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.85fr)]">
                    <div className="flex max-w-2xl flex-col justify-center gap-6 lg:gap-8">
                        <Badge label="Livraison rapide et fiable" icon={<Package size={18} />} variant="green" className="w-max"></Badge>
                        <Typography variant="h1" weight="bold" theme="black" Component="h1" className="max-w-xl">
                                Votre solution pour {" "}
                                <Typography variant="h1" weight="bold" theme='primary' Component="span">
                                    livrer vos colis sereinement
                                </Typography>
                            </Typography>
                            
                        {/* <Typography variant='p' weight='light' theme='grey' Component='p'>
                            blablabla
                        </Typography> */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link href="/auth">
                                <Button size='md'>Rejoindre notre communauté</Button>
                            </Link>
                            <Link href="/enSavoirPlus">
                                <Button variant="outline" size="md">Nous connaître</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative hidden w-full max-w-[24rem] justify-self-center overflow-hidden rounded-[2rem] md:block md:aspect-[4/5] lg:max-w-[28rem] lg:justify-self-end">
                        <Image
                            src="/images/livreur.png"
                            alt="Livreur à vélo"
                            fill
                            sizes="(min-width: 1024px) 28rem, 24rem"
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>
            </Container>
    )
}
