// @ts-nocheck
import { Report } from "@shared/schema";
import { useUpdateReport } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";

interface EditModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditModal({ report, isOpen, onClose }: EditModalProps) {
  const { mutate: updateReport, isPending } = useUpdateReport();
  const { toast } = useToast();

  // กำหนดตัวแปรแบบ any เพื่อรองรับทุกค่า
  const [formData, setFormData] = useState<any>({
    zone: report.zone,
    chainNo: report.chainNo,
    splicingTeam: report.splicingTeam,
    name: report.name,
    jobId: report.jobId,
    bjOrSite: report.bjOrSite,
    routing: report.routing,
    date: report.date,
    // ส่วนที่แก้: บังคับดึงค่า Time Begin
    timeBegin: (report as any).timeBegin || "",
    gpsCoordinates: report.gpsCoordinates || "",
    status: report.status,
    effect: report.effect,
    problemDetails: report.problemDetails || "",
    timeFinished: report.timeFinished || "",
  });

  const [geoLoading, setGeoLoading] = useState(false);

  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({ ...formData, gpsCoordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
          setGeoLoading(false);
          toast({
            title: "Location captured",
            description: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
          });
        },
        (error) => {
          setGeoLoading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to get your location. Please enable GPS permissions.",
          });
        }
      );
    } else {
      setGeoLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Geolocation is not supported by this browser.",
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    updateReport({ id: report.id, data: formData }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
        onClose();
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/40 bg-white z-10">
          <h2 className="text-lg font-bold text-foreground">Edit Report Entry</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-close-edit-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Zone</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="SCT">SCT</option>
                <option value="CWT">CWT</option>
                <option value="TWA">TWA</option>
                <option value="ONT">ONT</option>
                <option value="CW">CW</option>
                <option value="CN">CN</option>
                <option value="ER">ER</option>
                <option value="NR">NR</option>
                <option value="NER">NER</option>
                <option value="SR">SR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Chain No</label>
              <input
                type="text"
                value={formData.chainNo}
                onChange={(e) => setFormData({ ...formData, chainNo: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Splicing Team</label>
              <input
                type="text"
                value={formData.splicingTeam}
                onChange={(e) => setFormData({ ...formData, splicingTeam: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job ID</label>
              <input
                type="text"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">BJ. Or Site</label>
              <input
                type="text"
                value={formData.bjOrSite}
                onChange={(e) => setFormData({ ...formData, bjOrSite: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Routing</label>
              <input
                type="text"
                value={formData.routing}
                onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">GPS Coordinates</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.gpsCoordinates}
                  onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Latitude, Longitude"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="px-3 py-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  {geoLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Get
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* ส่วนที่แก้: Time Begin แก้ไขได้แล้ว */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Begin</label>
              <input
                type="time"
                value={formData.timeBegin}
                onChange={(e) => setFormData({ ...formData, timeBegin: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Finished</label>
              <input
                type="text"
                value={formData.timeFinished}
                onChange={(e) => setFormData({ ...formData, timeFinished: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="HH:mm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={formData.status ? "complete" : "incomplete"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === "complete" })}
                className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="complete">Complete</option>
                <option value="incomplete">Not Complete</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Problem Details</label>
            <textarea
              value={formData.problemDetails}
              onChange={(e) => setFormData({ ...formData, problemDetails: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder="Describe any issues or problems encountered"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Effect / Notes</label>
            <textarea
              value={formData.effect}
              onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="e.g. Excellent connection quality"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}