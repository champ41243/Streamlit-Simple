import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-border max-w-md w-full">
        <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2 font-display">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>
        <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
