import CampusAndRoles from "@/components/home/CampusAndRoles";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import Navbar from "@/components/home/Navbar";
import PremiumServices from "@/components/home/PremiumServices";
import Testimonials from "@/components/home/Testimonials";
import TopCompanies from "@/components/home/TopCompanies";
import { ReferralBanner } from "@/components/student/Referral/ReferralBanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ReferralBanner />
      </div>
      <TopCompanies />
      <CampusAndRoles />
      <Testimonials />
      <PremiumServices />
      <Footer />
    </main>
  );
}
