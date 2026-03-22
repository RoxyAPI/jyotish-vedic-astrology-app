import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ApiKeyMissing() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <Badge variant="destructive" className="mx-auto mb-3 w-fit">Setup required</Badge>
          <CardTitle className="text-2xl">API key not configured</CardTitle>
          <CardDescription className="mt-2">
            This app needs a RoxyAPI key to fetch Vedic astrology data. Get one in under a minute.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span>Get your API key at <a href="https://roxyapi.com/pricing" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">roxyapi.com/pricing</a></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span>Create a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.local</code> file in your project root</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span>Add <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">ROXYAPI_KEY=your-key-here</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">4</span>
              <span>Restart the dev server</span>
            </li>
          </ol>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <a href="https://roxyapi.com/pricing" target="_blank" rel="noopener noreferrer">
                Get API Key
              </a>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a href="https://roxyapi.com/docs/quickstart" target="_blank" rel="noopener noreferrer">
                Read docs
              </a>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            One key unlocks 40+ Vedic astrology endpoints. Panchang, kundli, dasha, doshas, matching, transits, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
