import Accordion from "@/components/ui/design-system/Accordion/accordion";

const faqItems = [
  {
    question: "Comment fonctionne ExpressLivraison ?",
    answer:
      "ExpressLivraison est un service de livraison rapide et écologique. Vous passez commande via notre application ou notre site web, un livreur est immédiatement assigné à votre demande, et votre colis est livré en moins de 2 heures dans la plupart des cas.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Nos délais de livraison varient selon votre zone géographique. En zone urbaine, nous garantissons une livraison en moins de 2 heures. En zone périurbaine, comptez entre 2 et 4 heures.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Vous pouvez suivre votre commande en temps réel depuis votre espace client sur notre application ou notre site web. Vous recevrez également des notifications SMS à chaque étape de la livraison.",
  },
];

export default function AccordionTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">FAQ</h1>
        <Accordion items={faqItems} />
      </div>
    </main>
  );
}