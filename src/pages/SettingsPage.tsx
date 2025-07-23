import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sidebar navigation items (keep in sync with Sidebar.tsx)
const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Area Calculator", href: "/calculator" },
  { name: "Disease Detection", href: "/disease" },
  { name: "Cost Planning", href: "/cost-planning" },
  { name: "Equipment Rental", href: "/equipment-rental" },
  { name: "Farm Supply", href: "/farm-supply" },
  { name: "News & Markets", href: "/market-intelligence" },
  { name: "Suppliers", href: "/suppliers" }
];

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' },
];

const SettingsPage: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const [showSaved, setShowSaved] = useState(false);

  const handleHomepageChange = (value: string) => {
    setSettings((prev) => ({ ...prev, homepage: value }));
    setShowSaved(true);
  };

  const handleThemeChange = (value: string) => {
    setSettings((prev) => ({ ...prev, theme: value }));
    setShowSaved(true);
  };

  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your application preferences</p>
        {showSaved && (
          <div className="mt-2 text-green-600 font-semibold">Settings saved!</div>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="homepage">Default Homepage</Label>
              <Select value={settings.homepage} onValueChange={handleHomepageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default homepage" />
                </SelectTrigger>
                <SelectContent>
                  {navigationItems.map((item) => (
                    <SelectItem key={item.href} value={item.href}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;