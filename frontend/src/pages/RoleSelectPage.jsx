import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

function RoleSelectPage() {
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("talentiq_selected_role", role);
    openSignIn();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ffffff" }}>
      {/* Navbar */}
      <nav
        className="border-b flex items-center px-6"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#d0d7de",
          height: "56px",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className="flex items-center justify-center rounded-md"
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: "#0969da",
            }}
          >
            <span className="text-white text-sm font-black">T</span>
          </div>
          <span className="font-bold text-base" style={{ color: "#1c2128" }}>
            TalentIQ
          </span>
        </button>
      </nav>

      {/* Split Content */}
      <div className="flex flex-1">
        {/* Left — For Companies */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center p-16 text-center"
          style={{
            backgroundColor: "#ffffff",
            borderRight: "1px solid #d0d7de",
          }}
        >
          {/* Pill Badge */}
          <span
            className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-8 inline-block"
            style={{ backgroundColor: "#1c2128" }}
          >
            Business
          </span>

          <h1 className="font-black text-4xl" style={{ color: "#1c2128" }}>
            For <em>Companies</em>
          </h1>

          <p
            className="text-base mt-4 max-w-xs mx-auto leading-relaxed"
            style={{ color: "#57606a" }}
          >
            Thousands of companies have embraced the new way to conduct and
            streamline technical interviews across roles and throughout their
            careers.
          </p>

          <button
            onClick={() => handleRoleSelect("interviewer")}
            className="mt-10 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "#1c2128" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d333b")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1c2128")
            }
          >
            Login
          </button>

          <p className="mt-6 text-sm" style={{ color: "#57606a" }}>
            Don&apos;t have an account?{" "}
            <button
              className="hover:underline"
              style={{ color: "#0969da" }}
              onClick={() => handleRoleSelect("interviewer")}
            >
              Contact sales
            </button>{" "}
            or{" "}
            <button
              className="hover:underline"
              style={{ color: "#0969da" }}
              onClick={() => handleRoleSelect("interviewer")}
            >
              Get free trial
            </button>
          </p>
        </motion.div>

        {/* Right — For Developers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center p-16 text-center"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Invisible spacer to align with left badge height */}
          <div className="mb-8" style={{ height: "28px" }} />

          <h1 className="font-black text-4xl" style={{ color: "#1c2128" }}>
            For <em>Developers</em>
          </h1>

          <p
            className="text-base mt-4 max-w-xs mx-auto leading-relaxed"
            style={{ color: "#57606a" }}
          >
            Join thousands of developers practicing coding skills, preparing for
            interviews with AI, and getting hired at top companies.
          </p>

          <button
            onClick={() => handleRoleSelect("candidate")}
            className="mt-10 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "#1c2128" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d333b")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1c2128")
            }
          >
            Login
          </button>

          <p className="mt-6 text-sm" style={{ color: "#57606a" }}>
            Don&apos;t have an account?{" "}
            <button
              className="hover:underline"
              style={{ color: "#0969da" }}
              onClick={() => handleRoleSelect("candidate")}
            >
              Sign up.
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default RoleSelectPage;
