
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';

interface AppShellProps {
  sidebarContent: ReactNode | null; 
  children: ReactNode;
  sidebarFooterContent?: ReactNode;
  sidebarTitle?: string; // Optional title for the sidebar
}

export function AppShell({ sidebarContent, children, sidebarFooterContent, sidebarTitle = "Filters" }: AppShellProps) {
  // Default to true if sidebarContent is provided, false otherwise.
  // This ensures that if a page provides sidebarContent, the SidebarProvider is initialized to 'open'
  // unless overridden by cookies or user interaction.
  const defaultOpenState = sidebarContent !== null;

  return (
    // The key forces re-mount if defaultOpenState changes, ensuring correct initial state for SidebarProvider
    <SidebarProvider key={defaultOpenState.toString()} defaultOpen={defaultOpenState}>
      <AppShellInternal
        sidebarContent={sidebarContent}
        sidebarFooterContent={sidebarFooterContent}
        sidebarTitle={sidebarTitle}
      >
        {children}
      </AppShellInternal>
    </SidebarProvider>
  );
}


// Inner component to access sidebar context
function AppShellInternal({ sidebarContent, children, sidebarFooterContent, sidebarTitle }: Omit<AppShellProps, 'defaultOpen'> & { children: ReactNode }) {
  const { isMobile, openMobile } = useSidebar(); // Get sidebar state

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Pass showSidebarTrigger based on whether sidebarContent exists.
          This ensures the trigger is only shown on pages that intend to use a sidebar. */}
      <AppHeader showSidebarTrigger={sidebarContent !== null} />
      <div className="flex flex-1">
        {sidebarContent && (
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="border-r"
            // For mobile, the sheet's open state is controlled by openMobile via SidebarTrigger
            // For desktop, the 'open' prop of SidebarProvider (managed by cookies/defaultOpen) controls visibility
          >
            <SidebarHeader className="p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
                {sidebarTitle}
              </h2>
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
        {/* SidebarInset handles the main content area.
            It automatically adjusts its margin based on the sidebar's presence and state.
            If sidebarContent is null, the md:ml-[--sidebar-width] (or similar) class won't apply effectively.
            The `peer` group styling in sidebar.tsx should correctly manage margins.
        */}
        <SidebarInset className={!sidebarContent ? "md:ml-0" : ""}>
          <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
            {children}
          </main>
        </SidebarInset>
      </div>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Trial Insights. All rights reserved.</p>
      </footer>
    </div>
  );
}
