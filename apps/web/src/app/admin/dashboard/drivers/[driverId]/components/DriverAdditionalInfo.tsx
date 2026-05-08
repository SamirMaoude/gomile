import Typography from "@/components/ui/design-system/typography";
import type { AdminDriverDetail } from "@/lib/api-admin";

import { formatDate } from "../../AdminFunctions";

type DriverAdditionalInfoProps = {
  driver: AdminDriverDetail;
};

export default function DriverAdditionalInfo({ driver }: DriverAdditionalInfoProps) {
  return (
    <article className="admin-driver-detail-panel">
      <Typography
        variant="h3"
        Component="h2"
        className="admin-driver-detail-panel-title"
      >
        Informations livreur
      </Typography>
      <dl className="admin-driver-detail-list">
        <div>
          <dt>Code GoMile</dt>
          <dd>{driver.gomileCode ?? "Non renseigne"}</dd>
        </div>
        <div>
          <dt>Inscription</dt>
          <dd>{formatDate(driver.createdAt)}</dd>
        </div>
        <div>
          <dt>Adresse</dt>
          <dd>{driver.address}</dd>
        </div>
        <div>
          <dt>Zone de livraison</dt>
          <dd>
            {driver.deliveryCity} ({driver.deliveryRadius} km)
          </dd>
        </div>
        <div>
          <dt>SIRET</dt>
          <dd>{driver.siret ?? "Non renseigne"}</dd>
        </div>
      </dl>
    </article>
  );
}
