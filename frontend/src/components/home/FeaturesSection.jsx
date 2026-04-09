import { motion } from "framer-motion";
import {
  CheckCircle2Icon,
  VideoIcon,
  Code2Icon,
  MicOffIcon,
  TerminalIcon,
} from "lucide-react";
import { inView } from "./constants";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-gray-50 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">

        <motion.div {...inView} className="mb-24 md:w-2/3">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
            Features built for speed
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to hire the best, without the friction. Modern tools for modern engineering teams.
          </p>
        </motion.div>

        {/* Feature 1: Video Calling */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div {...inView}>
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-8">
              <VideoIcon className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Crystal clear video calling</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              No third-party links required. Start an interview instantly with integrated HD video, screen sharing, and reliable connections powered by Stream.
            </p>
            <ul className="space-y-4">
              {["One-click session join", "Background blur & noise cancellation", "Zero installation required"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2Icon className="w-5 h-5 text-green-500" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...inView} className="relative aspect-square">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-[80px] opacity-50 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="relative h-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 flex flex-col gap-4">
              {/* Main Video */}
              <div className="w-full flex-1 bg-gray-900 rounded-2xl overflow-hidden relative group/video border border-gray-800 shadow-inner">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Video call main" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <div className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white"><MicOffIcon className="w-4 h-4 text-red-500" /></div>
                </div>
                {/* Floating Reaction */}
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], y: -80, scale: 1.5, x: [0, 15, -10, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute bottom-16 right-8 text-3xl drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] z-20"
                >
                  👍
                </motion.div>
              </div>
              {/* Secondary Row */}
              <div className="h-1/3 flex gap-4">
                <div className="w-[45%] rounded-2xl overflow-hidden relative border border-gray-200 shadow-sm">
                  <img src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Video self" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl border-2 border-green-500 pointer-events-none"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white font-medium flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" /> You
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl border border-gray-100 p-4 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10" />
                  <motion.div
                    initial={{ opacity: 0.5, x: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 w-3/4 bg-blue-200 rounded-full mb-3"
                  />
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="h-2 w-1/2 bg-blue-200 rounded-full mb-4"
                  />
                  <div className="bg-white border text-blue-800 border-blue-100 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 shadow-sm z-20 relative">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Analyzing signals...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature 2: Code Editor (Reversed) */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...inView} className="relative aspect-square order-2 md:order-1">
            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-[80px] opacity-50" />
            <div className="relative h-full bg-[#0d1117] rounded-3xl border border-[#30363d] shadow-2xl overflow-hidden p-6 flex flex-col group/code">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-[10px] font-mono text-gray-400 flex items-center gap-1.5 shadow-sm">
                  <TerminalIcon className="w-3 h-3" /> React.jsx
                </div>
              </div>
              <div className="text-xs sm:text-sm font-mono text-gray-300 flex-1 overflow-hidden flex flex-col">
                <div className="flex-1">
                  <div><span className="text-pink-400">export default function</span> <span className="text-blue-400">Button</span>() {'{'}</div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear", delay: 0.2 }}
                    className="pl-4 whitespace-nowrap overflow-hidden inline-block align-bottom"
                  >
                    <span className="text-pink-400">const</span> [clicked, setClicked] = <span className="text-blue-300">useState</span>(<span className="text-blue-400">false</span>);
                  </motion.div>
                  <br />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 1.8 }}
                    className="pl-4 mt-2"
                  >
                    <span className="text-pink-400">return</span> (
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 2.0 }}
                    className="pl-8 text-blue-300"
                  >
                    &lt;<span className="text-blue-400">button</span><br />
                    &nbsp;&nbsp;onClick={'{\\'} () =&gt; setClicked(<span className="text-blue-400">true</span>){'\\}\n'}
                    &nbsp;&nbsp;className=<span className="text-emerald-300">"bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm"</span>
                    &gt;<br />
                    &nbsp;&nbsp;{'{'}clicked ? <span className="text-emerald-300">"Saved!"</span> : <span className="text-emerald-300">"Save"</span>{'}'}<br />
                    &lt;/<span className="text-blue-400">button</span>&gt;
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 2.5 }}
                    className="pl-4"
                  >
                    );
                  </motion.div>
                  <div>{'}'}</div>
                </div>
              </div>

              {/* Live preview pop up */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 3.2, type: "spring", bounce: 0.5 }}
                className="absolute bottom-6 right-6 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 border border-gray-100 w-52 z-20"
              >
                <div className="text-[10px] text-gray-400 mb-3 font-bold uppercase tracking-widest flex items-center justify-between">
                  Live Preview <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <motion.button
                  animate={{
                    scale: [1, 0.95, 1],
                    backgroundColor: ["#2563eb", "#16a34a", "#16a34a"]
                  }}
                  transition={{ duration: 2, delay: 4.5, repeat: Infinity, repeatDelay: 3 }}
                  className="w-full text-white font-medium py-2.5 rounded-lg text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 2, delay: 4.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    Save
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div {...inView} className="order-1 md:order-2">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-8">
              <Code2Icon className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">World-class coding environment</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Powered by Monaco Editor (the heart of VS Code). Evaluate candidates in an environment they already know and love, directly in the browser.
            </p>
            <ul className="space-y-4">
              {["Syntax highlighting & autocomplete", "Multi-cursor & vim bindings", "Real-time execution sandbox"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2Icon className="w-5 h-5 text-indigo-500" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
