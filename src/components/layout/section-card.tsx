
"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: ReactNode; // Icon is optional
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerActions?: ReactNode; // For additional actions in the header
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, className, contentClassName, headerActions }) => (
  <Card className={cn("shadow-lg border-primary/20", className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center text-xl text-primary">
          {icon && <span className="mr-2 h-6 w-6">{icon}</span>}
          {title}
        </CardTitle>
        {headerActions && <div>{headerActions}</div>}
      </div>
    </CardHeader>
    <CardContent className={cn(contentClassName)}>{children}</CardContent>
  </Card>
);
