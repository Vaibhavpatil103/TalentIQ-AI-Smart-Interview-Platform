import { useNavigate } from "react-router";
import TalentIQLogo, { TalentIQIcon } from "../components/TalentIQLogo";
import { motion, useScroll, useTransform, animate, useMotionValue, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  PlayCircleIcon,
  CheckCircle2Icon,
  VideoIcon,
  Code2Icon,
  ArrowRightIcon,
  ChevronRightIcon,
  StarIcon,
  Building2Icon,
  BriefcaseIcon,
  MicOffIcon,
  MonitorIcon,
  BotIcon,
  MousePointerIcon,
  TerminalIcon,
} from "lucide-react";

/* ── Colour Tokens ─────────────────────────────────────────── */
const C = {
  pageBg: "#ffffff",
  sectionAlt: "#f9fafb",
  primary: "#0a66c2",
  primaryHover: "#004182",
  primaryLight: "#e8f0fe",
  primaryBorder: "#8bb9fe",
  textDark: "#0f172a",
  textMuted: "#475569",
  textDim: "#64748b",
  border: "#e2e8f0",
  darkBg: "#020617",
  darkSurface: "#0f172a",
  darkText: "#f8fafc",
  darkMuted: "#94a3b8",
  darkBorder: "#1e293b",
  cardShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)",
  glow: "0 0 24px rgba(10, 102, 194, 0.25)",
};

/* ── Animation Presets ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const inView = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

/* ── Helpers ───────────────────────────────────────────────── */
function NavBtn({ children, onClick, filled, icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-all duration-300 ${filled ? "text-white shadow-lg shadow-blue-500/20" : "text-gray-700 bg-white border border-gray-200"
        }`}
      style={{
        backgroundColor: filled ? C.primary : "white",
      }}
      whileHover={{
        y: -1,
        backgroundColor: filled ? C.primaryHover : C.sectionAlt,
        boxShadow: filled ? "0 8px 20px -4px rgba(10, 102, 194, 0.4)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {children}
      {icon && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </motion.button>
  );
}

function Counter({ from = 0, to, duration = 2 }) {
  const count = useMotionValue(from);
  const [display, setDisplay] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const animation = animate(count, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });
    return animation.stop;
  }, [isInView, count, to, duration]);

  return <span ref={ref}>{display}</span>;
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
function HomePage() {
  const navigate = useNavigate();
  // eslint-unused-vars
  const { scrollYProgress } = useScroll();
  // eslint-unused-vars
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  /* ── Change 7: Scroll-triggered navbar prominence ── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{ backgroundColor: C.pageBg, fontFamily: "'Inter', sans-serif" }}
      className="antialiased selection:bg-blue-100 selection:text-blue-900 overflow-hidden"
    >
      {/* ── 1. NAVBAR (Glassmorphism) ── */}
      {/* Change 7: animate bg opacity on scroll so the CTA becomes more visible */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{
          y: 0,
          backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.70)",
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 backdrop-blur-xl saturate-150"
        style={{
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.07)" : "none",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <TalentIQLogo size={36} variant="light" />
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/role-select")}
              className="hidden sm:block text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-2"
            >
              Sign in
            </button>
            {/* Change 7: nav CTA becomes bolder when scrolled */}
            <NavBtn onClick={() => navigate("/role-select")} filled icon={<ArrowRightIcon className="w-4 h-4" />}>
              {scrolled ? "Get Started Free" : "Get Started Free"}
            </NavBtn>
          </div>
        </div>
      </motion.nav>

      {/* ── 2. HERO SECTION ── */}
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

          {/* Change 1: Outcome-driven headline with gradient on "3× faster" */}
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

          {/* Change 1: More specific sub-copy */}
          <motion.p
            {...fadeUp(0.2)}
            className="mt-8 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered video interviews, a real coding IDE, and instant AI scorecards — everything you need to hire the best engineers without the friction.
          </motion.p>

          {/* Change 2: Single dominant CTA + subtle developer link + trust line */}
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
              {/* Demoted to subtle text link — scrolls to features */}
              <a
                href="#features"
                className="text-[15px] font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Code2Icon className="w-4 h-4" /> For Developers
              </a>
            </div>
            {/* Trust signal */}
            <p className="text-sm text-gray-400 mt-1">
              No credit card required · Setup in 2 minutes
            </p>
          </motion.div>

          {/* Change 3: hero.png block REMOVED — animated mockup below is the sole hero visual */}

          {/* Hero Video Interface — moved to fadeUp(0.4) from 0.5 */}
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

                {/* Audio Waveform Anim */}
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
                    {/* Blinking cursor */}
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

      {/* ── 3. TRUSTED BY LOGOS ── */}
      {/* Change 4: Updated copy + trust badge row below logos */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="max-w-[1400px] mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
            Trusted by 500+ engineering teams worldwide
          </p>
          <div className="flex justify-center gap-10 md:gap-16 items-center flex-wrap opacity-50 hover:opacity-80 transition-all duration-700">
            {[
              { name: "Google", font: "'Product Sans', sans-serif", weight: 500, size: 22, tracking: "-0.02em" },
              { name: "Stripe", font: "'Inter', sans-serif", weight: 700, size: 22, tracking: "-0.03em" },
              { name: "Vercel", font: "'Inter', sans-serif", weight: 800, size: 20, tracking: "-0.04em" },
              { name: "Linear", font: "'Inter', sans-serif", weight: 600, size: 20, tracking: "-0.02em" },
              { name: "Netflix", font: "'Inter', sans-serif", weight: 900, size: 22, tracking: "0.01em" },
              { name: "Spotify", font: "'Inter', sans-serif", weight: 700, size: 20, tracking: "-0.01em" },
            ].map((company, i) => (
              <motion.span
                key={company.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ fontFamily: company.font, fontWeight: company.weight, fontSize: company.size, letterSpacing: company.tracking }}
                className="text-gray-800 select-none"
              >
                {company.name}
              </motion.span>
            ))}
          </div>
          {/* Trust badges */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            {["4.9★ on G2", "SOC 2 Certified", "99.9% Uptime"].map((badge) => (
              <span key={badge} className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-green-500" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS (NEW) ── */}
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

            {[
              {
                icon: <BriefcaseIcon className="w-8 h-8 text-blue-600" />,
                title: "1. Create a Role",
                desc: "Set up the job description, required skills, and let our AI generate the perfect technical questions."
              },
              {
                icon: <Code2Icon className="w-8 h-8 text-blue-600" />,
                title: "2. Live Collaboration",
                desc: "Conduct the interview in our built-in IDE with video chat, syntax highlighting, and live execution."
              },
              {
                icon: <CheckCircle2Icon className="w-8 h-8 text-blue-600" />,
                title: "3. AI Scorecards",
                desc: "Get an instant, unbiased technical evaluation immediately after the session ends."
              }
            ].map((step, index) => (
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

      {/* ── 5. FEATURES SECTION ── */}
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

          {/* Feature 1 */}
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
                  {/* Floating Reaction Anim */}
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

          {/* Feature 2 (Reversed) */}
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
                      &nbsp;&nbsp;onClick={'{\()'} =&gt; setClicked(<span className="text-blue-400">true</span>){'\}\n'}
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

      {/* ── 6. VIDEO SHOWCASE (NEW) ── */}
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

      {/* ── 7. STATS SECTION ── */}
      {/* Change 5: Credible labels with context */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { num: 10, suffix: "k+", label: "Engineers Trust Us" },
              { num: 500, suffix: "+", label: "Companies Hiring Smarter" },
              { num: 50, suffix: "k+", label: "Interviews Completed" },
              { num: 99, suffix: ".9%", label: "Uptime SLA" }
            ].map((stat, i) => (
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

      {/* ── 8. TESTIMONIALS ── */}
      {/* Change 6: Specific roles, companies, and quantified outcomes */}
      <section id="testimonials" className="py-32 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...inView} className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-6">Loved by engineers</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "TalentIQ cut our hiring cycle from 6 weeks to 11 days. The AI scorecards remove bias and get the whole team aligned in minutes.",
                author: "Sarah Jenkins",
                role: "VP of Engineering · Series B Fintech",
                img: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                quote: "As a candidate, the experience was flawless. The Monaco editor felt exactly like VS Code — zero friction, pure problem-solving.",
                author: "David Chen",
                role: "Senior Full Stack Engineer · Hired via TalentIQ",
                img: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                quote: "We reduced time-to-hire by 40% in our first month. Replaying sessions and reviewing code evolution has transformed how we evaluate talent.",
                author: "Elena Rodriguez",
                role: "Technical Recruiter · 200+ hires completed",
                img: "https://randomuser.me/api/portraits/women/68.jpg"
              }
            ].map((t, i) => (
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

      {/* ── 9. DARK SPLIT CTA ── */}
      {/* Change 8: Updated copy for both personas */}
      <section className="bg-[#020617] text-white">
        <div className="grid md:grid-cols-2">
          {/* Devs */}
          <div className="p-16 md:p-32 border-b md:border-b-0 md:border-r border-[#1e293b] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500" />
            <div className="relative z-10">
              <Code2Icon className="w-12 h-12 text-blue-400 mb-8" />
              <h3 className="text-4xl font-black mb-6 tracking-tight">For Developers</h3>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Sharpen your skills with real technical challenges and instant AI feedback. Always free.
              </p>
              <button
                onClick={() => navigate("/role-select")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Start Practicing <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Companies */}
          <div className="p-16 md:p-32 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500" />
            <div className="relative z-10">
              <Building2Icon className="w-12 h-12 text-indigo-400 mb-8" />
              <h3 className="text-4xl font-black mb-6 tracking-tight">For Companies</h3>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Reduce time-to-hire by 40% with AI-powered technical interviews your candidates actually enjoy.
              </p>
              <button
                onClick={() => navigate("/role-select")}
                className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              >
                Start Free Trial <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FOOTER ── */}
      <footer className="bg-[#020617] border-t border-[#1e293b] pt-20 pb-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <TalentIQLogo size={32} variant="dark" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                The modern standard for technical interviews. Hire faster, evaluate better, and treat candidates with respect.
              </p>
              <div className="flex gap-4">
                {/* Twitter/X */}
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                {/* GitHub */}
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Interviews</a></li>
                <li><a href="#features" className="hover:text-blue-400 transition-colors">AI Feedback</a></li>
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Practice Mode</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#features" className="hover:text-blue-400 transition-colors">API Reference</a></li>
                <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1e293b] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 TalentIQ Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;