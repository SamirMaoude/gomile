import Avatar from "@/components/ui/design-system/avatar";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";

export default function TeamSection() {
    const style1 = "flex-col gap-5"
    return (
        <Container Component="section" size='full' className="section-container" bg_theme="white">
            <Title_ST title="Rencontrez notre équipe" sub_title="Découvrez les visages derrière notre service de livraison rapide et fiable."/>
            <div className="grid-3-cols gap-10">
                <div className="team-member">
                    <Avatar name="Alpha Ousmane Diakité" size="lg" />
                    <Typography variant="h5" weight="bold" theme="black" Component="h3">Alpha Ousmane Diakité</Typography>
                    <Typography variant="p" weight="light" theme="grey" Component="p">rôle</Typography>
                </div>
                <div className="team-member">
                    <Avatar name="Oudrhiri Idrissi Safwane" size="lg" />
                    <Typography variant="h5" weight="bold" theme="black" Component="h3">Oudrhiri Idrissi Safwane</Typography>
                    <Typography variant="p" weight="light" theme="grey" Component="p">rôle</Typography>
                </div>
                <div className="team-member">
                    <Avatar name="Jouini Youssef" size="lg" />
                    <Typography variant="h5" weight="bold" theme="black" Component="h3">Jouini Youssef</Typography>
                    <Typography variant="p" weight="light" theme="grey" Component="p">rôle</Typography>
                </div>
                <div className="team-member">
                    <Avatar name="Maoude Samir" size="lg" />
                    <Typography variant="h5" weight="bold" theme="black" Component="h3">Maoude Samir</Typography>
                    <Typography variant="p" weight="light" theme="grey" Component="p">rôle</Typography>
                </div>
                <div className="team-member">
                    <Avatar name="Duong Dang" size="lg" />
                    <Typography variant="h5" weight="bold" theme="black" Component="h3">Duong Dang Khoa Dang</Typography>
                    <Typography variant="p" weight="light" theme="grey" Component="p">rôle</Typography>
                </div>
            </div>
        </Container>
    )
}