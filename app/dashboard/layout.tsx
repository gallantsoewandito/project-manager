import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout ({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
        <Sidebar />
        {/* Main Content Area - offset by 256px (w-64) to account for the sidebar */}
        <main className="pl-64">
            <div className="max-w-7xl mx-auto px-8 py-8">
            {children}
            </div>
        </main>
        </div>
    );
}