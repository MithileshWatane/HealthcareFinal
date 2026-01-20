import { useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, Upload, Image, Check, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { medicalAnalysisService, type AnalysisResponse } from "@/services/medicalAnalysisService";
import { useToast } from "@/hooks/use-toast";

export default function SkinDetection() {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndAnalyze(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndAnalyze(file);
    }
  };

  const validateAndAnalyze = (file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG or PNG image",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await medicalAnalysisService.analyzeSkin(file);
      setResult(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "Your skin condition has been analyzed successfully",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Extract severity from analysis text (simple heuristic)
  const getSeverity = (analysis: string): "low" | "medium" | "high" => {
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes("severe") || lowerAnalysis.includes("urgent") || lowerAnalysis.includes("immediate")) {
      return "high";
    } else if (lowerAnalysis.includes("moderate") || lowerAnalysis.includes("concerning")) {
      return "medium";
    }
    return "low";
  };

  return (
    <Layout>
      <PageHeader
        icon={ScanLine}
        title="Skin Disease Detection"
        description="Upload an image of your skin condition for AI-powered analysis and recommendations."
        gradient="bg-secondary"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 h-[400px] flex flex-col items-center justify-center",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {analyzing ? (
              <div className="text-center w-full max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Analyzing Image...
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our AI is examining the skin condition
                </p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  Upload Skin Image
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Drag and drop an image or click to browse. Supported formats: JPG, PNG
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="skin-file-input"
                />
                <Button
                  onClick={() => document.getElementById('skin-file-input')?.click()}
                  className="gradient-primary text-primary-foreground"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Results Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {result ? (
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    getSeverity(result.analysis) === "low"
                      ? "bg-success/10"
                      : getSeverity(result.analysis) === "medium"
                        ? "bg-warning/10"
                        : "bg-destructive/10"
                  )}
                >
                  {getSeverity(result.analysis) === "low" ? (
                    <Check className="w-6 h-6 text-success" />
                  ) : (
                    <AlertTriangle
                      className={cn(
                        "w-6 h-6",
                        getSeverity(result.analysis) === "medium" ? "text-warning" : "text-destructive"
                      )}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    Skin Analysis Complete
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSeverity(result.analysis)} severity
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Detailed Analysis</h4>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.analysis.replace(/\*\*/g, '').replace(/###\s*/g, '')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    This analysis is for informational purposes only. Please consult a dermatologist for professional medical advice.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card border border-border p-6 h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <ScanLine className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                No Analysis Yet
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Upload an image of the skin condition to receive AI-powered analysis and recommendations.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
