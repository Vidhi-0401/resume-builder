import HeroHome from "../components/hero-home";
import Features from "../components/features";
import Cta from "../components/cta";
import Testimonials from "../components/testimonials";
import Workflows from "../components/workflows";
import ResumeForm from "../components/resumeForm";
import Spotlight from "../components/spotlight";
import { ResumeProvider } from "@/context/Resumecontext";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Logo from "@/components/ui/logo";
import PageIllustration from "@/components/page-illustration";

export default function HomePage() {
  return (
    <main>
      {/* <Logo/>

      <Header/> */}
      <PageIllustration/>
      {/* Hero Section */}
      <HeroHome />

      {/* Features Section */}
      <Workflows />

      {/* Workflows Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Spotlight Section */}
      <Spotlight children={undefined} />

      {/* CTA Section */}
      <Cta />

      {/* Resume Form Section wrapped with ResumeProvider */}
      {/* <ResumeProvider>
        <ResumeForm />
      </ResumeProvider> */}

      <Footer/>
    </main>
  );
}
