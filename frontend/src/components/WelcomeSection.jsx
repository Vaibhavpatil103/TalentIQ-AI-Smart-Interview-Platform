import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

function WelcomeSection({ onCreateSession, onJoinSession }) {
  const { user } = useUser();
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = user?.firstName || "there";

  return (
    <section className="bg-[#0d1117] py-12 px-6 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="text-3xl font-bold text-[#e6edf3]"
      >
        Good {timeOfDay}, {firstName}
      </motion.h1>
      
      <p className="text-[#7d8590] mt-2 text-base">
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
          className="btn-green"
        >
          Start Interview
        </motion.button>
        <motion.button
          onClick={onJoinSession}
          whileTap={{ scale: 0.97 }}
          className="btn-outline-dark px-4 py-2.5 rounded-lg font-medium"
        >
          Join Session
        </motion.button>
      </motion.div>
    </section>
  );
}

export default WelcomeSection;
