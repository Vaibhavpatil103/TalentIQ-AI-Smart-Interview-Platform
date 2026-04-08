import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

function WelcomeSection({ onCreateSession, onJoinSession }) {
  const { user } = useUser();
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = user?.firstName || "there";

  return (
    <section className="bg-gradient-to-r from-[#0a66c2] to-[#004182] py-12 px-6 max-w-7xl mx-auto rounded-2xl mt-6 shadow-xl">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="text-3xl font-bold text-white"
      >
        Good {timeOfDay}, {firstName}
      </motion.h1>
      
      <p className="text-blue-100/80 mt-2 text-base">
        Ready for your next interview?
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
        className="flex gap-3 mt-8"
      >
        <motion.button
          onClick={onCreateSession}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-[#0a66c2] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-md"
        >
          Start Interview
        </motion.button>
        <motion.button
          onClick={onJoinSession}
          whileTap={{ scale: 0.97 }}
          className="border border-white/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
        >
          Join Session
        </motion.button>
      </motion.div>
    </section>
  );
}

export default WelcomeSection;
