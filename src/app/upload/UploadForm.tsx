"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn, POST_TYPE_CONFIG, TOOLS_OPTIONS } from "@/lib/utils";
import { Upload, X, DollarSign, ImagePlus, Loader2, Info, Clock } from "lucide-react";

const TYPES = Object.keys(POST_TYPE_CONFIG) as (keyof typeof POST_TYPE_CONFIG)[];
const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024;

export function UploadForm({ remixFromId }: { remixFromId?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<string>("APP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [demoUrl, setDemoUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_FILES - images.length;
    if (remaining <= 0) return setError(`Max ${MAX_FILES} images`);
    const newImages: { file: File; preview: string }[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) { setError("Only image files allowed"); continue; }
      if (file.size > MAX_SIZE) { setError(`${file.name} exceeds 5MB`); continue; }
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...newImages]);
    setError("");
  }

  function removeImage(i: number) {
    setImages((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i); });
  }

  function toggleTool(tool: string) {
    setToolsUsed((prev) => prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]);
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (tag && !tags.includes(tag) && tags.length < 10) setTags([...tags, tag]);
      setTagInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");
    if (!isFree && (!price || parseFloat(price) < 5)) return setError("Minimum price is $5.00");
    if (images.length === 0) return setError("At least one screenshot is required");
    setLoading(true);
    setError("");

    try {
      setUploading(true);
      const formData = new FormData();
      images.forEach((img) => formData.append("files", img.file));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
      setUploading(false);

      const { urls } = uploadData;
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, type, content, tags,
          imageUrl: urls[0], images: urls,
          isFree, price: isFree ? null : parseFloat(price),
          version, demoUrl, documentationUrl, supportEmail,
          toolsUsed,
          compatibility: compatibility ? compatibility.split(",").map((s) => s.trim()).filter(Boolean) : [],
          remixedFromId: remixFromId,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed"); }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  if (submitted) return (
    <div className="bg-white rounded-2xl border p-12 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-amber-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Submitted for review</h2>
      <p className="text-gray-500 mb-2">Your tool has been submitted and is pending admin approval.</p>
      <p className="text-sm text-gray-400 mb-8">We review listings within 24–48 hours. You'll be notified once it's approved or if changes are needed.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setImages([]); setTags([]); setToolsUsed([]); }}
          className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Submit another
        </button>
        <button onClick={() => router.push("/account")}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Review notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">All listings require approval</p>
          <p className="text-xs text-amber-700 mt-0.5">Submissions are reviewed within 24–48 hours. We check for quality, accuracy, and completeness. Incomplete listings will be rejected.</p>
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl border p-6">
        <label className="block text-sm font-bold mb-3 text-gray-900">Category <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TYPES.map((t) => {
            const cfg = POST_TYPE_CONFIG[t];
            return (
              <button key={t} type="button" onClick={() => setType(t)}
                className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                  type === t ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <span className="text-2xl">{cfg.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                  <p className="text-xs text-gray-400 leading-tight">{cfg.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">Title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Instagram Reel Automation with n8n" maxLength={100}
            className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description <span className="text-red-500">*</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this tool do? Who is it for? What problem does it solve? What are buyers getting?" rows={4} maxLength={2000}
            className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/2000</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">Setup / Usage Instructions</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Step-by-step setup instructions, requirements, how to use..." rows={5}
            className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none font-mono"
          />
        </div>
      </div>

      {/* Screenshots */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-gray-900 mb-1">Screenshots <span className="text-red-500">*</span></h2>
        <p className="text-xs text-gray-400 mb-4">Up to 3 images, max 5MB each. First image is the cover.</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 group">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">Cover</span>}
            </div>
          ))}
          {images.length < MAX_FILES && (
            <div onClick={() => fileRef.current?.click()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}
              className={cn("aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all",
                images.length === 0 && "col-span-3"
              )}
            >
              <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">{images.length === 0 ? "Click or drag to upload screenshots" : "Add more"}</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Technical details */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Technical Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Compatibility</label>
            <input value={compatibility} onChange={(e) => setCompatibility(e.target.value)} placeholder="Windows, Mac, Linux"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Tools & Technologies Used</label>
          <div className="flex flex-wrap gap-2">
            {TOOLS_OPTIONS.map((tool) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Demo URL</label>
            <input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://demo.example.com" type="url"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Documentation URL</label>
            <input value={documentationUrl} onChange={(e) => setDocumentationUrl(e.target.value)} placeholder="https://docs.example.com" type="url"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Support Email</label>
            <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@you.com" type="email"
              className="w-full px-3 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl border p-6">
        <label className="block text-sm font-bold mb-1.5 text-gray-900">Tags</label>
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border bg-gray-50 min-h-[44px]">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-white border rounded-lg text-gray-600">
              #{tag}<button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="w-3 h-3" /></button>
            </span>
          ))}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
            placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
            className="flex-1 min-w-[120px] text-sm bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-gray-900 mb-3">Pricing</h2>
        <div className="flex gap-3 mb-4">
          {[true, false].map((free) => (
            <button key={String(free)} type="button" onClick={() => setIsFree(free)}
              className={cn("flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                isFree === free ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {free ? "🎁 Free" : "💰 Paid"}
            </button>
          ))}
        </div>
        {!isFree && (
          <div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="29.00" min="5" step="1"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Minimum $5.00 · You keep 80% of every sale</p>
          </div>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

      <button type="submit" disabled={loading || uploading}
        className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
      >
        {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading images...</> :
         loading   ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting for review...</> :
                     <><Upload className="w-5 h-5" /> Submit for review</>}
      </button>
    </form>
  );
}
