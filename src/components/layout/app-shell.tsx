
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
  sidebarContent: ReactNode;
  children: ReactNode;
  sidebarFooterContent?: ReactNode;
}

export function AppShell({ sidebarContent, children, sidebarFooterContent }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="border-r"
          >
            <SidebarHeader className="p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">Filters</h2>
              {/* SidebarTrigger is automatically handled by SidebarProvider for desktop/mobile */}
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
          <SidebarInset>
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
