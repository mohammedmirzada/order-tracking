import { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const metadata: Metadata = {
  title: "Dashboard | Order Tracking System",
  description: "Order tracking dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="dark:invert"
            />
            <div>
              <div className="text-lg font-semibold">Order Tracking</div>
              <div className="text-sm text-muted-foreground">Dashboard</div>
            </div>
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <SidebarNav />
        </ScrollArea>

        <div className="p-4">
          <Separator className="mb-3" />
          <LogoutButton className="w-full" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center gap-3 px-4 md:px-6">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="dark:invert"
                    />
                    <div>
                      <div className="text-lg font-semibold">Order Tracking</div>
                      <div className="text-sm text-muted-foreground">Dashboard</div>
                    </div>
                  </div>
                </div>
                <Separator />
                <ScrollArea className="h-[calc(100vh-140px)]">
                  <SidebarNav />
                </ScrollArea>
                <div className="p-4">
                  <Separator className="mb-3" />
                  <LogoutButton className="w-full" />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="font-medium">Dashboard</div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}