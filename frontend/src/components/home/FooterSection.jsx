import { ArrowRightIcon, Code2Icon, Building2Icon } from "lucide-react";
import TalentIQLogo from "../TalentIQLogo";

export default function FooterSection({ navigate }) {
  return (
    <>
      {/* Dark Split CTA */}
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

      {/* Footer */}
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
    </>
  );
}
