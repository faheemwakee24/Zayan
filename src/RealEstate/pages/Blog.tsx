"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Search,
  Clock,
  TrendingUp,
  Home,
  DollarSign,
  Building2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGetBlogsQuery, useGetBlogCategoriesQuery } from "@/services/redux/api/blogApi";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Fetch blogs - only Real Estate blogs
  const { data: blogsData, isLoading, isError } = useGetBlogsQuery({
    page,
    limit: 12,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    type: "real-estate", // Filter only Real Estate blogs
  });

  // Fetch featured blog - only Real Estate blogs
  const { data: featuredData } = useGetBlogsQuery({
    page: 1,
    limit: 1,
    featured: true,
    type: "real-estate", // Filter only Real Estate blogs
  });

  // Fetch categories - only Real Estate categories
  const { data: categoriesData } = useGetBlogCategoriesQuery({
    type: "real-estate",
  });

  const blogs = blogsData?.blogs || [];
  const featuredBlog = featuredData?.blogs?.[0];
  const categories = categoriesData?.categories || [];

  // Calculate read time
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
      month: "short",
      day: "numeric",
    });
  };

  const categoryOptions = [
    { id: "all", label: "All Posts", icon: Building2 },
    ...categories.map((cat) => ({
      id: cat.name.toLowerCase().replace(/\s+/g, "-"),
      label: cat.name,
      icon: TrendingUp,
    })),
  ];

  const filteredBlogs = blogs.filter((blog) => {
    if (selectedCategory === "all") return true;
    return blog.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory;
  });

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden bg-gradient-to-br from-background via-white to-secondary/5 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm border" style={{ backgroundColor: '#ef864c20', color: '#0f4656', borderColor: '#0f465620' }}>
              <Tag className="w-4 h-4 inline mr-2" style={{ color: '#ef864c' }} />
              Expert Insights
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#0f4656' }}>
              Blogs & Articles
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto mb-8">
              Stay updated with the latest real estate trends, tips, and market insights from industry experts.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border-2 border-primary/10 p-2">
                <Search className="w-5 h-5 text-foreground/40 ml-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-foreground placeholder:text-foreground/40"
                />
                <Button 
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-border/50  backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {categoryOptions.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300",
                    selectedCategory === category.id
                      ? "text-white shadow-lg scale-105"
                      : "bg-background text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  )}
                  style={selectedCategory === category.id ? { backgroundColor: '#ef864c' } : {}}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Blog */}
      {featuredBlog && (
        <section className="py-16 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Featured Article</span>
            </div>
            <Link href={`/real-estate/blog/${featuredBlog.slug}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-primary/20">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto min-h-[400px] overflow-hidden bg-foreground/5">
                    {featuredBlog.featuredImage ? (
                      <Image
                        src={featuredBlog.featuredImage}
                        alt={featuredBlog.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 text-white px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#ef864c' }}>
                      Featured
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                    <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredBlog.publishedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {featuredBlog.authorName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {calculateReadTime(featuredBlog.content, featuredBlog.excerpt)}
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 transition-colors line-clamp-2" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>
                      {featuredBlog.title}
                    </h2>
                    <p className="text-lg text-foreground/70 mb-6 leading-relaxed line-clamp-3">
                      {featuredBlog.excerpt}
                    </p>
                    <div className="flex items-center font-semibold transition-colors" style={{ color: '#ef864c' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'} onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}>
                      Read Full Article
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#0f4656' }}>
              {selectedCategory === "all" ? "All Articles" : categoryOptions.find((c) => c.id === selectedCategory)?.label}
            </h2>
          </div>

          {isLoading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/60">Loading articles...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <p className="text-foreground/60">Failed to load articles. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link key={blog._id} href={`/real-estate/blog/${blog.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col border-2 border-transparent hover:border-primary/20 group">
                    <div className="relative h-48 overflow-hidden bg-foreground/5">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-125 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                          🏠
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col bg-white">
                      <div className="flex items-center gap-3 text-xs text-foreground/50 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {calculateReadTime(blog.content, blog.excerpt)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 transition-colors line-clamp-2" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>
                        {blog.title}
                      </h3>
                      <p className="text-foreground/60 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          <User className="w-4 h-4" />
                          {blog.authorName}
                        </div>
                        <div className="flex items-center font-semibold text-sm transition-colors" style={{ color: '#ef864c' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'} onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}>
                          Read
                          <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !isError && filteredBlogs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground/60">No articles found in this category.</p>
            </div>
          )}

          {blogsData && blogsData.pagination.pages > page && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage(page + 1)}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Load More Articles
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss the latest real estate insights and market updates.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1  h-[44px] px-6 py-4 rounded-2xl text-foreground outline-none"
            />
            <Button 
              size="lg" 
              className="hover:bg-white/90 h-[44px]"
              style={{ backgroundColor: '#ef864c', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
