import { Suspense } from "react";
import MainShell from "@/components/layout/MainShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <MainShell>{children}</MainShell>
    </Suspense>
  );
}
