import CampusAndRoles from "@/components/home/CampusAndRoles";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import InterviewPrep from "@/components/home/InterviewPrep";
import Navbar from "@/components/home/Navbar";
import PremiumServices from "@/components/home/PremiumServices";
import SponsoredCompanies from "@/components/home/SponsoredCompanies";
import TopCompanies from "@/components/home/TopCompanies";
import UpcomingEvents from "@/components/home/UpcomingEvents";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <TopCompanies />
      <CampusAndRoles />
      <SponsoredCompanies />
      <UpcomingEvents />
      <InterviewPrep />
      <PremiumServices />
      <Footer />
    </main>
  );
}
