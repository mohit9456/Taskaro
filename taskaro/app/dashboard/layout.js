import DashboardSidebar from "@/components/DashboardSidebar";

export default function layout({ children }) {
  return (
    <div className="flex min-h-screen bg-(--color-bg)">
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
