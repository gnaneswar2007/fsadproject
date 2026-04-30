import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Impact } from "@/components/Impact";
import { Navbar } from "@/components/Navbar";
import { RoleSection } from "@/components/RoleSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Impact />
      <RoleSection />
      <Footer />
    </div>
  );
};

export default Index;
