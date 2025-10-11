import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ItemGrid from "@/components/ItemGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ItemGrid />
      </main>
    </div>
  );
};

export default Index;
