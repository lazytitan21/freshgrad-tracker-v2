import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import { Mail, Lock, ArrowRight, Shield, Users, BookOpen, Award } from "lucide-react";

export default function LoginPage(){
  const { login } = useAuth();
  const [email,setEmail] = useState(""); 
  const [password,setPassword] = useState(""); 
  const [err,setErr]=useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e){ 
    e.preventDefault(); 
    setErr(""); 
    setIsLoading(true);
    try { 
      await login(email.trim(), password); 
    } catch(ex) { 
      setErr(ex.message || "Invalid credentials. Please try again."); 
    } finally {
      setIsLoading(false);
    }
  }

  const features = [
    { icon: Users, title: "Track Progress", desc: "Monitor candidate journey from enrollment to deployment" },
    { icon: BookOpen, title: "Course Management", desc: "Manage training courses, enrollments, and assessments" },
    { icon: Award, title: "Certification", desc: "Track completions, grades, and graduation readiness" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <Motion.div 
        initial={{opacity:0,x:-20}} 
        animate={{opacity:1,x:0}} 
        transition={{duration:0.5}}
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl">MOE - ECAE</div>
              <div className="text-sm text-indigo-200">Talent Tracking System</div>
            </div>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Empowering UAE's Future Educators
          </h1>
          <p className="text-lg text-indigo-100 max-w-md mb-12">
            A comprehensive platform for managing teacher training programs, tracking progress, and ensuring quality education outcomes.
          </p>
          
          <div className="space-y-6">
            {features.map((f, i) => (
              <Motion.div 
                key={i}
                initial={{opacity:0,y:20}} 
                animate={{opacity:1,y:0}} 
                transition={{delay: 0.3 + i * 0.1}}
                className="flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-indigo-200">{f.desc}</div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-indigo-200">
          © {new Date().getFullYear()} Ministry of Education UAE. All rights reserved.
        </div>
      </Motion.div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Motion.div 
          initial={{opacity:0,y:20}} 
          animate={{opacity:1,y:0}}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">MOE - ECAE</div>
              <div className="text-xs text-slate-500">Talent Tracking System</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to access your dashboard and manage training programs.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email"
                  aria-label="email" 
                  className="form-input pl-12" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  placeholder="Enter your email" 
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="password"
                  aria-label="password" 
                  className="form-input pl-12" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {err && (
              <Motion.div 
                initial={{opacity:0,y:-10}} 
                animate={{opacity:1,y:0}}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {err}
              </Motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Need help? Contact your administrator or the IT support team.
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
