import { motion } from "framer-motion";
import { Shield, Lock, Database } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
import PatientDocuments from "@/components/PatientDocuments";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Documents" },
  { id: "photo", label: "Photos" },
  { id: "report", label: "Lab Reports" },
  { id: "prescription", label: "Prescriptions" },
  { id: "xray", label: "X-Rays" },
  { id: "mri", label: "MRI/CT Scans" },
  { id: "other", label: "Other" }
];

export default function HealthRecords() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [documents, setDocuments] = useState<any[]>([]);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return documents.length;
    return documents.filter(doc => doc.category === categoryId).length;
  };

  return (
    <Layout>
      <PageHeader
        icon={Database}
        title="Health Records"
        description="Securely store and access all your medical records in one centralized location."
        gradient="bg-purple"
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{cat.label}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    selectedCategory === cat.id
                      ? "bg-primary-foreground/20"
                      : "bg-muted"
                  )}>
                    {getCategoryCount(cat.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple/10 to-primary/10 rounded-2xl p-5 border border-purple/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple" />
              <span className="font-semibold text-foreground">Data Security</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                End-to-end encryption
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                HIPAA compliant
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                Secure cloud storage
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">Storage Used</h4>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div className="absolute left-0 top-0 h-full w-1/3 gradient-primary rounded-full" />
            </div>
            <p className="text-sm text-muted-foreground">2.8 GB of 10 GB used</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <PatientDocuments
            selectedCategory={selectedCategory}
            onDocumentsChange={setDocuments}
          />
        </motion.div>
      </div>
    </Layout>
  );
}
