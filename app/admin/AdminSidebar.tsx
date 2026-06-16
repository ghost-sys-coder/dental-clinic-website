"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import type { Role } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutDashboard, Inbox, Settings, LogOut, Loader2, ArrowUpLeft, Users } from "lucide-react";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-primary/15 text-primary",
  EDITOR: "bg-blue-100 text-blue-700",
  VIEWER: "bg-muted text-muted-foreground",
};

const ALL_NAV = [
  { href: "/admin",             label: "Dashboard",   icon: LayoutDashboard, exact: true,  minRole: "VIEWER"  },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox,           exact: false, minRole: "VIEWER"  },
  { href: "/admin/team",        label: "Team",        icon: Users,           exact: false, minRole: "EDITOR"  },
  { href: "/admin/settings",    label: "Settings",    icon: Settings,        exact: false, minRole: "EDITOR"  },
] as const;

const HIERARCHY: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const local = name.split("@")[0];
    return local.slice(0, 2).toUpperCase();
  }
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function AdminSidebar({
  clinicName,
  userName,
  userRole,
}: {
  clinicName: string;
  userName: string;
  userRole: Role;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const visibleNav = ALL_NAV.filter(
    (item) => HIERARCHY[userRole] >= HIERARCHY[item.minRole as Role]
  );

  function handleConfirm() {
    startTransition(() => signOut());
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex flex-col gap-0.5 px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
              Admin
            </span>
            <span className="text-sm font-semibold text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
              {clinicName}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleNav.map(({ href, label, icon: Icon, exact }) => {
                  const isActive = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                        <Link href={href}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link href="/">
                <ArrowUpLeft />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Sign out"
                className="size-7 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 hover:bg-destructive/15 hover:text-destructive transition-colors group-data-[collapsible=icon]:mx-auto"
              >
                {getInitials(userName)}
              </button>

              <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
                  {userName}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit mt-0.5 ${ROLE_BADGE[userRole]}`}>
                  {ROLE_LABEL[userRole]}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Sign out"
                className="size-6 rounded-md flex items-center justify-center text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be returned to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              disabled={pending}
              className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={pending}
              className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {pending && <Loader2 className="size-3.5 animate-spin" />}
              Sign out
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
