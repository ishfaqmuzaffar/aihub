import { PrismaClient, PostType, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");
  const password = await bcrypt.hash("password123", 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@aiforest.dev" },
    update: {},
    create: { email: "admin@aiforest.dev", name: "Admin", username: "admin", password, isAdmin: true, badge: "Admin" },
  });

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "alex@aiforest.dev" }, update: {}, create: { email: "alex@aiforest.dev", name: "Alex Chen", username: "alexchen", password, bio: "Building AI automation tools for marketers.", badge: "Top Seller", totalSales: 312, totalEarnings: 4890 } }),
    prisma.user.upsert({ where: { email: "priya@aiforest.dev" }, update: {}, create: { email: "priya@aiforest.dev", name: "Priya S", username: "priya_s", password, bio: "AI engineer building production-grade agents.", totalSales: 89, totalEarnings: 2100 } }),
    prisma.user.upsert({ where: { email: "miko@aiforest.dev" }, update: {}, create: { email: "miko@aiforest.dev", name: "Miko Dev", username: "dev_miko", password, bio: "Workflow automation specialist.", totalSales: 201, totalEarnings: 3200 } }),
  ]);

  const posts = [
    {
      title: "Instagram Reel Generator — Full n8n Workflow",
      description: "Fully automated Instagram Reel pipeline. Input a topic, get a script, voiceover, captions, and scheduled post — all hands-free. Saves 3-4 hours per reel.",
      type: PostType.WORKFLOW,
      content: "1. Import the n8n workflow JSON\n2. Connect your OpenAI API key\n3. Connect ElevenLabs for voice\n4. Set your Instagram credentials\n5. Trigger with any topic and watch it run",
      tags: ["instagram", "automation", "content", "n8n", "reels"],
      isFree: false, price: 39.00, status: PostStatus.APPROVED, published: true,
      featured: true, salesCount: 198, viewCount: 5600, rating: 4.9, ratingCount: 87,
      version: "2.1.0", toolsUsed: ["n8n", "ChatGPT", "ElevenLabs"],
      compatibility: ["n8n Cloud", "n8n Self-hosted"],
      authorId: users[2].id,
    },
    {
      title: "Shopify AI Product Description Agent",
      description: "Claude-powered agent that reads your Shopify products and rewrites every description for SEO and conversion. Processes 100 products in under 10 minutes.",
      type: PostType.AGENT,
      content: "Requirements:\n- Shopify API key\n- Claude API key\n- Python 3.10+\n\nRun: pip install -r requirements.txt\nThen: python agent.py --store YOUR_STORE",
      tags: ["shopify", "ecommerce", "seo", "claude", "agent"],
      isFree: false, price: 49.00, status: PostStatus.APPROVED, published: true,
      featured: true, salesCount: 134, viewCount: 4200, rating: 4.8, ratingCount: 56,
      version: "1.3.0", toolsUsed: ["Claude", "Python", "Shopify"],
      compatibility: ["Python 3.10+", "Shopify Basic+"],
      authorId: users[0].id,
    },
    {
      title: "Cold Email AI System — 10x Reply Rates",
      description: "Paste a LinkedIn URL, get a hyper-personalized cold email in 30 seconds. Includes follow-up sequences and A/B test variants. Used by 50+ agencies.",
      type: PostType.APP,
      content: "Built with: Next.js + Claude API\nDeploy to Vercel in one click.\nIncludes: Email generator, sequence builder, analytics dashboard.",
      tags: ["sales", "email", "outreach", "cold-email", "b2b"],
      isFree: false, price: 29.00, status: PostStatus.APPROVED, published: true,
      featured: false, salesCount: 89, viewCount: 3100, rating: 4.7, ratingCount: 34,
      version: "1.0.0", toolsUsed: ["Claude", "Node.js"],
      compatibility: ["Web browser", "Vercel"],
      authorId: users[0].id,
    },
    {
      title: "AI Meeting Notes → CRM Action Items",
      description: "Paste any meeting transcript, get structured action items, follow-ups, and one-click sync to HubSpot or Notion. Works with Zoom, Teams, Fireflies exports.",
      type: PostType.WORKFLOW,
      content: "Make.com workflow — import the blueprint JSON and connect:\n1. Your AI provider (OpenAI or Claude)\n2. HubSpot or Notion destination\n3. Set trigger to email or webhook",
      tags: ["crm", "meetings", "hubspot", "notion", "automation"],
      isFree: true, status: PostStatus.APPROVED, published: true,
      featured: false, salesCount: 0, viewCount: 2800, rating: 4.6, ratingCount: 45,
      version: "1.1.0", toolsUsed: ["Make.com", "ChatGPT", "Notion", "Airtable"],
      compatibility: ["Make.com"],
      authorId: users[2].id,
    },
    {
      title: "AI Customer Support Agent — GPT-4 + Zendesk",
      description: "Production-ready support agent that handles 80% of tickets automatically. Escalates to human when unsure. Includes FAQ training, tone control, and full audit log.",
      type: PostType.AGENT,
      content: "Full Python package with Zendesk webhooks.\nRequires: Python 3.11, OpenAI API, Zendesk Admin token\nSetup takes 15 minutes.",
      tags: ["support", "zendesk", "customer-service", "agent", "automation"],
      isFree: false, price: 79.00, status: PostStatus.APPROVED, published: true,
      featured: true, salesCount: 67, viewCount: 3800, rating: 4.9, ratingCount: 29,
      version: "3.0.0", toolsUsed: ["ChatGPT", "Python", "LangChain"],
      compatibility: ["Python 3.11+", "Zendesk Suite"],
      authorId: users[1].id,
    },
    {
      title: "Notion AI Business OS — Complete Template",
      description: "Everything you need to run a business in Notion: CRM, project tracker, finance dashboard, team wiki, OKRs — all AI-enhanced with ready-made automations.",
      type: PostType.TEMPLATE,
      content: "Duplicate the Notion template to your workspace.\nAll databases are pre-linked.\nAI automations require Notion AI add-on.",
      tags: ["notion", "business", "template", "crm", "productivity"],
      isFree: false, price: 19.00, status: PostStatus.APPROVED, published: true,
      featured: false, salesCount: 245, viewCount: 6700, rating: 4.8, ratingCount: 123,
      version: "4.2.0", toolsUsed: ["Notion", "ChatGPT"],
      compatibility: ["Notion (any plan)"],
      authorId: users[0].id,
    },
    {
      title: "E-commerce Product Photo Dataset — 50k Images",
      description: "50,000 labeled product photos across 200 categories, formatted for fine-tuning image models. Includes COCO annotations, train/val/test splits, and data cards.",
      type: PostType.DATASET,
      content: "Available as:\n- ZIP download (45GB)\n- Hugging Face dataset (streaming)\n- S3 bucket access\nLicense: CC-BY-4.0 commercial use permitted.",
      tags: ["dataset", "computer-vision", "ecommerce", "training-data"],
      isFree: false, price: 99.00, status: PostStatus.APPROVED, published: true,
      featured: false, salesCount: 23, viewCount: 1200, rating: 4.7, ratingCount: 11,
      version: "1.0.0", toolsUsed: ["Stable Diffusion"],
      compatibility: ["PyTorch", "TensorFlow", "Hugging Face"],
      authorId: users[1].id,
    },
    {
      title: "WordPress AI SEO Plugin",
      description: "Automatically generates meta descriptions, optimizes headings, suggests internal links, and scores content for SEO — all powered by GPT-4 inside WordPress.",
      type: PostType.PLUGIN,
      content: "Upload the .zip to WordPress Plugins.\nActivate and enter your OpenAI API key.\nWorks with Gutenberg and Classic editor.",
      tags: ["wordpress", "seo", "plugin", "content", "chatgpt"],
      isFree: false, price: 24.00, status: PostStatus.APPROVED, published: true,
      featured: false, salesCount: 156, viewCount: 4400, rating: 4.6, ratingCount: 78,
      version: "2.0.1", toolsUsed: ["ChatGPT", "WordPress"],
      compatibility: ["WordPress 6.0+", "PHP 8.0+"],
      authorId: users[2].id,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log(`Seeded ${posts.length} posts.`);
  console.log("Admin login: admin@aiforest.dev / password123");
  console.log("Test users: alex@aiforest.dev, priya@aiforest.dev, miko@aiforest.dev / password123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
