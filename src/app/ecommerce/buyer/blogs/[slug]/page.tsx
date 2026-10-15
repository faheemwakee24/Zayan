"use client";

import { useParams } from "next/navigation";
import BuyerLayout from "@/components/BuyerLayout";
import { useGetBlogBySlugQuery } from "@/services/redux/api/blogApi";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage() {
  const params = useParams();
  const slug =params ? params.slug as string :"";

  const { data, isLoading, isError } = useGetBlogBySlugQuery(slug);

  const blog = data?.blog;

  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (isError || !blog) {
    return (
      <BuyerLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "#0f4656" }}
          >
            Blog Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/ecommerce/buyer/blogs">
            <Button>Back to Blogs</Button>
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/ecommerce/buyer/blogs">
          <Button variant="ghost" className="mb-6 gap-2" style={{ color: "#0f4656" }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Button>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: "#0f4656", color: "white" }}
            >
              {blog.category}
            </span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {calculateReadTime(blog.content)}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {blog.authorName}
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl font-heading font-bold mb-4"
            style={{ color: "#0f4656" }}
          >
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center text-white font-bold text-lg">
              {blog.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{blog.authorName}</p>
              <p className="text-sm text-muted-foreground">Author</p>
            </div>
          </div>
        </footer>
      </article>
    </BuyerLayout>
  );
}

