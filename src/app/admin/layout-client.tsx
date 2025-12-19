"use client";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { QueryProvider } from "@/providers/query-provider";
import { AdminNav } from "@/components/admin-nav";
import { LogOut, Home, Menu, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  };
}

export function AdminLayoutClient({
  children,
  session,
}: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "LayoutGrid", exact: true },
    {
      href: "/admin/site-settings",
      label: "Site Settings",
      icon: "Settings",
    },
    {
      href: "/admin/banners",
      label: "Banners",
      icon: "Image",
    },
    { href: "/admin/categories", label: "Categories", icon: "Layers" },
    { href: "/admin/products", label: "Products", icon: "Package" },
    { href: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
    {
      href: "/admin/coupons",
      label: "Coupons",
      icon: "Ticket",
    },
    {
      href: "/admin/reviews",
      label: "Reviews",
      icon: "StarIcon",
    },
    {
      href: "/admin/questions",
      label: "Q&A",
      icon: "MessageSquare",
    },
    {
      href: "/admin/homepage",
      label: "Manage Homepage",
      icon: "Star",
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary p-2.5 rounded-xl">
            <Home className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">SuperMart</p>
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3 border">
          <p className="text-sm font-semibold">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
        </div>
      </div>

      <nav className="mt-4 px-3 overflow-y-auto flex-1">
        <AdminNav
          items={menuItems}
          onItemClick={() => setMobileMenuOpen(false)}
        />
      </nav>

      <div className="p-4 border-t bg-card mt-auto space-y-2">
        <Link href="/" target="_blank">
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink className="w-5 h-5" />
            <span>Visit Site</span>
          </Button>
        </Link>
        <form action="/api/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span>{"Logout"}</span>
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-card shadow-sm fixed h-full border-r z-40">
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0 flex flex-col">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 pt-20 lg:pt-0">
          <div className="mx-auto max-w-7xl p-6 lg:p-8 pb-32">{children}</div>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </QueryProvider>
  );
}
