import { motion } from "framer-motion";
import { Counter } from "./constants";

const stats = [
  { num: 10, suffix: "k+", label: "Engineers Trust Us" },
  { num: 500, suffix: "+", label: "Companies Hiring Smarter" },
  { num: 50, suffix: "k+", label: "Interviews Completed" },
  { num: 99, suffix: ".9%", label: "Uptime SLA" },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-2">
                <Counter to={stat.num} />
                {stat.suffix}
              </div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
