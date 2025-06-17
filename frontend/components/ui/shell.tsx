// app/layout.tsx or app/shell.tsx or your root layout
import { SidebarProvider } from "@/components/ui/sidebar" // or wherever it's exported
import { AppSidebar } from "@/components/ui/app-sidebar"

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}
