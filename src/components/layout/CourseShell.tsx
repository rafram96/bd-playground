"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { isPageId, type PageId } from "@/lib/navigation";

export default function CourseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "s1";
  const activePage: PageId = isPageId(segment) ? segment : "s1";

  return (
    <div className="app-shell">
      <Sidebar active={activePage} onSelect={(id) => router.push(`/${id}`)} />
      <main className="app-main">{children}</main>
    </div>
  );
}
