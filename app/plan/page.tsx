import { SiteHeader } from "@/components/SiteHeader";
import { IntakeForm } from "@/components/IntakeForm";

export default function PlanPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Plan your trip</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          A few details and Voyagent will build your itinerary.
        </p>
        <IntakeForm />
      </main>
    </>
  );
}
