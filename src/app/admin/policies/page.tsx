"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/services/client";
import { Button } from "@/components/ui/button";

type PolicyType = "privacy" | "terms" | "cookies";

interface Policy {
  type: PolicyType;
  content: string;
  version: string;
  lastUpdated: string;
}

interface ApiResponse {
  success?: boolean;
  policy?: Policy;
  message?: string;
}

const POLICY_LABELS: Record<PolicyType, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
};

export default function AdminPoliciesPage() {
  const [selectedType, setSelectedType] = useState<PolicyType>("privacy");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const adminToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("zayanAdminToken")
      : null;

  const loadPolicy = async (type: PolicyType) => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}api/policies/${type}`);
      const data: ApiResponse = await res.json();

      if (!res.ok || !data?.success || !data.policy) {
        setPolicy(null);
        setContent("");
        setVersion("");
        setStatus(
          data?.message ||
            "No policy found yet. You can create one and save it below."
        );
        return;
      }

      setPolicy(data.policy);
      setContent(data.policy.content || "");
      setVersion(data.policy.version || "1.0.0");
      setStatus(null);
    } catch (error: any) {
      setPolicy(null);
      setContent("");
      setVersion("");
      setStatus(error?.message || "Failed to load policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy(selectedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const handleSave = async () => {
    if (!adminToken) {
      setStatus(
        "Missing admin token. Please log in as admin and store the JWT in localStorage under 'zayanAdminToken'."
      );
      return;
    }

    if (!content.trim()) {
      setStatus("Content cannot be empty.");
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(
        `${API_URL}api/admin/policies/${selectedType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            content,
            version: version || policy?.version || "1.0.0",
          }),
        }
      );

      const data: ApiResponse = await res.json();

      if (!res.ok || !data?.policy) {
        setStatus(
          data?.message || "Failed to save policy. Please check admin token."
        );
        return;
      }

      setPolicy(data.policy);
      setStatus("Policy saved successfully.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated =
    policy?.lastUpdated &&
    new Date(policy.lastUpdated).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Legal Policies
          </h1>
          <p className="text-sm text-muted-foreground">
            Admin-only editor for Zayan&apos;s global Privacy Policy, Terms of
            Service, and Cookie Policy. Content is shared across Ecommerce and
            Real Estate.
          </p>
          {!adminToken && (
            <p className="text-xs text-destructive">
              Admin JWT token not found in localStorage as
              &nbsp;
              <code className="px-1 py-0.5 rounded bg-muted">
                zayanAdminToken
              </code>
              . API calls to save will fail until you log in via your admin
              backend and store the token.
            </p>
          )}
        </header>

        {/* Policy type selector */}
        <div className="flex flex-wrap gap-3">
          {(Object.keys(POLICY_LABELS) as PolicyType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {POLICY_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-2">
          <p>
            <span className="font-semibold">Editing:</span>{" "}
            {POLICY_LABELS[selectedType]}
          </p>
          {lastUpdated && (
            <p>
              <span className="font-semibold">Last updated:</span>{" "}
              {lastUpdated}
            </p>
          )}
          {policy?.version && (
            <p>
              <span className="font-semibold">Version:</span>{" "}
              {policy.version}
            </p>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={policy?.version || "1.0.0"}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Policy Content (HTML / rich-text from CMS)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Paste sanitized HTML from your CMS, or draft content directly.
              This will be rendered on the public legal pages using
              &nbsp;
              <code className="px-1 py-0.5 rounded bg-muted text-xs">
                dangerouslySetInnerHTML
              </code>
              .
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
              placeholder="<h2>1. Introduction</h2>..."
            />
          </div>
        </div>

        {/* Actions & status */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Changes are saved to the backend and immediately visible on:
            <div className="mt-1 space-x-2">
              <code className="px-1 py-0.5 rounded bg-muted">
                /privacy-policy
              </code>
              <code className="px-1 py-0.5 rounded bg-muted">
                /terms-of-service
              </code>
              <code className="px-1 py-0.5 rounded bg-muted">
                /cookie-policy
              </code>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => loadPolicy(selectedType)}
            >
              {loading ? "Refreshing..." : "Reload"}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </div>

        {status && (
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}


