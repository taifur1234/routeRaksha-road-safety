import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";
import HomeHero from "../components/home/HomeHero";
import HowItWorks from "../components/home/HowItWorks";
import SafetyPreview from "../components/home/SafetyPreview";
import ValueSection from "../components/home/ValueSection";

function MainPage() {
  return (
    <main className="motion-page rr-shell min-h-screen text-slate-950">
      <HomeHero />
      <ValueSection />
      <HowItWorks />
      <SafetyPreview />
      <CTASection />
      <Footer />
    </main>
  );
}

export default MainPage;







