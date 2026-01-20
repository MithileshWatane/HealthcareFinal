import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import ReactQRCode from "react-qr-code"
import { Layout } from "@/components/layout/Layout"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Download, Save, Shield, Lock, QrCode } from "lucide-react"

export default function CompleteProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    dob: "",
    gender: "",
    blood_group: "",
    phone: "",
    emergency_contact: "",
    height: "",
    weight: "",
    diseases: "",
    allergies: "",
    medications: "",
    surgeries: "",
    lifestyle: "",
    notes: ""
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching patient data:", error)
        setLoading(false)
        return
      }

      if (data) {
        setForm({
          dob: data.dob || "",
          gender: data.gender || "",
          blood_group: data.blood_group || "",
          phone: data.phone || "",
          emergency_contact: data.emergency_contact || "",
          height: data.height || "",
          weight: data.weight || "",
          diseases: data.diseases || "",
          allergies: data.allergies || "",
          medications: data.medications || "",
          surgeries: data.surgeries || "",
          lifestyle: data.lifestyle || "",
          notes: data.notes || ""
        })
      }

      setLoading(false)
    }

    fetchPatient()
  }, [user])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async () => {
    if (!user) return

    setSaving(true)
    const { error } = await supabase
      .from("patients")
      .update(form)
      .eq("id", user.id)

    setSaving(false)

    if (error) {
      console.error("Error updating patient:", error)
      return
    }

    navigate("/dashboard")
  }

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = "medical-qr-code.png"
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    )
  }

  const qrUrl = user ? `https://hackmatez11.github.io/QR//index.html?id=${user.id}` : ""


  return (
    <Layout>
      <PageHeader
        icon={User}
        title="Medical Profile"
        description="Complete and manage your comprehensive medical information"
        gradient="bg-primary"
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <div className="space-y-6">


            {/* Basic Information */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 text-lg">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Date of Birth</label>
                  <Input
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Blood Group</label>
                  <select
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Blood Group</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone</label>
                  <Input
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Emergency Contact</label>
                  <Input
                    name="emergency_contact"
                    placeholder="Enter emergency contact"
                    value={form.emergency_contact}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Height (cm)</label>
                  <Input
                    name="height"
                    type="number"
                    placeholder="Enter height"
                    value={form.height}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Weight (kg)</label>
                  <Input
                    name="weight"
                    type="number"
                    placeholder="Enter weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 text-lg">Medical History</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Known Diseases</label>
                  <textarea
                    name="diseases"
                    placeholder="List any chronic conditions or diseases"
                    value={form.diseases}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Allergies</label>
                  <textarea
                    name="allergies"
                    placeholder="List any allergies (medications, food, etc.)"
                    value={form.allergies}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Current Medications</label>
                  <textarea
                    name="medications"
                    placeholder="List all medications you're currently taking"
                    value={form.medications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Past Surgeries</label>
                  <textarea
                    name="surgeries"
                    placeholder="List any previous surgeries or procedures"
                    value={form.surgeries}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Lifestyle</label>
                  <textarea
                    name="lifestyle"
                    placeholder="Smoking, alcohol consumption, exercise habits, etc."
                    value={form.lifestyle}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Any other relevant medical information"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={submit}
              disabled={saving}
              className="w-full gradient-primary text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Medical Profile"}
            </Button>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* QR Code */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Medical QR Code</h3>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-4">
              <div id="qr-code-svg">
                <ReactQRCode value={qrUrl} size={180} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan this QR code to quickly access your medical profile
            </p>
            <Button
              onClick={downloadQR}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>

          {/* Privacy Info */}
          <div className="bg-gradient-to-br from-primary/10 to-purple/10 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Privacy & Security</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                Your data is encrypted
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                HIPAA compliant storage
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                You control access
              </li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">Profile Completion</h4>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="absolute left-0 top-0 h-full gradient-primary rounded-full transition-all"
                style={{
                  width: `${Object.values(form).filter(v => v !== "").length / Object.keys(form).length * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {Object.values(form).filter(v => v !== "").length} of {Object.keys(form).length} fields completed
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}