import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export function formatPrice(price: number | null | undefined): string {
  if (!price || price === 0) return "Free";
  return "$" + price.toFixed(2);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export const POST_TYPE_CONFIG = {
  APP:      { label: "App & Tool",     color: "bg-blue-100 text-blue-700 border-blue-200",     emoji: "⚙️",  hex: "#2563eb", desc: "Ready-to-use AI applications" },
  WORKFLOW: { label: "Workflow",       color: "bg-emerald-100 text-emerald-700 border-emerald-200", emoji: "🔄", hex: "#059669", desc: "Automation & pipeline templates" },
  AGENT:    { label: "AI Agent",       color: "bg-purple-100 text-purple-700 border-purple-200",   emoji: "🤖", hex: "#7c3aed", desc: "Autonomous AI agent systems" },
  TEMPLATE: { label: "Template & Kit", color: "bg-orange-100 text-orange-700 border-orange-200",   emoji: "📦", hex: "#ea580c", desc: "Ready-made business templates" },
  PLUGIN:   { label: "Plugin & Extension", color: "bg-pink-100 text-pink-700 border-pink-200",  emoji: "🧩", hex: "#db2777", desc: "Extend your existing tools" },
  DATASET:  { label: "Dataset",        color: "bg-amber-100 text-amber-700 border-amber-200",    emoji: "🗄️",  hex: "#d97706", desc: "Training data & fine-tune sets" },
} as const;

export const TOOLS_OPTIONS = [
  "ChatGPT", "Claude", "Gemini", "Make.com", "n8n", "Zapier",
  "Notion", "Airtable", "Slack", "Shopify", "WordPress",
  "Python", "Node.js", "LangChain", "CrewAI", "AutoGen",
  "Midjourney", "Stable Diffusion", "ElevenLabs", "Runway",
];

export const AVATAR_COLORS = [
  "bg-purple-500","bg-emerald-500","bg-blue-500",
  "bg-amber-500","bg-rose-500","bg-indigo-500","bg-teal-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
