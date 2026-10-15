"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Lock,
  Eye,
  Heart,
  Shield,
  Globe,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-8" style={{ color: '#0f4656' }}>
          Settings
        </h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3" style={{ color: '#0f4656' }}>
                <Lock className="w-5 h-5" style={{ color: '#ef864c' }} />
                Account Settings
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">Email Address</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    ahmed@example.com
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60 group-hover:text-[#ef864c] transition-colors" />
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">Phone Number</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    +92 300 123 4567
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60 group-hover:text-[#ef864c] transition-colors" />
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Last changed 2 months ago
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60 group-hover:text-[#ef864c] transition-colors" />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3" style={{ color: '#0f4656' }}>
                <Bell className="w-5 h-5" style={{ color: '#ef864c' }} />
                Notification Preferences
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Order Updates</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Get notified about order status changes
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-border cursor-pointer"
                    style={{ accentColor: '#ef864c' }}
                  />
                </label>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Updates</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Receive promotional emails and deals
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="w-5 h-5 rounded border-border cursor-pointer"
                    style={{ accentColor: '#ef864c' }}
                  />
                </label>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Messages from Sellers
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Get notifications when sellers message you
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-border cursor-pointer"
                    style={{ accentColor: '#ef864c' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3" style={{ color: '#0f4656' }}>
                <Shield className="w-5 h-5" style={{ color: '#ef864c' }} />
                Privacy & Safety
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">
                    Profile Visibility
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Control who can see your profile
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60 group-hover:text-[#ef864c] transition-colors" />
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">Activity Status</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Show when you're online
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-border cursor-pointer"
                    style={{ accentColor: '#ef864c' }}
                  />
                </label>
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Auth</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Add extra security to your account
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60 group-hover:text-[#ef864c] transition-colors" />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3" style={{ color: '#0f4656' }}>
                <Eye className="w-5 h-5" style={{ color: '#ef864c' }} />
                Display Settings
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Use dark theme for the interface
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="w-5 h-5 rounded border-border cursor-pointer"
                    style={{ accentColor: '#ef864c' }}
                  />
                </label>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    English (US)
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/60" />
              </div>
            </div>
          </div>

          {/* Wishlist Settings */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3" style={{ color: '#0f4656' }}>
                <Heart className="w-5 h-5" style={{ color: '#ef864c' }} />
                Wishlist Preferences
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#ef864c' }}
                  />
                  <span className="text-sm text-foreground">
                    Notify me when wishlist items go on sale
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#ef864c' }}
                  />
                  <span className="text-sm text-foreground">
                    Make my wishlist public
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-heading font-bold text-red-700 flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                Danger Zone
              </h2>
            </div>
            <div className="divide-y divide-red-200">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Deactivate Account
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Temporarily disable your account
                  </p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  Deactivate
                </Button>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="flex gap-3">
            <Button 
              className="px-8 text-white"
              style={{ backgroundColor: '#ef864c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            >
              Save Changes
            </Button>
            <Button 
              variant="outline"
              style={{ borderColor: '#ef864c', color: '#ef864c' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef864c20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
