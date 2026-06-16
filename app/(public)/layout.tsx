import type { ReactNode } from "react";
import StickyNav from "@/components/layout/StickyNav";
import SiteFooter from "@/components/layout/SiteFooter";
import FloatingMobileBar from "@/components/layout/FloatingMobileBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StickyNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingMobileBar />
    </>
  );
}
