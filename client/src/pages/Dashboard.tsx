import { useDataPoints, useDeleteDataPoint } from "@/hooks/use-data";
import { SidebarForm } from "@/components/SidebarForm";
import { KPICard } from "@/components/KPICard";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from "recharts";
import { Loader2, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  Sales: "#ec4899",   // Pink
  Users: "#3b82f6",   // Blue
  Traffic: "#8b5cf6", // Violet
  Revenue: "#f43f5e", // Rose (Primary)
};

export default function Dashboard() {
  const { data: dataPoints, isLoading, isError } = useDataPoints();
  const { mutate: deleteData } = useDeleteDataPoint();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (isError || !dataPoints) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error loading data</h2>
          <p className="text-red-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const totalValue = dataPoints.reduce((sum, item) => sum + item.value, 0);
  const avgValue = dataPoints.length > 0 ? Math.round(totalValue / dataPoints.length) : 0;
  const count = dataPoints.length;

  // Prepare Chart Data
  const chartData = [...dataPoints].sort((a, b) => 
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  const handleDelete = (id: number) => {
    setDeleteId(id);
    deleteData(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Row removed successfully." });
        setDeleteId(null);
      },
      onError: () => setDeleteId(null)
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      {/* Sidebar Area */}
      <aside className="hidden md:block w-80 h-full shadow-xl shadow-slate-200 z-20">
        <SidebarForm />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Executive Overview</h1>
              <p className="text-muted-foreground mt-2 text-lg">Real-time performance metrics and analytics.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Connection
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
              title="Total Metrics Value" 
              value={totalValue.toLocaleString()} 
              description="Sum of all recorded data points"
              icon="trend"
            />
            <KPICard 
              title="Average Performance" 
              value={avgValue.toLocaleString()} 
              description="Mean value across all categories"
              icon="activity"
            />
            <KPICard 
              title="Total Records" 
              value={count} 
              description="Number of data entries in database"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart */}
            <div className="chart-container">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground">Value progression over time</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="chart-container">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">Category Distribution</h3>
                <p className="text-sm text-muted-foreground">Value breakdown by category</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="category" 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-lg font-bold text-foreground">Raw Data</h3>
                <p className="text-sm text-muted-foreground">Detailed view of all records</p>
              </div>
              <button 
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Simple scroll top for now
              >
                Back to top <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-slate-50/50 text-muted-foreground">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ID</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Label</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Category</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Value</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 bg-white">
                  {dataPoints.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-muted-foreground text-xs">#{row.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{row.label}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[row.category]}15`, // 15% opacity
                            color: CATEGORY_COLORS[row.category]
                          }}
                        >
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-right">{row.value.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deleteId === row.id}
                          className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all duration-200"
                          title="Delete record"
                        >
                          {deleteId === row.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dataPoints.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No data available. Add some metrics from the sidebar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Form Sheet - Visible only on small screens */}
      {/* For simplicity in this iteration, sidebar is hidden on mobile, 
          in a real app we'd add a Sheet trigger here */}
    </div>
  );
}
