import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { useCreateReport } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Plus, FileText, MapPin } from "lucide-react";

const formSchema = insertReportSchema.extend({
  status: z.boolean(),
  gpsCoordinates: z.string().optional(),
  problemDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SidebarForm() {
  const { mutate: createReport, isPending } = useCreateReport();
  const { toast } = useToast();
  const [geoLoading, setGeoLoading] = useState(false);
const preventEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone: "",
      chainNo: "",
      splicingTeam: "",
      name: "",
      jobId: "",
      bjOrSite: "",
      routing: "",
      date: new Date().toISOString().split('T')[0],
      status: false,
      gpsCoordinates: "",
      effect: "",
      problemDetails: "",
    },
  });

  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          form.setValue("gpsCoordinates", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
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

  const onSubmit = (data: FormValues) => {
    const timeBegin = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    createReport({ ...data, timeBegin }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Report entry added successfully",
        });
        form.reset({
          zone: "",
          chainNo: "",
          splicingTeam: "",
          name: "",
          jobId: "",
          bjOrSite: "",
          routing: "",
          date: new Date().toISOString().split('T')[0],
          status: false,
          gpsCoordinates: "",
          effect: "",
          problemDetails: "",
        });
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
    <div className="w-full flex flex-col bg-background text-foreground border-r border-border/60 md:h-full">
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-2 text-primary font-bold text-xl font-display">
          <FileText className="w-6 h-6" />
          <span>New Entry</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Record splicing team work.
        </p>
      </div>

      <div className="p-6 md:flex-1 md:overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnter} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zone *</label>
            <select
              {...form.register("zone")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Select a zone</option>
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
            {form.formState.errors.zone && (
              <p className="text-xs text-destructive">{form.formState.errors.zone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Chain No *</label>
            <input
              {...form.register("chainNo")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. CH001"
            />
            {form.formState.errors.chainNo && (
              <p className="text-xs text-destructive">{form.formState.errors.chainNo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Splicing Team *</label>
            <input
              {...form.register("splicingTeam")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Team 1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name *</label>
            <input
              {...form.register("name")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Job ID *</label>
            <input
              {...form.register("jobId")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. JOB-001"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">BJ. Or Site *</label>
            <input
              {...form.register("bjOrSite")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Site A"
            />
            {form.formState.errors.bjOrSite && (
              <p className="text-xs text-destructive">{form.formState.errors.bjOrSite.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Routing *</label>
            <input
              {...form.register("routing")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Route 1"
            />
            {form.formState.errors.routing && (
              <p className="text-xs text-destructive">{form.formState.errors.routing.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">GPS Coordinates</label>
            <div className="flex gap-2">
              <input
                {...form.register("gpsCoordinates")}
                className="flex-1 px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Latitude, Longitude"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="px-3 py-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
                data-testid="button-get-location"
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
            <label className="text-sm font-medium text-foreground">Date *</label>
            <input
              type="date"
              {...form.register("date")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Problem Details</label>
            <textarea
              {...form.register("problemDetails")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={2}
              placeholder="Describe any issues or problems encountered"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Effect / Notes</label>
            <textarea
              {...form.register("effect")}
              className="w-full px-3 py-2 rounded-md bg-background text-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={3}
              placeholder="e.g. Excellent connection quality"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Entry
          </button>
        </form>
      </div>
      
      <div className="p-4 border-t border-border/40 bg-background text-foreground/50 text-xs text-center text-muted-foreground font-mono hidden md:block">
        Report Management • v1.0.0
      </div>
    </div>
  );
}
