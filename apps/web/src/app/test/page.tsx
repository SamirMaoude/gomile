import Accordion from "@/components/ui/design-system/Accordion/accordion";
import Tarifs from "@/components/ui/design-system/cards/tarifs";
import { Zap } from "lucide-react";

type Plan = "Occasionnel" | "Premium" | "Entreprise";
type Features = {
  plan: Plan;
  features: string[];
} 

const featuresData: Features[] = [
  {
    plan: "Occasionnel",
    features: [
      "Paiement a la livraison",
      "Tracking GPS en temps reel",
      "Support 7j/7",
      "Livraison standard (30-120 min)",
      "Assurance jusqu'a 100EUR"
    ],
  },
  {
    plan: "Premium",
    features: [
      "Paiement a la livraison",
      "Tracking GPS en temps reel",
      "Support 7j/7",
      "Livraison express (15-60 min)",
      "Assurance jusqu'a 500EUR"
    ],
  }]

function IconFeature({plan}: {feature: Features, plan: Plan}) {
  if (plan === "Occasionnel") {
    return <Zap size={22} className="text-gray-500" />
  } else if (plan === "Premium") {
    return <Zap size={22} className="text-green-500" />
  } else {
    return null;
  }
}

export default function AccordionTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">FAQ</h1>
        <Tarifs width="fit" height="fit" title="Occasionnel"
         description="Parfait pour une utilisation ponctuelle" 
         price="0EUR" 
         icon={<Zap size={22}/>} iconTheme="gray" 
         features={["Paiement a la livraison", "Tracking GPS en temps reel","Support 7j/7","Livraison standard (30-120 min)","Assurance jusqu'a 100EUR"]} />
      </div>
    </main>
  );
}