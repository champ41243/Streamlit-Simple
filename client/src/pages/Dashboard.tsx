import { useReports, useDeleteReport, useCompleteReport } from "@/hooks/use-data";
import { SidebarForm } from "@/components/SidebarForm";
import { KPICard } from "@/components/KPICard";
import { Loader2, Trash2, ArrowRight, CheckCircle, Pencil, Download, Calendar as CalendarIcon, X, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { getZoneColor } from "@/lib/zoneColors";
import { EditModal } from "@/components/EditModal";
import type { Report } from "@shared/schema";
import * as XLSX from "xlsx";
import { format } from "date-fns";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Dashboard() {
  const { data: reports, isLoading, isError } = useReports();
  const { mutate: deleteReport } = useDeleteReport();
  const { mutate: completeReport } = useCompleteReport();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [completeId, setCompleteId] = useState<number | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const dailyStats = useMemo(() => {
    if (!reports) return [];
    const stats: Record<string, number> = {};
    reports.forEach((r) => {
      const dateKey = r.date.split("T")[0]; 
      stats[dateKey] = (stats[dateKey] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reports]);
  // 👇 เพิ่มตัวกรอง: ให้โชว์เฉพาะงานของวันที่เลือก
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter(r => r.date === format(date, 'yyyy-MM-dd'));
  }, [reports, date]);
// 👇 วางตรงนี้เลยครับ (บรรทัด 55)
  const totalReports = filteredReports.length;
  const completeCount = filteredReports.filter(r => r.status === true).length;
  const incompleteCount = filteredReports.filter(r => r.status === false).length;
  const completionRate = totalReports > 0 ? Math.round((completeCount / totalReports) * 100) : 0;
  const modifiers = {
    hasJob: (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return dailyStats.some(s => s.date === dateString);
    }
  };
  const modifiersStyles = {
    hasJob: { 
      fontWeight: 'bold',
      color: '#10b981',
      textDecoration: 'underline'
    }
  };

  const handleExportExcel = () => {
    if (!reports || reports.length === 0) {
      toast({ title: "No data", description: "There are no reports to export." });
      return;
    }

    const data = reports.map((report) => ({
      Zone: report.zone,
      "Chain No": report.chainNo,
      Team: report.splicingTeam,
      Name: report.name,
      "Job ID": report.jobId,
      "BJ. Or Site": report.bjOrSite,
      Routing: report.routing,
      Date: report.date,
      GPS: report.gpsCoordinates || "",
      "Time Begin": report.timeBegin || "",
      "Time Finished": report.timeFinished || "",
      Status: report.status ? "Complete" : "Not Complete",
      Effect: report.effect || "",
      "Problem Details": report.problemDetails || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `splicing-reports-${timestamp}.xlsx`);

    toast({ title: "Export complete", description: "Reports exported to Excel successfully." });
  };

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

  

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 
  ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50/50'}`}>
      <aside className="hidden md:block w-80 h-full bg-background border-r border-border z-20">
        <SidebarForm />
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col">
                <h1 className={`text-4xl font-bold tracking-tight font-display transition-colors duration-500 
                  ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  OMC Daily Report
                </h1>
                <p className={`mt-2 text-lg transition-colors duration-500 
                  ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                  Track splicing team work and job status.
                </p>
              </div>
            
           <div className="flex items-center gap-3">
            
            {/* 1. Live Data (ย้ายมาไว้ข้างหน้า) */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </div>

            {/* 2. Calendar (ย้ายมาไว้ข้างหลัง) */}
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar View</span>
              </button>

              {showCalendar && (
                <div className="fixed left-1/2 top-24 -translate-x-1/2 z-50 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 w-[90vw] max-w-[320px] md:absolute md:top-12 md:right-0 md:left-auto md:translate-x-0 md:w-auto"> 
                  {/* 👆 สูตรแก้: มือถือขยับซ้ายนิดนึง (-50px) กันตกขอบ, คอมฯชิดขวาปกติ */}
                  
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-700">Jobs per Day</h3>
                    <button onClick={() => setShowCalendar(false)} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* 👇 เพิ่ม div ครอบ เพื่อให้ตัวเลขลอยออกนอกกรอบได้ไม่แหว่ง */}
                <div className="flex justify-center overflow-visible p-2">
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) setDate(d);
                      // setShowCalendar(false);
                    }}
                    className="border-0 p-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-full transition-colors",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                      day_today: "bg-slate-100 text-slate-900",
                      day_outside: "text-slate-500 opacity-50",
                      day_disabled: "text-slate-500 opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                    components={{
                      DayContent: ({ date: dayDate }) => {
                        const formattedDate = format(dayDate, 'yyyy-MM-dd');
                        // ดึงจำนวนงาน (ตัดเวลาทิ้ง)
                        const count = (reports || []).filter(r => 
                          (r.date && r.date.toString().split('T')[0] === formattedDate)
                        ).length;

                        const isSelected = format(date, 'yyyy-MM-dd') === formattedDate;

                        return (
                          <div className="relative flex items-center justify-center w-full h-full">
                            <span>{dayDate.getDate()}</span>
                            
                            {/* Badge ตัวเลขลอยเด่น (อยู่บนสุด z-50) */}
                            {count > 0 && (
                              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white z-50
                                ${isSelected 
                                  ? 'bg-white text-blue-600' 
                                  : 'bg-blue-600 text-white'
                                }`}>
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      }
                    }}
                    footer={
                      <div className="mt-4 text-xs text-center text-slate-500">
                        *Selected date shows detailed reports below
                      </div>
                    }
                  />
                </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-500'}`}
            >
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

          </div>
          
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

          {/* 👇 เปลี่ยนสีพื้นหลังกล่อง และสีขอบ ตามโหมด */}
      <div className={`p-6 rounded-xl border shadow-sm transition-all duration-300
        ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-border/60'}`}>
        
        {/* 👇 เปลี่ยนสีตัวหนังสือหัวข้อ */}
        <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 
          ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          Daily Work Summary
        </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => {
                       const date = new Date(value);
                       return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                     {dailyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:hidden bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <SidebarForm />
          </div>

          {/* 👇 เปลี่ยนสีพื้นหลังตาราง (Report Entries) */}
        <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300
          ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-border/60'}`}>
          
          {/* 👇 ส่วนหัวของตาราง */}
          <div className={`p-6 border-b flex justify-between items-center transition-colors
            ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/30 border-border/40'}`}>
            <div>
              <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Report Entries
              </h3>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                Complete list of all splicing work records
              </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-medium transition-colors"
                  data-testid="button-export-excel"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="">
                  <tr className={`border-b transition-colors text-sm uppercase tracking-wider font-medium
            ${isDarkMode 
              ? 'border-slate-800 bg-slate-900/80 text-slate-400' 
              : 'border-border/50 bg-slate-50/50 text-muted-foreground'
            }`}>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Zone</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Chain No</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Team</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Job ID</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">BJ. Or Site</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Routing</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">GPS</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Begin</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">End</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Effect</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Problems</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-zinc-800' : 'divide-border/30 bg-white'}`}>
                  {filteredReports.map((row) => {
                    const zoneColor = getZoneColor(row.zone);
                    return (
                      <tr key={row.id} className={`transition-colors border-b ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/50 text-zinc-300' : 'border-border/50 hover:bg-slate-50 text-slate-700'}`}>
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
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate font-mono text-xs">{row.gpsCoordinates || '-'}</td>
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
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-normal break-words min-w-[300px]">
  {row.effect}
</td>
                        {/* แก้บรรทัด 436 ด้วยก็ได้ครับ ถ้าอยากให้เห็นรายละเอียดปัญหาครบๆ */}
<td className="px-4 py-3 text-sm text-muted-foreground whitespace-normal break-words min-w-[300px]">
  {row.problemDetails || '-'}
</td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingReport(row)}
                            className="text-slate-400 hover:text-primary hover:bg-primary/10 p-2 rounded-md transition-all duration-200"
                            title="Edit report"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={deleteId === row.id}
                            className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all duration-200"
                            title="Delete report"
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-medium"
                              title="Mark this job as complete"
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
                      <td colSpan={15} className="px-6 py-12 text-center text-muted-foreground">
                        No reports yet. Add a new entry using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-border/40 bg-background flex justify-center">
              <button 
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="py-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Developed by <span className="text-slate-600 font-bold">Champ คนดีคนนี้นี่เองเป็นคนทำ</span> © 2025
            </p>
          </div>
          </div>

          {editingReport && (
            <EditModal
              report={editingReport}
              isOpen={Boolean(editingReport)}
              onClose={() => setEditingReport(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}