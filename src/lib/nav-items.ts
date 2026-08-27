import {
  LayoutDashboard,
  Users,
  GitBranch,
  MapPin,
  Wallet,
  Building2,
  Lightbulb,
  Settings,
} from "lucide-react";

// `labelKey` looks up the label in the `nav` namespace of messages/*.json;
// see Sidebar.tsx / Header.tsx / MobileNav.tsx for usage via useTranslations("nav").
export const NAV_ITEMS = [
  { labelKey: "overview", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "agents", href: "/agents", icon: Users },
  { labelKey: "pipeline", href: "/pipeline", icon: GitBranch },
  { labelKey: "leads", href: "/leads", icon: MapPin },
  { labelKey: "commission", href: "/commission", icon: Wallet },
  { labelKey: "communities", href: "/communities", icon: Building2 },
  { labelKey: "insights", href: "/insights", icon: Lightbulb },
  { labelKey: "settings", href: "/settings", icon: Settings },
] as const;
