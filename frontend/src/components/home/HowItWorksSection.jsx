import { motion } from "framer-motion";
import { BriefcaseIcon, Code2Icon, CheckCircle2Icon } from "lucide-react";
import { C, inView } from "./constants";

const steps = [
  {
    icon: <BriefcaseIcon className="w-8 h-8 text-blue-600" />,
    title: "1. Create a Role",
    desc: "Set up the job description, required skills, and let our AI generate the perfect technical questions.",
  },
  {
    icon: <Code2Icon className="w-8 h-8 text-blue-600" />,
    title: "2. Live Collaboration",
    desc: "Conduct the interview in our built-in IDE with video chat, syntax highlighting, and live execution.",
  },
  {
    icon: <CheckCircle2Icon className="w-8 h-8 text-blue-600" />,
    title: "3. AI Scorecards",
    desc: "Get an instant, unbiased technical evaluation immediately after the session ends.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 bg-white relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div {...inView} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
            A smarter way to interview
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Skip the whiteboard. Write real code in a real environment with AI-powered feedback.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-500 to-blue-100 opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl group hover:bg-gray-50 transition-colors"
              style={{ border: "1px solid transparent" }}
              whileHover={{ borderColor: C.border }}
            >
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                {step.icon}
                <div className="absolute inset-0 rounded-full border border-blue-200 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
