
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { isAuthenticated, getSelectedStudyId } from '@/lib/auth';
import { FlaskConical } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // This check runs client-side after hydration
    if (typeof window !== 'undefined') {
        if (isAuthenticated()) {
            if (getSelectedStudyId()) {
            router.replace('/'); 
            } else {
            router.replace('/select-study'); 
            }
        }
    }
  }, [router]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="absolute top-8 left-8 flex items-center text-primary">
        <FlaskConical className="h-10 w-10 mr-3" />
        <h1 className="text-3xl font-semibold">Trial Insights</h1>
      </div>
      <LoginForm />
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Trial Insights by Eric Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
