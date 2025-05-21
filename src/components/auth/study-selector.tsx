
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudiesForCurrentUser, setSelectedStudy, type Study, getCurrentUser, logout, type User } from '@/lib/auth';
import { FolderKanban, LogOut } from 'lucide-react';

export function StudySelector() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudyValue, setSelectedStudyValue] = useState<string>('');
  const [currentUser, setCurrentUserLocal] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserLocal(user);
    if (user) {
      const userStudies = getStudiesForCurrentUser();
      setStudies(userStudies);
    } else {
      // This case should ideally be handled by page guard, but as a fallback:
      router.replace('/login');
    }
  }, [router]);

  const handleSelectStudy = () => {
    if (selectedStudyValue) {
      setSelectedStudy(selectedStudyValue);
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    // logout() function already handles redirecting to /login
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl">Select a Study</CardTitle>
        {currentUser && <CardDescription>Welcome, {currentUser.name}! Please choose a study to continue.</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedStudyValue} onValueChange={setSelectedStudyValue} disabled={studies.length === 0}>
          <SelectTrigger id="study" className="w-full bg-input/50">
            <SelectValue placeholder="Choose a study..." />
          </SelectTrigger>
          <SelectContent>
            {studies.length > 0 ? (
              studies.map((study) => (
                <SelectItem key={study.id} value={study.id}>
                  {study.name} - ({study.description})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-studies" disabled>No studies available for your account.</SelectItem>
            )}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
        <Button onClick={handleSelectStudy} disabled={!selectedStudyValue || studies.length === 0} className="w-full sm:flex-grow bg-primary hover:bg-primary/90 text-primary-foreground">
          Proceed to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
