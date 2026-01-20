import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export function PageHeader({ icon: Icon, title, description, gradient = "gradient-primary" }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", gradient)}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground">{title}</h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">{description}</p>
    </motion.div>
  );
}
