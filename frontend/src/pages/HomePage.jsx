import { useNavigate } from "react-router";
import TalentIQLogo from "../components/TalentIQLogo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { C, NavBtn } from "../components/home/constants";

// ─── Section components (split from original 919-line monolith) ──
import HeroSection from "../components/home/HeroSection";
import TrustedBySection from "../components/home/TrustedBySection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import FeaturesSection from "../components/home/FeaturesSection";
import ShowcaseSection from "../components/home/ShowcaseSection";
import StatsSection from "../components/home/StatsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FooterSection from "../components/home/FooterSection";

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT — ~80 LOC (down from 919)
══════════════════════════════════════════════════════════════ */
function HomePage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  /* ── Scroll-triggered navbar prominence ── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{ backgroundColor: C.pageBg, fontFamily: "'Inter', sans-serif" }}
      className="antialiased selection:bg-blue-100 selection:text-blue-900 overflow-hidden"
    >
      {/* ── 1. NAVBAR (Glassmorphism) ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{
          y: 0,
          backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.70)",
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 backdrop-blur-xl saturate-150"
        style={{
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.07)" : "none",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <TalentIQLogo size={36} variant="light" />
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/role-select")}
              className="hidden sm:block text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-2"
            >
              Sign in
            </button>
            <NavBtn onClick={() => navigate("/role-select")} filled icon={<ArrowRightIcon className="w-4 h-4" />}>
              Get Started Free
            </NavBtn>
          </div>
        </div>
      </motion.nav>

      {/* ── Sections ── */}
      <HeroSection navigate={navigate} scrolled={scrolled} />
      <TrustedBySection />
      <HowItWorksSection />
      <FeaturesSection />
      <ShowcaseSection />
      <StatsSection />
      <TestimonialsSection />
      <FooterSection navigate={navigate} />
    </div>
  );
}

export default HomePage;