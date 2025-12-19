import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDataPointSchema } from "@shared/schema";
import { useCreateDataPoint } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, Plus, BarChart3 } from "lucide-react";

// Add coercion for the number field since HTML inputs return strings
const formSchema = insertDataPointSchema.extend({
  value: z.coerce.number().min(1, "Value must be positive"),
  label: z.string().min(1, "Label is required"),
  category: z.enum(["Sales", "Users", "Traffic", "Revenue"]),
});

type FormValues = z.infer<typeof formSchema>;

export function SidebarForm() {
  const { mutate: createData, isPending } = useCreateDataPoint();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      value: 0,
      category: "Sales",
    },
  });

  const onSubmit = (data: FormValues) => {
    createData(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Data point added successfully",
        });
        form.reset({ label: "", value: 0, category: "Sales" });
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
    <div className="w-full h-full flex flex-col bg-slate-50 border-r border-border/60">
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-2 text-primary font-bold text-xl font-display">
          <BarChart3 className="w-6 h-6" />
          <span>Analytics</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your dashboard data metrics.
        </p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Metric Label</label>
            <input
              {...form.register("label")}
              className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Q1 Sales"
            />
            {form.formState.errors.label && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Value</label>
            <input
              type="number"
              {...form.register("value")}
              className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              placeholder="0"
            />
            {form.formState.errors.value && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.value.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              {...form.register("category")}
              className="w-full px-3 py-2 rounded-md bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="Sales">Sales</option>
              <option value="Users">Users</option>
              <option value="Traffic">Traffic</option>
              <option value="Revenue">Revenue</option>
            </select>
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
            Add Metric
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border/40">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">About</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This dashboard visualizes key performance indicators across different business verticals. Data persists to a PostgreSQL database.
          </p>
        </div>
      </div>
      
      <div className="p-4 border-t border-border/40 bg-white/50 text-xs text-center text-muted-foreground font-mono">
        v1.0.0 • Streamlit-lite
      </div>
    </div>
  );
}
