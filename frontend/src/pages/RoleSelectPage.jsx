import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Building2Icon, TerminalIcon, ArrowRightIcon } from "lucide-react";
import TalentIQLogo from "../components/TalentIQLogo";

function RoleSelectPage() {
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("talentiq_selected_role", role);
    openSignIn();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row relative">
      {/* Absolute Header Logo */}
      <div className="absolute top-0 left-0 p-6 md:p-8 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
        >
          <TalentIQLogo size={40} variant="light" />
        </button>
      </div>

      {/* Left side: Business */}
      <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center p-8 pt-24 min-h-[50vh] md:min-h-screen group">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06)_0%,transparent_60%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center mb-8 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ease-out shadow-sm">
            <Building2Icon className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="text-left">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-4 block">For Companies</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              Hire the top 1% of engineers.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 font-medium">
              Transform your hiring process with AI-driven technical interviews. Evaluate candidates faster, fairer, and with crystal clarity.
            </p>
            
            <button
              onClick={() => handleRoleSelect("interviewer")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-gray-900 hover:bg-gray-800 px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-gray-900/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              Continue as Company <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right side: Candidate */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0c10] flex items-center justify-center p-8 pt-16 min-h-[50vh] md:min-h-screen group border-t md:border-t-0 md:border-l border-gray-800">
        {/* Deep dark decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-gray-900/80 backdrop-blur rounded-2xl shadow-2xl border border-gray-800 flex items-center justify-center mb-8 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
            <TerminalIcon className="w-8 h-8 text-emerald-400" />
          </div>
          
          <div className="text-left">
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">For Developers</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
              Ace your next interview.
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 font-medium">
              Practice real-world coding challenges in a world-class environment. Get detailed AI feedback and land your dream job.
            </p>
            
            <button
              onClick={() => handleRoleSelect("candidate")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-900 bg-emerald-400 hover:bg-emerald-300 px-8 py-4 rounded-xl text-base font-semibold shadow-[0_0_40px_rgba(52,211,153,0.15)] hover:shadow-[0_0_60px_rgba(52,211,153,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              Continue as Developer <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RoleSelectPage;
