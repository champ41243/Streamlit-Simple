import { useReports, useDeleteReport, useCompleteReport } from "@/hooks/use-data";
import { SidebarForm } from "@/components/SidebarForm";
import { KPICard } from "@/components/KPICard";
import { Loader2, Trash2, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getZoneColor } from "@/lib/zoneColors";

export default function Dashboard() {
  const { data: reports, isLoading, isError } = useReports();
  const { mutate: deleteReport } = useDeleteReport();
  const { mutate: completeReport } = useCompleteReport();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [completeId, setCompleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium text-muted-foreground">Loading reports...</span>
      </div>
    );
  }

  if (isError || !reports) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error loading reports</h2>
          <p className="text-red-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalReports = reports.length;
  const completeCount = reports.filter(r => r.status === true).length;
  const incompleteCount = reports.filter(r => r.status === false).length;
  const completionRate = totalReports > 0 ? Math.round((completeCount / totalReports) * 100) : 0;

  const handleDelete = (id: number) => {
    setDeleteId(id);
    deleteReport(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Report removed successfully." });
        setDeleteId(null);
      },
      onError: () => setDeleteId(null)
    });
  };

  const handleComplete = (id: number) => {
    setCompleteId(id);
    completeReport(id, {
      onSuccess: () => {
        toast({ title: "Completed", description: "Report marked as complete." });
        setCompleteId(null);
      },
      onError: () => setCompleteId(null)
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
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Splicing Reports</h1>
              <p className="text-muted-foreground mt-2 text-lg">Track splicing team work and job status.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
              title="Total Reports" 
              value={totalReports} 
              description="Total entries recorded"
              icon="default"
            />
            <KPICard 
              title="Completed" 
              value={completeCount} 
              description={`${completionRate}% completion rate`}
              icon="activity"
            />
            <KPICard 
              title="Pending" 
              value={incompleteCount} 
              description="Awaiting completion"
              icon="trend"
            />
          </div>

          {/* Mobile Form - shown only on mobile */}
          <div className="md:hidden bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <SidebarForm />
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-lg font-bold text-foreground">Report Entries</h3>
                <p className="text-sm text-muted-foreground">Complete list of all splicing work records</p>
              </div>
              <button 
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-slate-50/50 text-muted-foreground">
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Zone</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Chain No</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Team</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Job ID</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">BJ. Or Site</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Routing</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Begin</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">End</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Effect</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 bg-white">
                  {reports.map((row) => {
                    const zoneColor = getZoneColor(row.zone);
                    return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span 
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium font-semibold ${zoneColor.bg} ${zoneColor.text}`}
                        >
                          {row.zone}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{row.chainNo}</td>
                      <td className="px-4 py-3 text-sm">{row.splicingTeam}</td>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{row.jobId}</td>
                      <td className="px-4 py-3 text-sm">{row.bjOrSite}</td>
                      <td className="px-4 py-3 text-sm">{row.routing}</td>
                      <td className="px-4 py-3 text-sm">{row.date}</td>
                      <td className="px-4 py-3 font-mono text-sm">{row.timeBegin}</td>
                      <td className="px-4 py-3 font-mono text-sm">{row.status ? row.timeFinished : ''}</td>
                      <td className="px-4 py-3">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.status ? 'Complete' : 'Not Complete'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{row.effect}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deleteId === row.id}
                          className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all duration-200"
                          title="Delete report"
                          data-testid={`button-delete-${row.id}`}
                        >
                          {deleteId === row.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        {!row.status && (
                          <button
                            onClick={() => handleComplete(row.id)}
                            disabled={completeId === row.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-medium transition-all duration-200 hover-elevate"
                            title="Mark this job as complete"
                            data-testid={`button-finish-job-${row.id}`}
                          >
                            {completeId === row.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Finish</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Finish</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-6 py-12 text-center text-muted-foreground">
                        No reports yet. Add a new entry using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
