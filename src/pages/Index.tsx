import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ItemGrid from "@/components/ItemGrid";
import SEO from "@/components/SEO";
import OnboardingTutorial from "@/components/OnboardingTutorial";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Relio",
    "description": "Plateforme d'échange d'objets entre particuliers. Troc solidaire et écologique.",
    "url": "https://relio.app",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO schema={schema} />
      <OnboardingTutorial />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Hero onSearch={setSearchQuery} />
        <ItemGrid searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Index;
