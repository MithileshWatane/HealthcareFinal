import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ScanLine,
  FileText,
  Calendar,
  Watch,
  Mic,
  Database,
  Bell,
  Brain,
  Gamepad2,
  Activity,
  Search,
  Stethoscope,
  Heart,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: MessageSquare, label: "Medical Q&A", path: "/chatbot" },
  { icon: ScanLine, label: "Skin Detection", path: "/skin-detection" },
  { icon: FileText, label: "Report Scanning", path: "/report-scanning" },
  { icon: Watch, label: "Health Prediction", path: "/health-prediction" },
  { icon: Mic, label: "Voice Consultation", path: "/voice-consultation" },
  { icon: Database, label: "Health Records", path: "/health-records" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: Brain, label: "Mental Health", path: "/mental-health" },
  { icon: Gamepad2, label: "Games & Exercise", path: "/games" },
  { icon: Heart, label: "Lifestyle", path: "/lifestyle" },
  { icon: User, label: "Profile", path: "/complete-profile" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card shadow-card lg:hidden"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-xl text-foreground whitespace-nowrap overflow-hidden"
              >
                MedCare AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      "hover:bg-sidebar-accent group",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className={cn(
                            "text-sm font-medium whitespace-nowrap overflow-hidden",
                            isActive ? "text-primary-foreground" : "text-foreground"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Sign Out */}
        {user && (
          <div className="px-3 pb-3 border-t border-sidebar-border">
            <div className="pt-3 space-y-2">
              {/* User Info */}
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl",
                isCollapsed && "justify-center"
              )}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 min-w-0 overflow-hidden"
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-destructive/10 text-destructive group",
                  isCollapsed && "justify-center",
                  isSigningOut && "opacity-50 cursor-not-allowed"
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-sidebar-border hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Spacer for content */}
      <div className={cn("hidden lg:block flex-shrink-0 transition-all duration-300", isCollapsed ? "w-20" : "w-[280px]")} />
    </>
  );
}