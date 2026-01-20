import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Upload, Shield, AlertTriangle, CheckCircle, Info, FileImage } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const screeningTypes = [
  { id: "mammogram", label: "Mammogram", description: "Breast cancer screening" },
  { id: "lung-ct", label: "Lung CT", description: "Lung cancer screening" },
  { id: "skin", label: "Dermoscopy", description: "Skin cancer screening" },
  { id: "colonoscopy", label: "Colonoscopy", description: "Colorectal cancer screening" },
];

export default function CancerDetection() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    risk: "low" | "moderate" | "review";
    confidence: number;
    findings: string[];
  }>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        risk: "low",
        confidence: 94,
        findings: [
          "No suspicious masses detected",
          "Tissue density within normal range",
          "No calcification patterns of concern",
          "Routine follow-up recommended in 12 months",
        ],
      });
    }, 2500);
  };

  return (
    <Layout>
      <PageHeader
        icon={Search}
        title="Cancer Detection"
        description="AI-powered analysis of medical images for early cancer detection and screening."
        gradient="bg-destructive"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Screening Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              Select Screening Type
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {screeningTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <h4 className="font-semibold text-foreground mb-1">{type.label}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              Upload Medical Image
            </h3>

            {analyzing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Analyzing Image...</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Our AI is examining the image for abnormalities
                </p>
                <div className="max-w-xs mx-auto">
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Result Header */}
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl",
                    result.risk === "low"
                      ? "bg-success/10 border border-success/20"
                      : result.risk === "moderate"
                      ? "bg-warning/10 border border-warning/20"
                      : "bg-destructive/10 border border-destructive/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      result.risk === "low"
                        ? "bg-success"
                        : result.risk === "moderate"
                        ? "bg-warning"
                        : "bg-destructive"
                    )}
                  >
                    {result.risk === "low" ? (
                      <CheckCircle className="w-6 h-6 text-success-foreground" />
                    ) : (
                      <AlertTriangle
                        className={cn(
                          "w-6 h-6",
                          result.risk === "moderate" ? "text-warning-foreground" : "text-destructive-foreground"
                        )}
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {result.risk === "low"
                        ? "Low Risk - No Significant Findings"
                        : result.risk === "moderate"
                        ? "Moderate Risk - Follow-up Recommended"
                        : "Requires Medical Review"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {result.confidence}%
                    </p>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Detailed Findings</h4>
                  <ul className="space-y-2">
                    {result.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setResult(null);
                      setSelectedType(null);
                    }}
                  >
                    New Scan
                  </Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground">
                    Share with Doctor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Upload Medical Image</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Drag and drop or click to upload. Supported: DICOM, JPG, PNG
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedType}
                  className="gradient-primary text-primary-foreground"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">How It Works</h3>
            </div>
            <ol className="text-sm text-muted-foreground space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  1
                </span>
                Select the type of cancer screening
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                Upload your medical image
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                AI analyzes for abnormalities
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  4
                </span>
                Review results with your doctor
              </li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-destructive/10 to-coral/10 rounded-2xl p-5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Important Notice</h4>
                <p className="text-sm text-muted-foreground">
                  This AI screening tool is designed to assist, not replace, professional medical diagnosis.
                  Always consult with a qualified healthcare provider for proper evaluation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">Detection Accuracy</h4>
            <div className="space-y-3">
              {[
                { type: "Mammogram", accuracy: 94 },
                { type: "Lung CT", accuracy: 92 },
                { type: "Dermoscopy", accuracy: 96 },
              ].map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.type}</span>
                    <span className="font-medium text-foreground">{item.accuracy}%</span>
                  </div>
                  <Progress value={item.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
