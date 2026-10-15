"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

// Adapter for Next.js Link that matches React Router's API
export function LinkAdapter({ to, children, className, ...props }: { to: string; children: ReactNode; className?: string; [key: string]: any }) {
  // Convert routes to Next.js format
  const href = to.startsWith("/real-estate/") ? to : `/real-estate${to}`;
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

// Adapter for useNavigate hook
export function useNavigateAdapter() {
  const router = useRouter();
  return (path: string) => {
    const href = path.startsWith("/real-estate/") ? path : `/real-estate${path}`;
    router.push(href);
  };
}

// Adapter for useLocation hook
export function useLocationAdapter() {
  const pathname = usePathname();
  // Remove /real-estate prefix if present
  const normalizedPath = pathname?.replace(/^\/real-estate/, "") || "/";
  return {
    pathname: normalizedPath,
    search: "",
    hash: "",
    state: null,
  };
}

// Re-export Next.js Link with 'to' prop support
export { LinkAdapter as Link };

