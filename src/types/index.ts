import "next-auth";
import { PostType, PostStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username?: string | null;
      isAdmin?: boolean;
    };
  }
}

export type PostWithAuthor = {
  id: string;
  title: string;
  description: string | null;
  type: PostType;
  content: string | null;
  imageUrl: string | null;
  images: string[];
  tags: string[];
  status: PostStatus;
  adminNote: string | null;
  published: boolean;
  viewCount: number;
  salesCount: number;
  price: number | null;
  isFree: boolean;
  rating: number;
  ratingCount: number;
  featured: boolean;
  version: string | null;
  compatibility: string[];
  demoUrl: string | null;
  documentationUrl: string | null;
  supportEmail: string | null;
  toolsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  remixedFromId: string | null;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    badge: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    remixes: number;
    purchases: number;
  };
  likes?: { userId: string }[];
  bookmarks?: { userId: string }[];
  purchases?: { userId: string }[];
};
