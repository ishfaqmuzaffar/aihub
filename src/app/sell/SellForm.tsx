"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn, POST_TYPE_CONFIG, TOOLS_OPTIONS } from "@/lib/utils";
import { Upload, X, ImagePlus, Loader2, Info, CheckCircle, ChevronRight, ChevronLeft, FileUp, AlertCircle } from "lucide-react";

const TYPES = Object.keys(POST_TYPE_CONFIG) as (keyof typeof POST_TYPE_CONFIG)[];
const MAX_IMAGES = 3;
const MAX_IMG_SIZE = 5 * 1024 * 1024;

// Per-category requirements shown to the seller
const CATEGORY_GUIDE: Record<string, { what: string[]; rules: string[]; fileLabel: string; fileHint: string }> = {
  APP: {
    what: ["At least 2 screenshots showing the app working", "A demo URL (live or video)", "A downloadable ZIP with all source files or a setup package", "Step-by-step setup instructions"],
    rules: ["Must be a real working tool, not a concept", "Demo URL must be accessible", "ZIP must include README with setup steps", "Description must clearly explain what problem it solves"],
    fileLabel: "App package (ZIP)",
    fileHint: "Upload a ZIP containing source code, README, and any required config files. Max 100MB.",
  },
  WORKFLOW: {
    what: ["At least 2 screenshots of the workflow in action", "Export file from n8n, Make.com, or Zapier", "Step-by-step setup guide in the description", "List of all required API keys / accounts"],
    rules: ["Must include the actual workflow export file (JSON/blueprint)", "Cannot be a screenshot-only submission", "All external services must be clearly listed", "Must have been tested and confirmed working"],
    fileLabel: "Workflow export file (JSON / blueprint)",
    fileHint: "Upload your n8n JSON, Make.com blueprint, or Zapier export. Max 100MB.",
  },
  AGENT: {
    what: ["At least 2 screenshots or a demo video link", "Full source code as a ZIP", "requirements.txt or package.json included", "Detailed deployment/setup guide"],
    rules: ["Must include working source code", "Cannot be a prompt-only agent", "Must specify all dependencies and API requirements", "Deployment guide must be complete enough to follow without help"],
    fileLabel: "Agent source code (ZIP)",
    fileHint: "Upload a ZIP with all source files, requirements, and README. Max 100MB.",
  },
  TEMPLATE: {
    what: ["At least 2 screenshots of the template in use", "The actual template file (Notion, Airtable, etc.)", "Instructions on how to use/duplicate it", "List of tools/accounts required"],
    rules: ["Must be a fully built template, not empty", "Notion templates must include a share link in description", "Must work without needing to buy other tools", "Screenshots must show real populated data, not empty"],
    fileLabel: "Template file or export",
    fileHint: "Upload your template export file. For Notion, include the share link in your description too. Max 100MB.",
  },
  PLUGIN: {
    what: ["At least 2 screenshots showing the plugin installed and working", "Plugin ZIP ready to install", "Clear compatibility list (WordPress version, browser, etc.)", "Installation guide"],
    rules: ["Must be installable without custom code", "Must list all compatibility requirements", "Cannot conflict with popular existing tools", "Must include uninstall instructions"],
    fileLabel: "Plugin package (ZIP)",
    fileHint: "Upload the installable plugin ZIP. Max 100MB.",
  },
  DATASET: {
    what: ["A sample preview (first 100 rows or example images)", "The full dataset file or download link", "A data card explaining: contents, format, size, license", "Example use case or code snippet"],
    rules: ["Must be original or properly licensed for commercial use", "Must include license information (CC-BY, MIT, etc.)", "Cannot contain personal/private data without consent", "Format must be documented (CSV columns, JSON schema, etc.)"],
    fileLabel: "Dataset file (ZIP / CSV / JSON)",
    fileHint: "Upload your dataset. For large datasets, upload a ZIP or include a download link in your description. Max 100MB.",
  },
};

const STEPS = ["Category", "Details", "Media", "Files", "Pricing", "Review"];

export function SellForm() {
  const router = useRouter();
  const imgRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [type, setType] = useState<string>("APP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [demoUrl, setDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [deliveryFile, setDeliveryFile] = useState<{ file: File; name: string; size: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const guide = CATEGORY_GUIDE[type];

  function handleImages(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const newImgs: { file: File; preview: string }[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) { setError("Only image files allowed"); continue; }
      if (f.size > MAX_IMG_SIZE) { setError(`${f.name} exceeds 5MB`); continue; }
      newImgs.push({ file: f, preview: URL.createObjectURL(f) });
    }
    setImages(prev => [...prev, ...newImgs]);
    setError("");
  }

  function handleDeliveryFile(files: FileList | null) {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.size > 100 * 1024 * 1024) { setError("File exceeds 100MB limit"); return; }
    setDeliveryFile({ file: f, name: f.name, size: f.size });
    setError("");
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (tag && !tags.includes(tag) && tags.length < 10) setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function toggleTool(tool: string) {
    setToolsUsed(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!title.trim() || title.length < 10) return "Title must be at least 10 characters";
      if (!description.trim() || description.length < 100) return `Description must be at least 100 characters (currently ${description.length})`;
      if (!requirements.trim()) return "Setup/requirements instructions are required";
    }
    if (step === 2) {
      if (images.length < 2) return "At least 2 screenshots are required";
    }
    if (step === 3) {
      if (!deliveryFile && !demoUrl) return "You must upload a file OR provide a demo/download URL";
    }
    if (step === 4) {
      if (!isFree && (!price || parseFloat(price) < 5)) return "Minimum price is $5.00";
    }
    return null;
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      setUploading(true);

      // Upload screenshots
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const imgForm = new FormData();
        images.forEach(img => imgForm.append("files", img.file));
        const imgRes = await fetch("/api/upload", { method: "POST", body: imgForm });
        const imgData = await imgRes.json();
        if (!imgRes.ok) throw new Error(imgData.error || "Image upload failed");
        imageUrls = imgData.urls;
      }

      // Upload delivery file
      let fileUrl = "", fileName = "", fileSize = 0;
      if (deliveryFile) {
        const fileForm = new FormData();
        fileForm.append("file", deliveryFile.file);
        const fileRes = await fetch("/api/upload/file", { method: "POST", body: fileForm });
        const fileData = await fileRes.json();
        if (!fileRes.ok) throw new Error(fileData.error || "File upload failed");
        fileUrl = fileData.fileUrl;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      }
      setUploading(false);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, type, content: requirements, tags,
          imageUrl: imageUrls[0] || null,
          images: imageUrls,
          isFree, price: isFree ? null : parseFloat(price),
          version, demoUrl, videoUrl, documentationUrl, supportEmail,
          toolsUsed,
          compatibility: compatibility ? compatibility.split(",").map(s => s.trim()).filter(Boolean) : [],
          requirements,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed"); }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  if (submitted) return (
    <div className="bg-white rounded-2xl border p-12 text-center">
      <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted for review!</h2>
      <p className="text-gray-500 mb-2">Your tool has been submitted and is pending admin approval.</p>
      <p className="text-sm text-gray-400 mb-8">We'll review it within 24–48 hours. You can track the status in your account dashboard.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push("/account")} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          Go to dashboard
        </button>
        <button onClick={() => { setSubmitted(false); setStep(0); setTitle(""); setDescription(""); setImages([]); setDeliveryFile(null); setTags([]); setToolsUsed([]); }}
          className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Submit another
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i < step ? "bg-primary text-white" :
                i === step ? "bg-primary text-white ring-4 ring-primary/20" :
                "bg-gray-100 text-gray-400"
              )}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-primary" : i < step ? "text-gray-700" : "text-gray-400")}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn("w-8 h-0.5 mx-1", i < step ? "bg-primary" : "bg-gray-200")} />}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Step 0: Category */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-1">What are you selling?</h2>
          <p className="text-gray-500 text-sm mb-5">Choose the category that best describes your tool. This determines what information we'll ask you to provide.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPES.map(t => {
              const cfg = POST_TYPE_CONFIG[t];
              const selected = type === t;
              return (
                <button key={t} onClick={() => setType(t)}
                  className={cn("flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    selected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-3xl">{cfg.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
                  </div>
                  {selected && <CheckCircle className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* What's required for this category */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">📋 What you'll need to submit for {POST_TYPE_CONFIG[type as keyof typeof POST_TYPE_CONFIG].label}:</p>
            <ul className="space-y-1">
              {guide.what.map(item => (
                <li key={item} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Quality rules:</p>
            <ul className="space-y-1">
              {guide.rules.map(rule => (
                <li key={rule} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Tell us about your tool</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Title <span className="text-red-500">*</span> <span className="font-normal text-gray-400">(min 10 chars)</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
              placeholder="e.g. Instagram Reel Generator — Full n8n Workflow"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description <span className="text-red-500">*</span> <span className="font-normal text-gray-400">(min 100 chars)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} maxLength={3000}
              placeholder={`What does this ${POST_TYPE_CONFIG[type as keyof typeof POST_TYPE_CONFIG].label} do? Who is it for? What problem does it solve? What results can buyers expect?`}
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
            />
            <p className={cn("text-xs mt-1", description.length < 100 ? "text-red-400" : "text-gray-400")}>{description.length}/3000 {description.length < 100 && `(need ${100 - description.length} more)`}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Setup & Requirements <span className="text-red-500">*</span></label>
            <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={5}
              placeholder={`Step-by-step setup instructions. List all requirements:\n1. What accounts/API keys are needed\n2. How to install/import\n3. How to configure\n4. How to use`}
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Version</label>
              <input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0"
                className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Support Email</label>
              <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@you.com" type="email"
                className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Tools & Technologies Used</label>
            <div className="flex flex-wrap gap-2">
              {TOOLS_OPTIONS.map(tool => (
                <button key={tool} type="button" onClick={() => toggleTool(tool)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    toolsUsed.includes(tool) ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Compatibility <span className="font-normal text-gray-400">(comma separated)</span></label>
            <input value={compatibility} onChange={e => setCompatibility(e.target.value)} placeholder="e.g. Windows, Mac, n8n Cloud, PHP 8.0+"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Tags <span className="font-normal text-gray-400">(press Enter to add, max 10)</span></label>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border bg-gray-50 min-h-[44px]">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-white border rounded-lg text-gray-600">
                  #{tag}<button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder={tags.length === 0 ? "e.g. automation, shopify, n8n..." : ""}
                className="flex-1 min-w-[120px] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Screenshots */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-1">Screenshots <span className="text-red-500">*</span></h2>
          <p className="text-sm text-gray-500 mb-5">Upload at least 2 screenshots showing your tool working. First image is the cover. Max 5MB each, up to 3 images.</p>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-sm text-amber-700">
            <strong>Tips for good screenshots:</strong> Show the tool actually running, include real output/results, avoid blank/empty states. Buyers make purchase decisions based on these.
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 group">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i); })}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  {i === 0 ? "Cover" : `Screenshot ${i + 1}`}
                  {i < 2 && images.length < 2 && " ✓ required"}
                </span>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <div onClick={() => imgRef.current?.click()}
                onDrop={e => { e.preventDefault(); handleImages(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                className={cn("aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all",
                  images.length < 2 ? "border-amber-300 bg-amber-50" : "border-gray-300"
                )}
              >
                <ImagePlus className={cn("w-6 h-6 mb-1", images.length < 2 ? "text-amber-400" : "text-gray-400")} />
                <span className="text-xs text-gray-500">{images.length === 0 ? "Add screenshot 1" : images.length === 1 ? "Add screenshot 2 (required)" : "Add screenshot 3"}</span>
              </div>
            )}
          </div>
          <input ref={imgRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleImages(e.target.files)} />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Demo URL <span className="font-normal text-gray-400">(live demo or video)</span></label>
              <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://demo.yourtool.com" type="url"
                className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Video walkthrough URL</label>
              <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." type="url"
                className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Documentation URL</label>
              <input value={documentationUrl} onChange={e => setDocumentationUrl(e.target.value)} placeholder="https://docs.yourtool.com" type="url"
                className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Files */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Upload your deliverable file</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">📦 {guide.fileLabel}</p>
            <p>{guide.fileHint}</p>
          </div>

          {!deliveryFile ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); handleDeliveryFile(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            >
              <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">ZIP, JSON, CSV, PDF, and more · Max 100MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <FileUp className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{deliveryFile.name}</p>
                <p className="text-sm text-gray-500">{formatBytes(deliveryFile.size)}</p>
              </div>
              <button onClick={() => setDeliveryFile(null)} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={e => handleDeliveryFile(e.target.files)} />

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">No file to upload?</p>
            <p>If your tool is hosted online, you can skip this and make sure your demo URL above points to it. Buyers will access it via the link.</p>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Set your price</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { free: true, label: "🎁 Free", desc: "Give it away to build reputation and followers" },
              { free: false, label: "💰 Paid", desc: "Earn 80% of every sale. Minimum $5.00" },
            ].map(({ free, label, desc }) => (
              <button key={String(free)} type="button" onClick={() => setIsFree(free)}
                className={cn("p-4 rounded-xl border-2 text-left transition-all",
                  isFree === free ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </button>
            ))}
          </div>
          {!isFree && (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Price (USD) <span className="text-red-500">*</span></label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.00" min="5" step="1"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">You earn 80% = <strong className="text-green-600">${price ? (parseFloat(price) * 0.8).toFixed(2) : "0.00"}</strong> per sale</p>
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">💡 Pricing guide:</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>Simple templates or small tools → <strong>$5–$15</strong></p>
                  <p>Workflows & agents → <strong>$19–$49</strong></p>
                  <p>Full systems & complex apps → <strong>$49–$99+</strong></p>
                  <p>Datasets → <strong>$29–$199+</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Review your submission</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: "Category", value: POST_TYPE_CONFIG[type as keyof typeof POST_TYPE_CONFIG].label },
                { label: "Title", value: title },
                { label: "Description length", value: `${description.length} characters` },
                { label: "Screenshots", value: `${images.length} uploaded` },
                { label: "Deliverable file", value: deliveryFile ? deliveryFile.name : demoUrl ? "Demo URL provided" : "⚠️ None provided" },
                { label: "Price", value: isFree ? "Free" : `$${price}` },
                { label: "Tools used", value: toolsUsed.length > 0 ? toolsUsed.join(", ") : "None selected" },
                { label: "Tags", value: tags.length > 0 ? tags.map(t => "#" + t).join(", ") : "None" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 py-2 border-b last:border-0">
                  <span className="text-gray-500 w-40 flex-shrink-0">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Before you submit:</p>
                <ul className="space-y-1 text-amber-700">
                  <li>• Your tool will be reviewed within 24–48 hours</li>
                  <li>• If rejected, you'll see the reason in your dashboard</li>
                  <li>• You can resubmit after making improvements</li>
                  <li>• False or misleading listings will result in account suspension</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => { setStep(s => s - 1); setError(""); }}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 border rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> :
             submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> :
             <><Upload className="w-5 h-5" /> Submit for review</>}
          </button>
        )}
      </div>
    </div>
  );
}
