"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Globe, Mail, CreditCard, Shield, Palette,
  Save, CheckCircle, AlertCircle, Loader2, ExternalLink, RefreshCw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SiteSettingsData {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  supportPhone: string;
  primaryColor: string;
  accentColor: string;
  enableRegistration: boolean;
  requireApproval: boolean;
  listingFee: string;
  featuredFee: string;
  homepageFee: string;
  stripeConnected: boolean;
  stripeAccountId: string;
}

const defaultSettings: SiteSettingsData = {
  siteName: "Shelby Exchange",
  siteTagline: "The world's premier marketplace for authentic Shelby engineering",
  contactEmail: "support@shelbyexchange.com",
  supportPhone: "(702) 555-0123",
  primaryColor: "#002D72",
  accentColor: "#E31837",
  enableRegistration: true,
  requireApproval: true,
  listingFee: "99",
  featuredFee: "149",
  homepageFee: "299",
  stripeConnected: false,
  stripeAccountId: ""
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "payments" | "security">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [user, setUser] = useState<{id: string} | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = { ...defaultSettings };
        
        data.forEach((item) => {
          const value = item.value as string | boolean | number;
          switch (item.key) {
            case "site_name":
              loadedSettings.siteName = String(value);
              break;
            case "site_tagline":
              loadedSettings.siteTagline = String(value);
              break;
            case "contact_email":
              loadedSettings.contactEmail = String(value);
              break;
            case "support_phone":
              loadedSettings.supportPhone = String(value);
              break;
            case "primary_color":
              loadedSettings.primaryColor = String(value);
              break;
            case "accent_color":
              loadedSettings.accentColor = String(value);
              break;
            case "enable_registration":
              loadedSettings.enableRegistration = Boolean(value);
              break;
            case "require_approval":
              loadedSettings.requireApproval = Boolean(value);
              break;
            case "listing_fee":
              loadedSettings.listingFee = String(value);
              break;
            case "featured_fee":
              loadedSettings.featuredFee = String(value);
              break;
            case "homepage_fee":
              loadedSettings.homepageFee = String(value);
              break;
          }
        });
        
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fall back to localStorage
      const saved = localStorage.getItem("shelby_site_settings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved settings");
        }
      }
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) {
      setSaveMessage({ type: "error", text: "You must be logged in to save changes" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const settingsToSave = [
        { key: "site_name", value: settings.siteName },
        { key: "site_tagline", value: settings.siteTagline },
        { key: "contact_email", value: settings.contactEmail },
        { key: "support_phone", value: settings.supportPhone },
        { key: "primary_color", value: settings.primaryColor },
        { key: "accent_color", value: settings.accentColor },
        { key: "enable_registration", value: settings.enableRegistration },
        { key: "require_approval", value: settings.requireApproval },
        { key: "listing_fee", value: settings.listingFee },
        { key: "featured_fee", value: settings.featuredFee },
        { key: "homepage_fee", value: settings.homepageFee }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            key: setting.key,
            value: setting.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: "key"
          });

        if (error) throw error;
      }

      // Also save to localStorage as backup
      localStorage.setItem("shelby_site_settings", JSON.stringify(settings));
      
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const updateSetting = <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Site Settings</h1>
        <p className="text-gray-500">Configure your marketplace settings, branding, and business rules.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id 
                ? "bg-[#002D72] text-white shadow-lg shadow-[#002D72]/20" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end mb-6 gap-3">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            saveMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {saveMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {saveMessage.text}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E31837] text-white font-bold rounded-lg hover:bg-[#c41530] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {activeTab === "general" && (
          <div className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting("siteName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Site Tagline</label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => updateSetting("siteTagline", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting("contactEmail", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Support Phone</label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) => updateSetting("supportPhone", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                      className="w-14 h-12 rounded-xl border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and headers</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                      className="w-14 h-12 rounded-xl border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for CTAs, highlights, and badges</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Preview</h3>
                <div className="space-y-3">
                  <button 
                    className="px-6 py-3 rounded-xl font-bold text-white transition-colors"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-6 py-3 rounded-xl font-bold text-white transition-colors"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="p-8 max-w-2xl space-y-8">
            {/* Stripe Connect Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Stripe Connection</h2>
              
              <div className={`p-6 rounded-xl border ${settings.stripeConnected ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${settings.stripeConnected ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <CreditCard className={`w-6 h-6 ${settings.stripeConnected ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      {settings.stripeConnected ? 'Stripe Connected' : 'Connect with Stripe'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {settings.stripeConnected 
                        ? 'Your Stripe account is connected and ready to accept payments.'
                        : 'Connect your Stripe account to start accepting payments from sellers.'}
                    </p>
                    
                    {settings.stripeConnected && settings.stripeAccountId && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Account: {settings.stripeAccountId}
                      </p>
                    )}
                    
                    <div className="mt-4 flex gap-3">
                      {!settings.stripeConnected ? (
                        <button
                          onClick={() => {
                            // In production, this would redirect to Stripe Connect OAuth
                            // For now, show instructions
                            alert('To connect Stripe:\n\n1. Go to Stripe Dashboard\n2. Create a Connect application\n3. Add your OAuth redirect URL\n4. Copy the client ID\n\nThen update your .env.local with:\nSTRIPE_CONNECT_CLIENT_ID=your_client_id');
                          }}
                          className="px-6 py-3 bg-[#635BFF] text-white font-bold rounded-xl hover:bg-[#4f49cc] transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Connect with Stripe
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => updateSetting('stripeConnected', false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reconnect
                          </button>
                          <a
                            href="https://dashboard.stripe.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#635BFF] text-white font-medium rounded-lg hover:bg-[#4f49cc] transition-colors flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Stripe Dashboard
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 text-sm mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Create a Stripe account at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-[#002D72] hover:underline">stripe.com</a></li>
                  <li>Enable Stripe Connect in your dashboard</li>
                  <li>Get your publishable and secret keys</li>
                  <li>Add them to your .env.local file</li>
                  <li>Click "Connect with Stripe" above</li>
                </ol>
              </div>
            </div>

            {/* Listing Fees Section */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Listing Fees</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Standard Listing Fee ($)
                  </label>
                  <input
                    type="number"
                    value={settings.listingFee}
                    onChange={(e) => updateSetting("listingFee", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Basic listing on the marketplace</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Featured Listing Fee ($)
                  </label>
                  <input
                    type="number"
                    value={settings.featuredFee}
                    onChange={(e) => updateSetting("featuredFee", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Featured placement in search results</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Homepage Featured Fee ($)
                  </label>
                  <input
                    type="number"
                    value={settings.homepageFee}
                    onChange={(e) => updateSetting("homepageFee", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Premium placement on homepage</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-bold text-gray-900">Enable User Registration</h3>
                  <p className="text-sm text-gray-500">Allow new users to sign up for accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableRegistration}
                    onChange={(e) => updateSetting("enableRegistration", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#002D72]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002D72]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-bold text-gray-900">Require Dealer Approval</h3>
                  <p className="text-sm text-gray-500">Manually approve new dealer registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={(e) => updateSetting("requireApproval", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#002D72]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002D72]"></div>
                </label>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h3 className="font-bold text-yellow-800 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Require 2FA for admin accounts to add an extra layer of security.
                </p>
                <button className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
