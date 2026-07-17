import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BlackFridayDeals from "@/components/BlackFridayDeals";
import StorySection from "@/components/StorySection";
import BestSellers from "@/components/BestSellers";
import CollectionsSection from "@/components/CollectionsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BrandsSection from "@/components/BrandsSection";
import FloatingElements from "@/components/FloatingElements";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BlackFridayDeals />
        <StorySection />
        <BestSellers />
        <CollectionsSection />
        <TestimonialsSection />
        <BrandsSection />
      </main>
      <FloatingElements />
    </>
  );
}
