"use client";

import BuyerLayout from "@/components/BuyerLayout";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  ArrowRight,
  Clock,
  TrendingUp,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetBlogsQuery, useGetBlogCategoriesQuery } from "@/services/redux/api/blogApi";
import Image from "next/image";

export default function BlogsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Fetch blogs - only E-commerce blogs
  const { data: blogsData, isLoading, isError } = useGetBlogsQuery({
    page,
    limit: 12,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    type: "ecommerce", // Filter only E-commerce blogs
  });

  // Fetch featured blog - only E-commerce blogs
  const { data: featuredData } = useGetBlogsQuery({
    page: 1,
    limit: 1,
    featured: true,
    type: "ecommerce", // Filter only E-commerce blogs
  });

  // Fetch categories - only E-commerce categories
  const { data: categoriesData } = useGetBlogCategoriesQuery({
    type: "ecommerce",
  });

  const blogs = blogsData?.blogs || [];
  const featuredBlog = featuredData?.blogs?.[0];
  const categories = categoriesData?.categories || [];

  // Calculate read time (rough estimate: 200 words per minute)
  const calculateReadTime = (content: string | undefined, excerpt?: string) => {
    // Use content if available, otherwise fall back to excerpt
    const text = content || excerpt || "";
    if (!text) return "1 min read";
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200) || 1;
    return `${minutes} min read`;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const allCategories = ["All", ...categories.map((cat) => cat.name)];

  return (
    <BuyerLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-white via-[#0f4656]/5 to-background">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 via-primary-300/20 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-secondary-400/25 via-secondary-300/15 to-transparent rounded-full blur-3xl animate-float-slow"></div>
          </div>

          <div className="  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: "#0f4656", color: "white" }}
              >
                Our Blog
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-tight">
              Insights, Tips &{" "}
              <span className="bg-gradient-to-r from-[#0f4656] via-[#0f4656] to-[#ef864c] bg-clip-text text-transparent">
                Trends
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Stay updated with the latest e-commerce trends, selling strategies,
              buying guides, and platform updates. Learn from experts and grow
              your business.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredBlog && (
          <section className="py-16 bg-white">
            <div className="  mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2
                  className="text-2xl font-heading font-bold mb-2 flex items-center gap-2"
                  style={{ color: "#0f4656" }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: "#ef864c" }} />
                  Featured Article
                </h2>
                <p className="text-muted-foreground">
                  Don&apos;t miss our most popular post this week
                </p>
              </div>

              <Link href={`/ecommerce/buyer/blogs/${featuredBlog.slug}`}>
                <div className="bg-gradient-to-br from-white to-background rounded-2xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto bg-gradient-to-br from-[#0f4656] via-[#0f4656] to-[#ef864c] flex items-center justify-center">
                      {featuredBlog.featuredImage ? (
                        <Image
                          src={featuredBlog.featuredImage}
                          alt={featuredBlog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-8xl">📈</div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-bold">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#0f4656", color: "white" }}
                        >
                          {featuredBlog.category}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(featuredBlog.publishedAt)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {calculateReadTime(featuredBlog.content, featuredBlog.excerpt)}
                        </div>
                      </div>
                      <h3
                        className="text-3xl font-heading font-bold mb-4 group-hover:opacity-90 transition-colors"
                        style={{ color: "#0f4656" }}
                      >
                        {featuredBlog.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {featuredBlog.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center text-white font-bold">
                            {featuredBlog.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {featuredBlog.authorName}
                            </p>
                            <p className="text-xs text-muted-foreground">Author</p>
                          </div>
                        </div>
                        <Button
                          className="gap-2 group-hover:gap-3 transition-all shadow-lg hover:shadow-xl"
                          style={{ backgroundColor: "#ef864c" }}
                        >
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Categories & Posts */}
        <section className="py-16 bg-gradient-to-b from-background via-white to-background">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filter */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center gap-3 justify-center">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                    className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${
                      selectedCategory === category
                        ? "shadow-lg text-white"
                        : "bg-white text-foreground hover:bg-[#0f4656]/5 border-border"
                    }`}
                    style={
                      selectedCategory === category
                        ? { backgroundColor: "#ef864c", borderColor: "#ef864c" }
                        : undefined
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading articles...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Failed to load articles
                </h3>
                <p className="text-muted-foreground mb-6">
                  Please try again later
                </p>
              </div>
            )}

            {/* Blog Posts Grid */}
            {!isLoading && !isError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((post) => (
                    <Link key={post._id} href={`/ecommerce/buyer/blogs/${post.slug}`}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                        <div className="relative h-48 bg-gradient-to-br from-[#0f4656]/10 via-[#0f4656]/5 to-[#ef864c]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-6xl">📝</div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold"
                              style={{ color: "#0f4656" }}
                            >
                              {post.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {calculateReadTime(post.content, post.excerpt)}
                            </div>
                          </div>

                          <h3
                            className="font-heading font-bold text-lg mb-3 group-hover:opacity-90 transition-colors line-clamp-2"
                            style={{ color: "#0f4656" }}
                          >
                            {post.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center text-white text-xs font-bold">
                                {post.authorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-foreground">
                                {post.authorName}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              style={{ color: "#0f4656" }}
                            >
                              Read
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {blogsData && blogsData.pagination.pages > page && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setPage(page + 1)}
                    >
                      Load More Articles
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {blogs.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                      No articles found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try selecting a different category or search term
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory("All");
                        setSearchQuery("");
                        setPage(1);
                      }}
                    >
                      View All Articles
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section
          className="py-20 text-white relative overflow-hidden"
          style={{ backgroundColor: "#0f4656" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-float-slow" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Stay Updated
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter and never miss a new article, tip, or
              platform update.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-white/40 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
              />
              <Button
                size="lg"
                className="gap-2 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: "#ef864c", color: "white" }}
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BuyerLayout>
  );
}
