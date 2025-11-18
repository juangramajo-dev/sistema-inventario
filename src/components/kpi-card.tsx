/**
 *
 * Componente "tonto" para mostrar una estadística (KPI)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react"; // Usaremos íconos

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
