import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Image, X, Download, Eye, Trash2, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Document {
  id: string
  patient_id: string
  file_name: string
  file_type: string
  file_url: string
  file_size: number
  category: string
  uploaded_at: string
  description?: string
}

interface PatientDocumentsProps {
  selectedCategory: string
  onDocumentsChange?: (documents: Document[]) => void
}

export default function PatientDocuments({ selectedCategory, onDocumentsChange }: PatientDocumentsProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadCategory, setUploadCategory] = useState("other")
  const [description, setDescription] = useState("")

  const categories = [
    { id: "all", label: "All Documents" },
    { id: "photo", label: "Photos" },
    { id: "report", label: "Lab Reports" },
    { id: "prescription", label: "Prescriptions" },
    { id: "xray", label: "X-Rays" },
    { id: "mri", label: "MRI/CT Scans" },
    { id: "other", label: "Other" }
  ]

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(documents)
    }
  }, [documents, onDocumentsChange])

  const fetchDocuments = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", user.id)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("patient-files")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("patient-files")
        .getPublicUrl(fileName)

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from("patient_documents")
        .insert({
          patient_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_url: urlData.publicUrl,
          file_size: file.size,
          category: uploadCategory,
          description: description
        })

      if (dbError) throw dbError

      await fetchDocuments()
      setDescription("")
      setUploadCategory("other")
      alert("File uploaded successfully!")
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please try again.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const deleteDocument = async (doc: Document) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      // Delete from storage
      const filePath = doc.file_url.split("/patient-files/")[1]
      await supabase.storage.from("patient-files").remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from("patient_documents")
        .delete()
        .eq("id", doc.id)

      if (error) throw error

      await fetchDocuments()
      alert("Document deleted successfully!")
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Error deleting document. Please try again.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const filteredDocuments = selectedCategory === "all"
    ? documents
    : documents.filter(doc => doc.category === selectedCategory)

  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="border border-border rounded-xl p-4 bg-muted/30">
          <h4 className="font-medium text-foreground mb-3">Upload New Document</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Document Type *
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="photo">Photo</option>
                <option value="report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="xray">X-Ray</option>
                <option value="mri">MRI/CT Scan</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description (Optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description"
              />
            </div>
          </div>
          <div className="mt-4">
            <input
              type="file"
              onChange={uploadFile}
              disabled={uploading}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <Button
              asChild
              disabled={uploading}
              className="w-full gradient-primary text-primary-foreground cursor-pointer"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Choose File to Upload"}
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: Images (JPG, PNG), PDF, Word documents. Max size: 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents found. Upload your first document above.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{doc.file_name}</span>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full w-fit mt-1">
                          {categories.find(c => c.id === doc.category)?.label || doc.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {doc.file_type.startsWith("image/") ? "Image" : doc.file_type === "application/pdf" ? "PDF" : "Document"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.file_url, "_blank")}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement("a")
                          a.href = doc.file_url
                          a.download = doc.file_name
                          a.click()
                        }}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc)}
                        className="text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}