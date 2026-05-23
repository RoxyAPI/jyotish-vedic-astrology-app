import { Card, CardContent } from '@/components/ui/card';

/** Inline error card for a failed RoxyAPI request. Server component: the caller catches the thrown `unwrap` error and renders this with the message. */
export function DataError({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="mb-1 text-sm font-medium text-destructive">Could not load data</p>
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
        <a
          href="https://roxyapi.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Check the API docs
        </a>
      </CardContent>
    </Card>
  );
}
