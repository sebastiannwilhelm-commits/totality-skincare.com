export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Palmetto Developments
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Storefront scaffold
      </h1>
      <p className="text-muted-foreground">
        Next.js 14 (App Router), Tailwind CSS, and Shadcn-ready configuration.
        Supabase migrations live in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          supabase/migrations
        </code>
        .
      </p>
    </main>
  );
}
