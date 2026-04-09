import { motion } from "framer-motion";
import { StarIcon } from "lucide-react";
import { inView } from "./constants";

const testimonials = [
  {
    quote: "TalentIQ cut our hiring cycle from 6 weeks to 11 days. The AI scorecards remove bias and get the whole team aligned in minutes.",
    author: "Sarah Jenkins",
    role: "VP of Engineering · Series B Fintech",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "As a candidate, the experience was flawless. The Monaco editor felt exactly like VS Code — zero friction, pure problem-solving.",
    author: "David Chen",
    role: "Senior Full Stack Engineer · Hired via TalentIQ",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "We reduced time-to-hire by 40% in our first month. Replaying sessions and reviewing code evolution has transformed how we evaluate talent.",
    author: "Elena Rodriguez",
    role: "Technical Recruiter · 200+ hires completed",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div {...inView} className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-6">Loved by engineers</h2>
          <p className="text-xl text-gray-600">Don't just take our word for it.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              {...inView}
              transition={{ delay: i * 0.15 }}
              className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex gap-1 mb-6">
                {Array(5).fill(0).map((_, j) => <StarIcon key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.img} alt={t.author} className="w-12 h-12 rounded-full ring-2 ring-gray-100" />
                <div>
                  <h4 className="font-bold text-gray-900">{t.author}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
