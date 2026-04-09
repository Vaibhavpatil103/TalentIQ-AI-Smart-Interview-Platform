import { motion } from "framer-motion";
import { PlayCircleIcon, MousePointerIcon } from "lucide-react";
import { TalentIQIcon } from "../TalentIQLogo";
import { inView } from "./constants";

export default function ShowcaseSection() {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
        <motion.div {...inView}>
          <TalentIQIcon size={48} className="mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">
            See TalentIQ in action
          </h2>
        </motion.div>

        <motion.div
          {...inView}
          className="group relative rounded-3xl overflow-hidden border border-gray-800 bg-[#0a0c10] aspect-video max-w-4xl mx-auto cursor-pointer shadow-[0_0_100px_rgba(37,99,235,0.15)] flex flex-col"
        >
          {/* Fake Browser Header */}
          <div className="h-10 border-b border-gray-800 flex items-center px-4 gap-2 bg-[#111827]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="mx-auto bg-[#1f2937] text-[10px] text-gray-400 px-12 sm:px-24 py-1 rounded flex items-center gap-2 border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-gray-500" /> talentiq.dev/dashboard
            </div>
          </div>

          {/* Dashboard Mockup Content */}
          <div className="flex-1 flex p-4 sm:p-6 gap-6 relative">
            {/* Sidebar */}
            <div className="w-32 sm:w-48 space-y-4">
              <div className="h-6 w-24 bg-gray-800 rounded mb-8" />
              {[1, 2, 3, 4].map(i => <div key={i} className={`h-8 rounded-md ${i === 1 ? 'bg-blue-600/20 border border-blue-500/30 w-full' : 'bg-gray-800/50 w-3/4'}`} />)}
            </div>

            {/* Main Area */}
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-gray-800 rounded-md" />
                <motion.div
                  animate={{ scale: [1, 1.05, 1], backgroundColor: ["#1e3a8a", "#2563eb", "#1e3a8a"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold shadow-lg"
                >
                  + New Interview
                </motion.div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800/30 border border-gray-800/50 rounded-xl" />)}
              </div>
              <div className="h-48 bg-gray-800/30 border border-gray-800/50 rounded-xl w-full flex items-center justify-center">
                <div className="h-32 w-full max-w-sm border-b border-gray-700 flex items-end gap-2 px-4 pb-2">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5].map((h, i) => (
                    <motion.div key={i} animate={{ height: [`${h * 100}%`, `${h * 80}%`, `${h * 100}%`] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }} className="flex-1 bg-blue-500/50 rounded-t-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Animated Mouse Cursor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ x: [0, 200, 200, 0], y: [200, -20, -20, 200], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
              className="absolute left-1/4 top-1/4 z-30 pointer-events-none drop-shadow-2xl"
            >
              <MousePointerIcon className="w-6 h-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] fill-black" />
            </motion.div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-50 hover:bg-black/20 transition-colors pointer-events-auto">
            <div className="w-20 h-20 bg-blue-600/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(37,99,235,0.5)] group-hover:bg-blue-500">
              <PlayCircleIcon className="w-10 h-10 pl-1 text-white opacity-100" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
