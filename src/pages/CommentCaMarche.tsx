import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { ArrowRight, Package, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Package,
    title: "1. Proposez vos objets",
    description: "Prenez une photo de l'objet que vous souhaitez échanger, ajoutez une description et publiez votre annonce en quelques clics.",
  },
  {
    icon: Users,
    title: "2. Trouvez un échange",
    description: "Parcourez les annonces et trouvez l'objet qui vous intéresse. Contactez le propriétaire pour proposer un échange.",
  },
  {
    icon: Repeat,
    title: "3. Échangez en toute simplicité",
    description: "Convenez d'un lieu de rencontre et procédez à l'échange. C'est simple, gratuit et écologique !",
  },
];

const CommentCaMarche = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Comment échanger des objets sur Relio",
    "description": "Guide étape par étape pour échanger vos objets sur Relio",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Proposez vos objets",
        "text": "Prenez une photo de l'objet que vous souhaitez échanger, ajoutez une description et publiez votre annonce",
      },
      {
        "@type": "HowToStep",
        "name": "Trouvez un échange",
        "text": "Parcourez les annonces et trouvez l'objet qui vous intéresse. Contactez le propriétaire pour proposer un échange",
      },
      {
        "@type": "HowToStep",
        "name": "Échangez en toute simplicité",
        "text": "Convenez d'un lieu de rencontre et procédez à l'échange",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Comment ça marche - Guide complet"
        description="Découvrez comment échanger vos objets facilement en 3 étapes simples. Troc gratuit, solidaire et écologique."
        schema={schema}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Comment ça marche ?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Échanger vos objets n'a jamais été aussi simple. Suivez ces 3 étapes pour commencer.
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-center">Pourquoi échanger sur Relio ?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">🌱 Écologique</h3>
                <p className="text-muted-foreground">
                  Donnez une seconde vie à vos objets et réduisez les déchets.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">💰 Économique</h3>
                <p className="text-muted-foreground">
                  Échangez gratuitement sans dépenser d'argent.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">🤝 Solidaire</h3>
                <p className="text-muted-foreground">
                  Créez du lien avec votre communauté locale.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">⚡ Simple</h3>
                <p className="text-muted-foreground">
                  Une plateforme intuitive pour échanger en quelques clics.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Prêt à commencer ?</h2>
            <Link to="/">
              <Button size="lg" className="gap-2">
                Découvrir les objets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommentCaMarche;
