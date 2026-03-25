import { TrophyIcon, UsersIcon, SparklesIcon } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 60, damping: 12 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  return <span>{displayValue}</span>;
}

function StatsCards({ activeSessionsCount, recentSessionsCount, aiPracticeCount = 0 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  const cards = [
    {
      label: "Active Sessions",
      value: activeSessionsCount || 0,
      icon: <UsersIcon className="size-5 text-current" />
    },
    {
      label: "Completed",
      value: recentSessionsCount || 0,
      icon: <TrophyIcon className="size-5 text-current" />
    },
    {
      label: "AI Practice",
      value: aiPracticeCount,
      icon: <SparklesIcon className="size-5 text-current" />
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="card-dark p-6 relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 text-[#30363d]">
            {card.icon}
          </div>
          <div className="text-4xl font-black text-[#2cbe4e]">
            <AnimatedNumber value={card.value} />
          </div>
          <div className="text-sm text-[#7d8590] mt-1">
            {card.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StatsCards;
