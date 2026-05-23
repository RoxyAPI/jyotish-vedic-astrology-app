import { Badge } from '@/components/ui/badge';

/** Centered page title with an optional subtitle and a location/context badge. Server component, no client cost. */
export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      {badge && (
        <Badge variant="secondary" className="mt-3">
          {badge}
        </Badge>
      )}
    </div>
  );
}
