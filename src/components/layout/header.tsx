
import { FlaskConical } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <FlaskConical className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-semibold">Trial Insights</h1>
        </div>
        <div className="md:hidden"> {/* Only show trigger on mobile */}
          <SidebarTrigger />
        </div>
      </div>
    </header>
  );
}
