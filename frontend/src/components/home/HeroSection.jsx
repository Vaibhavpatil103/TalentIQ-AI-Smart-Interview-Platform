import { motion } from "framer-motion";
import {
  CheckCircle2Icon,
  VideoIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  MicOffIcon,
  BotIcon,
} from "lucide-react";
import { C, fadeUp } from "./constants";

export default function HeroSection({ navigate, scrolled }) {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center">
      {/* Dynamic Background */}
      <div className="absolute top-0 inset-x-0 h-[800px] z-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0%,rgba(255,255,255,0)_70%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] z-0 rounded-full bg-blue-50 blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-[400px] h-[400px] z-0 rounded-full bg-indigo-50 blur-[100px] opacity-60 pointer-events-none" />

      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10 text-center">
        {/* Animated Badge */}
        <motion.div
          {...fadeUp(0)}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
          style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.primaryBorder}` }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: C.primary }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: C.primary }} />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.primary }}>
            The New Standard in Hiring
          </span>
          <ChevronRightIcon className="w-3.5 h-3.5" style={{ color: C.primary }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] text-gray-900 mx-auto max-w-[1000px]"
        >
          Interview, evaluate, and hire engineers —{" "}
          <span className="relative whitespace-nowrap">
            <span className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 blur-2xl opacity-20 rounded-full"></span>
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              3× faster.
            </span>
          </span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          {...fadeUp(0.2)}
          className="mt-8 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered video interviews, a real coding IDE, and instant AI scorecards — everything you need to hire the best engineers without the friction.
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col items-center justify-center gap-3 mt-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/role-select")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-medium shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all"
            >
              Start Free Trial <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
            <a
              href="#features"
              className="text-[15px] font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> For Developers
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            No credit card required · Setup in 2 minutes
          </p>
        </motion.div>

        {/* Hero Video Interface */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-20 relative mx-auto max-w-[1000px] rounded-[24px] border border-gray-200/50 bg-white/50 p-2 md:p-4 shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.1), 0 0 40px -10px rgba(10,102,194,0.1)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 rounded-[24px] pointer-events-none" />
          <div className="relative rounded-[16px] overflow-hidden bg-[#0d1117] aspect-[16/9] border border-gray-800 shadow-inner group flex">
            {/* Left: Video feed mockup */}
            <div className="w-2/5 border-r border-[#30363d] relative overflow-hidden bg-black flex flex-col">
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-screen" />
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-70"
                alt="Candidate"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />

              {/* Audio Waveform */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: ["40%", "100%", "30%", "80%", "40%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                    className="w-[3px] bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                  />
                ))}
              </div>

              {/* Floating Action Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 cursor-pointer hover:bg-red-500/30 transition-colors"><MicOffIcon className="w-4 h-4 text-red-400" /></div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"><VideoIcon className="w-4 h-4 text-white" /></div>
              </div>
            </div>

            {/* Right: Code Editor Mockup */}
            <div className="flex-1 bg-[#0d1117] font-mono text-[11px] sm:text-[13px] md:text-sm p-4 sm:p-6 text-left relative flex flex-col">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2 mb-4 -mx-6 px-6">
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-[#161b22] text-white border-t-2 border-orange-400 text-xs rounded-t-md shadow-[0_-2px_10px_rgba(251,146,60,0.1)]">Solution.js</div>
                  <div className="px-3 py-1 text-gray-500 text-xs hover:text-gray-400 cursor-pointer">tests.js</div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
              </div>

              <div className="flex-1 text-slate-300 relative">
                <div><span className="text-pink-400">function</span> <span className="text-blue-400">findPeakElement</span>(nums) {'{'}</div>
                <div className="pl-4"><span className="text-slate-500">// Optimized O(log n) solution</span></div>
                <div className="pl-4"><span className="text-pink-400">let</span> left = <span className="text-orange-300">0</span>, right = nums.length - <span className="text-orange-300">1</span>;</div>
                <div className="pl-4"><span className="text-pink-400">while</span> (left &lt; right) {'{'}</div>
                <div className="pl-8"><span className="text-pink-400">let</span> mid = <span className="text-blue-300">Math</span>.<span className="text-blue-400">floor</span>((left + right) / <span className="text-orange-300">2</span>);</div>

                {/* Animated typing line */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
                  className="pl-8 whitespace-nowrap overflow-hidden inline-block align-bottom relative"
                >
                  <span className="text-pink-400">if</span> (nums[mid] &gt; nums[mid + <span className="text-orange-300">1</span>]) right = mid;
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 bg-blue-400 ml-1 translate-y-1"
                  />
                </motion.div>

                <div className="pl-8"><span className="text-pink-400">else</span> left = mid + <span className="text-orange-300">1</span>;</div>
                <div className="pl-4">{'}'}</div>
                <div className="pl-4"><span className="text-pink-400">return</span> left;</div>
                <div>{'}'}</div>

                {/* Execution overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, -10] }}
                  transition={{ duration: 5, repeat: Infinity, times: [0, 0.6, 0.65, 0.9, 1] }}
                  className="absolute bottom-4 right-0 bg-[#0d1117]/90 backdrop-blur border border-[#30363d] rounded-lg p-3 shadow-2xl z-10"
                >
                  <div className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                    <CheckCircle2Icon className="w-3 h-3" /> All tests passed!
                  </div>
                  <div className="text-[10px] text-slate-400">Execution time: 42ms</div>
                </motion.div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-20 pointer-events-none" />

            {/* Fake UI Overlay Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white/80 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Live Interview
              </div>
              <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-blue-400/30 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <BotIcon className="w-4 h-4" /> AI Analysis Active
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
