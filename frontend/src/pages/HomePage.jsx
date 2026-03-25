import { useNavigate } from "react-router";
import { motion } from "framer-motion";

/* ── Colour tokens ─────────────────────────────────────────── */
const C = {
  pageBg: "#ffffff",
  sectionAlt: "#f6f8fa",
  primary: "#0969da",
  primaryHover: "#0550ae",
  primaryLight: "#ddf4ff",
  primaryBorder: "#54aeff",
  textDark: "#1c2128",
  textMuted: "#57606a",
  textDim: "#8c959f",
  border: "#d0d7de",
  darkBg: "#0d1117",
  darkText: "#e6edf3",
  darkMuted: "#7d8590",
  darkBorder: "#30363d",
};

/* ── Tiny helpers ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const inView = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function NavBtn({ children, onClick, filled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
      style={
        filled
          ? { backgroundColor: C.primary, color: "#fff" }
          : { border: `1px solid ${C.border}`, color: C.textDark }
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = filled
          ? C.primaryHover
          : C.sectionAlt;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = filled ? C.primary : "";
      }}
    >
      {children}
    </motion.button>
  );
}

/* ── Fake score bar for Features section ──────────────────── */
function ScoreBar({ label, pct }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: C.textDark }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: C.primary }}>
          {pct}%
        </span>
      </div>
      <div
        className="rounded-full"
        style={{ backgroundColor: C.sectionAlt, height: "8px" }}
      >
        <div
          className="rounded-full"
          style={{
            backgroundColor: C.primary,
            width: `${pct}%`,
            height: "8px",
          }}
        />
      </div>
    </div>
  );
}

/* ── Feature row ───────────────────────────────────────────── */
function FeatureRow({ reverse, label, heading, body, mockup }) {
  return (
    <motion.div
      {...inView}
      className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24 ${
        reverse ? "direction-rtl" : ""
      }`}
    >
      {reverse ? (
        <>
          {mockup}
          <div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block"
              style={{
                backgroundColor: C.primaryLight,
                color: C.primary,
                border: `1px solid ${C.primaryBorder}`,
              }}
            >
              {label}
            </span>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ color: C.textDark }}
            >
              {heading}
            </h3>
            <p
              className="leading-relaxed mb-6"
              style={{ color: C.textMuted }}
            >
              {body}
            </p>
            <a
              href="#"
              className="text-sm font-medium hover:underline"
              style={{ color: C.primary }}
            >
              Learn more →
            </a>
          </div>
        </>
      ) : (
        <>
          <div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block"
              style={{
                backgroundColor: C.primaryLight,
                color: C.primary,
                border: `1px solid ${C.primaryBorder}`,
              }}
            >
              {label}
            </span>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ color: C.textDark }}
            >
              {heading}
            </h3>
            <p
              className="leading-relaxed mb-6"
              style={{ color: C.textMuted }}
            >
              {body}
            </p>
            <a
              href="#"
              className="text-sm font-medium hover:underline"
              style={{ color: C.primary }}
            >
              Learn more →
            </a>
          </div>
          {mockup}
        </>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: C.pageBg, fontFamily: "inherit" }}>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: C.pageBg,
          borderColor: C.border,
          height: "56px",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between"
        >
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="rounded-md flex items-center justify-center"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: C.primary,
              }}
            >
              <span className="text-white text-sm font-black">T</span>
            </div>
            <span
              className="font-bold text-base"
              style={{ color: C.textDark }}
            >
              TalentIQ
            </span>
          </button>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2">
            <NavBtn onClick={() => navigate("/role-select")} filled={false}>
              Log In
            </NavBtn>
            <NavBtn onClick={() => navigate("/role-select")} filled>
              Get Started Free
            </NavBtn>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: C.pageBg }}
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.span
            {...fadeUp(0)}
            className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-8 inline-block"
            style={{
              backgroundColor: C.primaryLight,
              color: C.primary,
              border: `1px solid ${C.primaryBorder}`,
            }}
          >
            AI-Powered Interview Platform
          </motion.span>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl md:text-6xl font-black leading-tight mt-4"
            style={{ color: C.textDark }}
          >
            <span style={{ color: C.primary }}>Hire</span> the next
            <br />
            <span style={{ color: C.primary }}>generation</span> developer
          </motion.h1>

          {/* Sub */}
          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: C.textMuted }}
          >
            We help thousands of companies conduct better technical interviews,
            and developers to ace them.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.3)}
            className="flex flex-wrap gap-4 justify-center mt-10"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/role-select")}
              className="font-semibold rounded-lg px-6 py-3 text-sm text-white transition-colors"
              style={{ backgroundColor: C.textDark }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2d333b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = C.textDark)
              }
            >
              Start a free trial
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/role-select")}
              className="font-medium rounded-lg px-6 py-3 text-sm transition-colors"
              style={{
                border: `1px solid ${C.border}`,
                color: C.textDark,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = C.sectionAlt)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              For developers
            </motion.button>
          </motion.div>

          {/* Hero image */}
          <motion.img
            {...fadeUp(0.4)}
            src="/hero.png"
            alt="TalentIQ Platform"
            className="w-full h-auto rounded-2xl mt-16 shadow-xl"
            style={{ border: `1px solid ${C.border}` }}
          />
        </div>
      </section>

      {/* ── COMPANY LOGOS STRIP ────────────────────────────── */}
      <section
        className="py-12 border-y"
        style={{
          backgroundColor: C.sectionAlt,
          borderColor: C.border,
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <span
            className="text-xs uppercase tracking-widest font-semibold block text-center mb-8"
            style={{ color: C.textDim }}
          >
            Trusted by engineering teams from
          </span>
          <div className="flex justify-center items-center flex-wrap gap-10">
            {["Google", "Amazon", "Microsoft", "Meta", "Apple", "LinkedIn"].map(
              (name) => (
                <span
                  key={name}
                  className="font-bold text-lg opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: C.textDim }}
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── DARK GRADIENT (quote) SECTION ──────────────────── */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          backgroundColor: C.darkBg,
          backgroundImage:
            "radial-gradient(circle, #30363d 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.p
            {...inView}
            className="text-sm font-mono mb-6"
            style={{ color: "#2cbe4e" }}
          >
            The future of technical hiring.
          </motion.p>
          <motion.p
            {...inView}
            className="text-2xl md:text-3xl font-medium leading-relaxed"
            style={{ color: C.darkText }}
          >
            We&apos;ve entered a new era of technical interviews where AI and
            human expertise work together. This changes the way companies hire
            developers, and how developers prepare.
          </motion.p>
          <motion.p
            {...inView}
            className="text-xl mt-8"
            style={{ color: C.darkMuted }}
          >
            We&apos;re building TalentIQ with you, and we&apos;ve designed
            every feature to meet this moment.
          </motion.p>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.pageBg }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            {...inView}
            className="text-3xl font-black text-center mb-16"
            style={{ color: C.textDark }}
          >
            The Interview Skills Platform
          </motion.h2>

          {/* Feature 1 */}
          <FeatureRow
            label="TalentIQ Practice"
            heading="Prepare and ace your dream job"
            body="Practice with our AI interviewer, get real feedback on your code and communication, and improve with every session."
            mockup={
              <div
                className="rounded-xl p-6 shadow-sm"
                style={{
                  backgroundColor: C.sectionAlt,
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* Fake AI chat */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: C.primary }}
                  >
                    AI
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: C.textDark }}
                  >
                    AI Interviewer
                  </span>
                </div>
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{
                      backgroundColor: C.pageBg,
                      border: `1px solid ${C.border}`,
                      color: C.textDark,
                    }}
                  >
                    Can you explain your approach to this problem?
                  </div>
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{
                      backgroundColor: C.primaryLight,
                      border: `1px solid ${C.primaryBorder}`,
                      color: C.textDark,
                    }}
                  >
                    I would use a hash map to store...
                  </div>
                </div>
                <button
                  className="mt-4 text-white text-xs px-4 py-2 rounded-lg"
                  style={{ backgroundColor: C.primary }}
                >
                  Submit Answer
                </button>
              </div>
            }
          />

          {/* Feature 2 */}
          <FeatureRow
            reverse
            label="TalentIQ Interview"
            heading="Conduct real-time coding interviews"
            body="Create sessions in seconds, share a join code, collaborate on real problems with a live code editor and video call."
            mockup={
              <div
                className="rounded-xl p-4 shadow-sm"
                style={{
                  backgroundColor: C.sectionAlt,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.textDark }}
                >
                  Welcome, Developer
                </p>
                {[
                  { color: "#2cbe4e", label: "Session #1 — Active" },
                  { color: C.primary, label: "Session #2 — Scheduled" },
                  { color: C.textDim, label: "Session #3 — Completed" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 rounded-lg p-2.5 mb-2"
                    style={{
                      backgroundColor: C.pageBg,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs" style={{ color: C.textDark }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            }
          />

          {/* Feature 3 */}
          <FeatureRow
            label="TalentIQ Feedback"
            heading="Get AI-powered performance insights"
            body="After every session, receive detailed scorecards with skill breakdown, company readiness scores, and improvement tips."
            mockup={
              <div
                className="rounded-xl p-5 shadow-sm"
                style={{
                  backgroundColor: C.pageBg,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-sm font-semibold mb-4"
                  style={{ color: C.textDark }}
                >
                  Performance Scorecard
                </p>
                <ScoreBar label="Problem Solving" pct={80} />
                <ScoreBar label="Communication" pct={70} />
                <ScoreBar label="Technical Depth" pct={90} />
              </div>
            }
          />
        </div>
      </section>

      {/* ── DARK SPLIT (Developers + Companies) ────────────── */}
      <section
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ backgroundColor: C.darkBg }}
      >
        {/* For Developers */}
        <motion.div
          {...inView}
          className="p-16 flex flex-col justify-center"
          style={{ borderRight: `1px solid ${C.darkBorder}` }}
        >
          <h3 className="text-2xl font-bold mb-3" style={{ color: "#ffffff" }}>
            For Developers
          </h3>
          <p
            className="mb-8 leading-relaxed"
            style={{ color: C.darkMuted }}
          >
            Join thousands of developers practicing coding skills, preparing for
            interviews with AI, and getting hired at top companies.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/role-select")}
            className="self-start font-medium rounded-lg px-5 py-2.5 text-sm transition-colors text-white"
            style={{ border: `1px solid ${C.darkBorder}` }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.darkText)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = C.darkBorder)
            }
          >
            Join the Community
          </motion.button>
        </motion.div>

        {/* For Companies */}
        <motion.div
          {...inView}
          className="p-16 flex flex-col justify-center"
        >
          <h3 className="text-2xl font-bold mb-3" style={{ color: "#ffffff" }}>
            For Companies
          </h3>
          <p
            className="mb-8 leading-relaxed"
            style={{ color: C.darkMuted }}
          >
            Thousands of companies have embraced the new way to conduct
            technical interviews and upskill developers across all roles.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/role-select")}
            className="self-start font-medium rounded-lg px-5 py-2.5 text-sm transition-colors text-white"
            style={{ border: `1px solid ${C.darkBorder}` }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.darkText)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = C.darkBorder)
            }
          >
            Start a Free Trial
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        className="border-t py-12 px-6"
        style={{
          backgroundColor: C.darkBg,
          borderColor: C.darkBorder,
        }}
      >
        <div
          className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6"
        >
          <div>
            <p className="font-bold text-white">TalentIQ</p>
            <p
              className="text-sm mt-2"
              style={{ color: "#484f58" }}
            >
              © 2025 TalentIQ. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8 text-sm" style={{ color: C.darkMuted }}>
            {["Privacy", "Terms", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
