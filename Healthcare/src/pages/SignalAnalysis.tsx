import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Waves,
  Brain,
  Upload,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================= TYPES ================= */

interface BandData {
  power: number;
  status: "normal" | "elevated";
}

interface BandTimePoint {
  time: number;
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
}

interface BackendResponse {
  prediction: string;
  confidence: number;
  bands: {
    delta: BandData;
    theta: BandData;
    alpha: BandData;
    beta: BandData;
  };
  band_timeseries: BandTimePoint[];
  attention_map: number[];
}

interface BandResult {
  band: string;
  power: number;
  status: "normal" | "elevated";
  description: string;
}

interface AttentionPoint {
  time: number;
  importance: number;
}

/* ================= COMPONENT ================= */

export default function SignalAnalysis() {
  const [bands, setBands] = useState<BandResult[]>([]);
  const [bandTimeseries, setBandTimeseries] = useState<BandTimePoint[]>([]);
  const [attention, setAttention] = useState<AttentionPoint[]>([]);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ========== BAND DESCRIPTIONS ========== */
  const getBandDescription = (band: string): string => {
    const descriptions: Record<string, string> = {
      delta: "Deep sleep, healing (0.5-4 Hz)",
      theta: "Meditation, creativity (4-8 Hz)",
      alpha: "Relaxation, calmness (8-13 Hz)",
      beta: "Active thinking, focus (13-30 Hz)"
    };
    return descriptions[band] || "";
  };

  /* ========== FILE UPLOAD ========== */
  const handleUpload = async (file: File) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/eeg/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("EEG analysis failed");

      const data: BackendResponse = await res.json();

      // Transform bands object to array
      const bandsArray: BandResult[] = Object.entries(data.bands).map(([band, info]) => ({
        band: band.charAt(0).toUpperCase() + band.slice(1),
        power: info.power,
        status: info.status,
        description: getBandDescription(band)
      }));

      // Transform attention_map array to AttentionPoint array
      // Filter out NaN and invalid values to prevent chart errors
      const attentionPoints: AttentionPoint[] = data.attention_map
        .map((importance, index) => ({
          time: index,
          importance: importance
        }))
        .filter(point => !isNaN(point.importance) && isFinite(point.importance));

      setBands(bandsArray);
      setBandTimeseries(data.band_timeseries || []);
      setAttention(attentionPoints);
      setPrediction(data.prediction);
      setConfidence(data.confidence);
    } catch (err) {
      setError("Unable to process EEG data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        icon={Activity}
        title="Signal Analysis"
        description="AI-powered EEG signal interpretation with explainability"
      />

      <Tabs defaultValue="eeg" className="space-y-6">

        {/* ================= EEG TAB ================= */}
        <TabsContent value="eeg">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* PREDICTION RESULTS */}
            <motion.div className="lg:col-span-2 bg-card p-6 rounded-2xl border">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg">EEG Analysis</h3>

                <label htmlFor="eeg-file-upload" className="cursor-pointer">
                  <input
                    id="eeg-file-upload"
                    type="file"
                    hidden
                    accept=".csv,.edf,.npy"
                    onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload EEG
                    </span>
                  </Button>
                </label>
              </div>

              {loading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {error && <p className="text-destructive">{error}</p>}

              {prediction && (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">Diagnosis</h4>
                      {prediction === "Healthy" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-1">{prediction}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {confidence}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {prediction === "MDD"
                        ? "The EEG analysis indicates patterns consistent with Major Depressive Disorder. Please consult with a healthcare professional for proper diagnosis and treatment."
                        : "The EEG analysis shows patterns within normal ranges. Continue monitoring as recommended by your healthcare provider."}
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && !prediction && (
                <div className="py-12 text-center text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an EEG file to begin analysis</p>
                </div>
              )}
            </motion.div>

            {/* FREQUENCY BANDS */}
            <motion.div className="space-y-6">
              <div className="bg-card p-5 rounded-2xl border">
                <h3 className="flex items-center gap-2 font-semibold mb-4">
                  <Zap className="w-5 h-5 text-primary" /> Frequency Bands
                </h3>

                {bands.map((b) => (
                  <div key={b.band} className="mb-3 p-3 bg-muted rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{b.band}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">{b.power.toFixed(1)}</span>
                        {b.status === "normal" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>

                    <div className="h-2 bg-border rounded mb-2">
                      <div
                        className="h-full bg-primary rounded transition-all"
                        style={{ width: `${Math.min(b.power, 100)}%` }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ================= BAND TIME-SERIES ================= */}
          {!!bandTimeseries.length && (
            <motion.div className="mt-6 bg-card p-6 rounded-2xl border">
              <h3 className="font-semibold mb-1">
                📊 Frequency Band Activity Over Time
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Visualizes how delta, theta, alpha, and beta band powers change throughout the EEG recording
              </p>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bandTimeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Time Window', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Power', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line dataKey="delta" stroke="#3b82f6" strokeWidth={2} dot={false} name="Delta (0.5-4 Hz)" />
                  <Line dataKey="theta" stroke="#10b981" strokeWidth={2} dot={false} name="Theta (4-8 Hz)" />
                  <Line dataKey="alpha" stroke="#f59e0b" strokeWidth={2} dot={false} name="Alpha (8-13 Hz)" />
                  <Line dataKey="beta" stroke="#ef4444" strokeWidth={2} dot={false} name="Beta (13-30 Hz)" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* ================= EXPLAINABILITY ================= */}
          {!!attention.length && (
            <motion.div className="mt-6 bg-card p-6 rounded-2xl border">
              <h3 className="font-semibold mb-1">
                🧠 EEG Explainability (Attention Map)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Highlights time-segments most influential for AI predictions
              </p>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attention}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Time Window', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Attention Weight', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    dataKey="importance"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="Attention"
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
