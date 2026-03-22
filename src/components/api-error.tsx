import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApiErrorProps {
  message?: string;
  retry?: () => void;
}

export function ApiError({ message, retry }: ApiErrorProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-sm font-medium text-destructive mb-1">Something went wrong</p>
        <p className="text-sm text-muted-foreground mb-4">
          {message || 'Failed to fetch data from the Vedic Astrology API.'}
        </p>
        <div className="flex justify-center gap-2">
          {retry && (
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <a href="https://roxyapi.com/docs/quickstart" target="_blank" rel="noopener noreferrer">
              Check API docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
