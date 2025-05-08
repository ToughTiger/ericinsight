import { FlaskConical } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <FlaskConical className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-semibold">Trial Insights</h1>
      </div>
    </header>
  );
}
