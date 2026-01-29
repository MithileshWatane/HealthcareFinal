import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope, Shield, Brain, Activity, ArrowRight, Check, Sparkles, Loader2,
  MessageSquare, ScanLine, FileText, Mic, Database, Bell, Gamepad2, Heart,
  ShieldCheck, Zap, Globe, Smartphone, BarChart3, Microscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const featureGroups = [
  {
    title: "AI Diagnostics",
    description: "Cutting-edge identification using advanced neural networks.",
    features: [
      {
        icon: ScanLine,
        title: "Skin Disease Detection",
        description: "Upload images for instant AI identification of skin conditions.",
        gradient: "bg-blue-500/10 text-blue-500",
      },
      {
        icon: FileText,
        title: "Report Scanning",
        description: "Intelligent analysis of X-rays, MRIs, and medical reports.",
        gradient: "bg-indigo-500/10 text-indigo-500",
      },
      {
        icon: Microscope,
        title: "Cancer Detection",
        description: "Early-stage detection screening for various types of cancer.",
        gradient: "bg-purple-500/10 text-purple-500",
      },
    ]
  },
  {
    title: "Smart Consultation",
    description: "Vanish the wait times with instant AI-powered guidance.",
    features: [
      {
        icon: MessageSquare,
        title: "Medical Chatbot",
        description: "24/7 Q&A assistant for symptoms and medical guidance.",
        gradient: "bg-emerald-500/10 text-emerald-500",
      },
      {
        icon: Mic,
        title: "Voice Consultation",
        description: "AI-recorded sessions with automatic transcription.",
        gradient: "bg-rose-500/10 text-rose-500",
      },
      {
        icon: Brain,
        title: "Mental Health",
        description: "Anxiety and depression screening with empathetic AI.",
        gradient: "bg-amber-500/10 text-amber-500",
      },
    ]
  },
  {
    title: "Proactive Wellness",
    description: "Stay ahead of your health with data-driven insights.",
    features: [
      {
        icon: Activity,
        title: "Health Prediction",
        description: "Wearable data analysis to predict future health risks.",
        gradient: "bg-cyan-500/10 text-cyan-500",
      },
      {
        icon: Heart,
        title: "Lifestyle Analysis",
        description: "Analyze daily habits to optimize your aging and energy.",
        gradient: "bg-pink-500/10 text-pink-500",
      },
      {
        icon: Gamepad2,
        title: "Health Games",
        description: "Gamified exercises and cognitive tasks for wellness.",
        gradient: "bg-orange-500/10 text-orange-500",
      },
    ]
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("hackmatez11@gmail.com", "12345678");
      toast({
        title: "Demo Access Granted! 🎉",
        description: "Logged in successfully. Welcome to the demo!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Demo login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/30">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              MedCare AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:flex hover:bg-transparent hover:text-slate-900"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Demo Sign In
            </Button>
            <Link to="/signin">
              <Button className="gradient-primary shadow-md hover:shadow-lg transition-all rounded-full px-6">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Hero Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-slate-900 mb-8 leading-[0.9] tracking-tight">
                  Healthcare <br />
                  <span className="text-primary italic">Intelligence</span>
                </h1>
                <p className="text-slate-500 text-xl md:text-2xl max-w-2xl lg:max-w-none mx-auto lg:mx-0 mb-12 leading-relaxed font-light">
                  Empowering patients and doctors with clinical-grade AI diagnostics,
                  instant consultations, and predictive health analytics.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                  <Button
                    size="lg"
                    className="gradient-primary text-lg px-10 py-7 rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Explore Portal
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  <Link to="/signup">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-7 rounded-full border-slate-300 text-slate-900 hover:bg-slate-100 hover:text-slate-900">
                      Create Patient ID
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Capability Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 flex flex-col items-center justify-center lg:items-end"
            >
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Infrastructure</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">V2.4.0-STABLE</div>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-slate-900 mb-6">
                    Active AI Modules
                  </h3>

                  <div className="space-y-4">
                    {[
                      { icon: ScanLine, label: "Vision AI", detail: "Report & Scan Analysis", color: "text-blue-500", bg: "bg-blue-50" },
                      { icon: Microscope, label: "Skin AI", detail: "Dermatological Logic", color: "text-indigo-500", bg: "bg-indigo-50" },
                      { icon: Mic, label: "Voice AI", detail: "Clinical Transcription", color: "text-rose-500", bg: "bg-rose-50" },
                      { icon: Brain, label: "Mental AI", detail: "Screening & Support", color: "text-amber-500", bg: "bg-amber-50" }
                    ].map((module, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:shadow-md transition-all cursor-default"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${module.bg} flex items-center justify-center`}>
                            <module.icon className={`w-6 h-6 ${module.color}`} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{module.label}</div>
                            <div className="text-[11px] text-slate-400">{module.detail}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-success opacity-50" />
                          <span className="text-[10px] font-black text-slate-400">READY</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-success" /> Encrypted Channel
                    </div>
                    <span>Global Latency: 24ms</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-slate-200 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-around gap-8 grayscale opacity-50">
            <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck className="w-6 h-6" /> HIPAA SECURE</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-6 h-6" /> 99% ACCURACY</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Globe className="w-6 h-6" /> GLOBAL ACCESS</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Smartphone className="w-6 h-6" /> MOBILE FIRST</div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-6">
              The Full Stack of Health AI
            </h2>
            <p className="text-slate-500 text-lg">
              MedCare AI integrates directly with your medical life, providing
              a suite of tools that used to require a hospital visit.
            </p>
          </div>

          <div className="space-y-20">
            {featureGroups.map((group, groupIdx) => (
              <div key={group.title} className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100" />
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                    {group.title}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {group.features.map((feature, featureIdx) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIdx * 0.1 }}
                      className="group p-8 rounded-3xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all cursor-default"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.gradient}`}>
                        <feature.icon className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-xl text-slate-900 mb-3">{feature.title}</h4>
                      <p className="text-slate-500 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-bold tracking-tighter text-lg mb-4 block">SECURE BY DESIGN</span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-8">
                Your Health Records, <br />
                Masterfully Controlled.
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Encrypted Storage", desc: "Military grade encryption for all your diagnostic history." },
                  { title: "Smart Alerts", desc: "AI remembers your medications and appointments so you don't have to." },
                  { title: "Instant Sharing", desc: "Securely share reports with specialists via encrypted QR codes." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">{item.title}</h5>
                      <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="mt-12 rounded-full px-8 py-6 border-slate-200 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
                onClick={handleDemoLogin}
              >
                Start Your Records
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-[4rem] flex items-center justify-center p-8 backdrop-blur shadow-2xl border border-white/50">
                <div className="w-full bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <BarChart3 className="text-primary w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Health Index</div>
                      <div className="font-bold text-success">Optimizing +14%</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[85%]" />
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[70%]" />
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[95%]" />
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="font-bold text-slate-900 font-display">MedCare Insight</div>
                    <Database className="text-slate-300 w-5 h-5" />
                  </div>
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/10 rounded-full blur-3xl" />

            <h2 className="font-display font-black text-4xl md:text-6xl text-white mb-8 tracking-tighter">
              Join the Healthcare <br /> Revolution.
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Step into the future of medicine. Start monitoring your health
              with clinical-grade AI today. Free for personal use.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                size="lg"
                className="gradient-primary text-white border-none text-lg px-12 py-7 rounded-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Access Demo Account"}
              </Button>
              <Link to="/signup">

              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deep Footer */}
      <footer className="pt-20 pb-10 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-slate-900">MedCare AI</span>
              </div>
              <p className="text-slate-500 max-w-xs leading-relaxed">
                The world's most advanced AI healthcare platform, bridging the gap between clinical data and patient care.
              </p>
            </div>
            <div>
              <h6 className="font-bold text-slate-900 mb-6">Platform</h6>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-primary transition-colors">Diagnostics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Consultation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Record System</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Wearable Link</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-bold text-slate-900 mb-6">Company</h6>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© 2026 MedCare AI. Integrated Healthcare Intelligence.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
