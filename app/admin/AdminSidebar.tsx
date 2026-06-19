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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Inbox,
  Settings,
  LogOut,
  Loader2,
  Users,
  CalendarDays,
  ExternalLink,
  HeartPulse,
  UserRound,
  Stethoscope,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<Role, string> = {
  ADMIN:  "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN:  "bg-primary/15 text-primary border border-primary/20",
  EDITOR: "bg-blue-50 text-blue-700 border border-blue-200",
  VIEWER: "bg-muted text-muted-foreground border border-border",
};

// ── Navigation ────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin",             label: "Dashboard",    icon: LayoutDashboard, exact: true,  minRole: "VIEWER" },
    ],
  },
  {
    label: "Patients",
    items: [
      { href: "/admin/patients",    label: "Patients",     icon: UserRound,    exact: false, minRole: "VIEWER" },
      { href: "/admin/submissions", label: "Submissions",  icon: Inbox,        exact: false, minRole: "VIEWER" },
      { href: "/admin/appointments",label: "Appointments", icon: CalendarDays, exact: false, minRole: "VIEWER" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/team",        label: "Team",         icon: Users,        exact: false, minRole: "VIEWER" },
      { href: "/admin/services",    label: "Services",     icon: Stethoscope,  exact: false, minRole: "VIEWER" },
      { href: "/admin/settings",    label: "Settings",     icon: Settings,     exact: false, minRole: "EDITOR" },
    ],
  },
] as const;

const HIERARCHY: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name.split("@")[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  function handleConfirm() {
    startTransition(() => signOut());
  }

  return (
    <>
      <Sidebar collapsible="icon">

        {/* ── Header ── */}
        <SidebarHeader className="border-b border-sidebar-border pb-3">
          <div className="flex items-center gap-3 px-1 pt-1 group-data-[collapsible=icon]:justify-center">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse className="size-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                {clinicName}
              </span>
              <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-widest">
                Admin Portal
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent className="py-2">
          {NAV_GROUPS.map((group, gi) => {
            const visibleItems = group.items.filter(
              (item) => HIERARCHY[userRole] >= HIERARCHY[item.minRole as Role]
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                {gi > 0 && <SidebarSeparator className="my-1" />}
                <SidebarGroup className="py-1">
                  <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-0.5">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visibleItems.map(({ href, label, icon: Icon, exact }) => {
                        const isActive = exact
                          ? pathname === href
                          : pathname.startsWith(href);
                        return (
                          <SidebarMenuItem key={href}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={label}
                              className="rounded-lg"
                            >
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
              </div>
            );
          })}
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="border-t border-sidebar-border pt-3 gap-2">

          {/* Back to site */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Back to site"
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-lg"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User card */}
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
            {/* Avatar */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Sign out"
              title="Sign out"
              className="size-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0 hover:bg-destructive transition-colors shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:mx-auto"
            >
              {getInitials(userName)}
            </button>

            {/* Name + role */}
            <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
                {userName}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit mt-0.5 ${ROLE_BADGE[userRole]}`}>
                {ROLE_LABEL[userRole]}
              </span>
            </div>

            {/* Sign out button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Sign out"
              className="size-6 rounded-md flex items-center justify-center text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Sign-out confirmation dialog */}
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
