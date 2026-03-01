import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <div className="flex flex-col items-center text-center gap-5 p-10 rounded-2xl 
        bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl animate-in fade-in-50 duration-500">
        
        {/* Glowing 404 */}
        <h1 className="text-7xl font-extrabold tracking-widest text-red-500 drop-shadow-[0_0_25px_rgba(255,0,0,0.4)] animate-pulse">
          404
        </h1>

        <p className="text-lg text-muted-foreground max-w-sm leading-relaxed">
          Oops! We couldn't find the page you're looking for.  
        </p>

        <Button 
          onClick={() => (window.location.href = "/")}
          className="px-6 py-5 rounded-xl text-base font-medium hover:scale-105 transition-transform"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
};


export default NotFoundPage;


export const NotFoundTableData = ({title, message}:{title:string, message?:string}) => {
  return <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
    <AlertTriangle className="size-10 text-destructive" />
    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      {message || "An unexpected error occurred."}
    </p>
  </div>;
};
