import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getClinic } from "@/lib/useClinic";
import { createClient } from "@/utils/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const clinic = getClinic();
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.full_name as string | undefined
    ?? user?.email
    ?? "Staff";

  const userRole = await getSessionRole();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar clinicName={clinic.meta.name} userName={displayName} userRole={userRole} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              {clinic.meta.name} — Admin
            </span>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
