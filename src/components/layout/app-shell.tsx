
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';

interface AppShellProps {
  sidebarContent: ReactNode | null; // Allow null to hide sidebar content
  children: ReactNode;
  sidebarFooterContent?: ReactNode;
}

export function AppShell({ sidebarContent, children, sidebarFooterContent }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={sidebarContent !== null}> {/* Open by default only if there's content */}
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader showSidebarTrigger={sidebarContent !== null} /> {/* Show trigger only if there's sidebar content */}
        <div className="flex flex-1">
          {sidebarContent && (
            <Sidebar
              variant="sidebar"
              collapsible="icon"
              className="border-r"
            >
              <SidebarHeader className="p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">Filters</h2>
              </SidebarHeader>
              <SidebarContent className="p-4 group-data-[collapsible=icon]:p-2">
                {sidebarContent}
              </SidebarContent>
              {sidebarFooterContent && (
                <SidebarFooter className="p-4 mt-auto border-t group-data-[collapsible=icon]:hidden">
                  {sidebarFooterContent}
                </SidebarFooter>
              )}
            </Sidebar>
          )}
          <SidebarInset className={!sidebarContent ? "md:ml-0" : ""}> {/* Adjust margin if no sidebar */}
            <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
              {children}
            </main>
          </SidebarInset>
        </div>
        <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Trial Insights. All rights reserved.</p>
        </footer>
      </div>
    </SidebarProvider>
  );
}

