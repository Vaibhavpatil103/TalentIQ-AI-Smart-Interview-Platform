import { motion } from "framer-motion";
import { CheckCircle2Icon } from "lucide-react";

export default function TrustedBySection() {
  return (
    <section className="py-10 border-y border-gray-100 bg-gray-50/50 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

      <div className="max-w-[1400px] mx-auto px-6">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Trusted by 500+ engineering teams worldwide
        </p>
        <div className="flex justify-center gap-10 md:gap-16 items-center flex-wrap opacity-50 hover:opacity-80 transition-all duration-700">
          {[
            { name: "Google", font: "'Product Sans', sans-serif", weight: 500, size: 22, tracking: "-0.02em" },
            { name: "Stripe", font: "'Inter', sans-serif", weight: 700, size: 22, tracking: "-0.03em" },
            { name: "Vercel", font: "'Inter', sans-serif", weight: 800, size: 20, tracking: "-0.04em" },
            { name: "Linear", font: "'Inter', sans-serif", weight: 600, size: 20, tracking: "-0.02em" },
            { name: "Netflix", font: "'Inter', sans-serif", weight: 900, size: 22, tracking: "0.01em" },
            { name: "Spotify", font: "'Inter', sans-serif", weight: 700, size: 20, tracking: "-0.01em" },
          ].map((company, i) => (
            <motion.span
              key={company.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ fontFamily: company.font, fontWeight: company.weight, fontSize: company.size, letterSpacing: company.tracking }}
              className="text-gray-800 select-none"
            >
              {company.name}
            </motion.span>
          ))}
        </div>
        {/* Trust badges */}
        <div className="flex justify-center gap-8 mt-8 flex-wrap">
          {["4.9★ on G2", "SOC 2 Certified", "99.9% Uptime"].map((badge) => (
            <span key={badge} className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <CheckCircle2Icon className="w-3.5 h-3.5 text-green-500" /> {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
