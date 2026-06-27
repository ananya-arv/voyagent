import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { EventRow, TripRow } from "@/lib/types";
import {
  CATEGORY_ICON,
  formatDate,
  groupByDay,
  totalEstimatedCost,
} from "@/lib/itinerary-utils";

export interface ItineraryEmailProps {
  trip: TripRow;
  events: EventRow[];
  baseUrl: string;
}

export function ItineraryEmail({ trip, events, baseUrl }: ItineraryEmailProps) {
  const days = groupByDay(events);
  const total = totalEstimatedCost(events);
  const tripUrl = `${baseUrl}/trips/${trip.id}`;
  const icsUrl = `${baseUrl}/api/export-ics/${trip.id}`;

  return (
    <Html>
      <Head />
      <Preview>{`Your itinerary for ${trip.destination}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{trip.destination}</Heading>
          <Text style={subhead}>
            {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ·{" "}
            {trip.num_travelers} traveler{trip.num_travelers === 1 ? "" : "s"} ·{" "}
            {trip.budget_tier} · {trip.vibe}
          </Text>

          {days.map((day) => (
            <Section key={day.day_number} style={daySection}>
              <Heading as="h2" style={h2}>
                Day {day.day_number} — {formatDate(day.date)}
              </Heading>
              {day.events.map((e) => (
                <Section key={e.id} style={eventRow}>
                  <Text style={eventLine}>
                    <strong>
                      {e.time_start}–{e.time_end}
                    </strong>{" "}
                    {CATEGORY_ICON[e.category] ?? "•"} {e.title}
                  </Text>
                  {(e.location_name || e.location_address) && (
                    <Text style={meta}>
                      📍 {[e.location_name, e.location_address].filter(Boolean).join(", ")}
                    </Text>
                  )}
                  {e.estimated_cost_usd != null && (
                    <Text style={meta}>≈ ${e.estimated_cost_usd}</Text>
                  )}
                  {e.booking_url && (
                    <Button style={bookBtn} href={e.booking_url}>
                      Book {e.category}
                    </Button>
                  )}
                </Section>
              ))}
            </Section>
          ))}

          <Hr style={hr} />
          <Text style={totalLine}>
            <strong>Total estimated cost:</strong>{" "}
            {total > 0 ? `≈ $${total}` : "—"}
          </Text>
          <Section style={{ marginTop: "16px" }}>
            <Button style={primaryBtn} href={tripUrl}>
              View full itinerary
            </Button>
          </Section>
          <Text style={meta}>
            Add to your calendar: <Link href={icsUrl}>download .ics</Link>
          </Text>
          <Text style={footer}>Planned with Voyagent.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ItineraryEmail;

const body = { backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" };
const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "600px",
};
const h1 = { fontSize: "24px", margin: "0 0 4px" };
const h2 = { fontSize: "18px", margin: "0 0 8px", color: "#1a1a1a" };
const subhead = { color: "#666", fontSize: "14px", margin: "0 0 16px" };
const daySection = {
  borderTop: "1px solid #eee",
  paddingTop: "12px",
  marginTop: "12px",
};
const eventRow = { marginBottom: "12px" };
const eventLine = { fontSize: "14px", margin: "0 0 2px" };
const meta = { color: "#666", fontSize: "12px", margin: "0 0 2px" };
const hr = { borderColor: "#eee", margin: "20px 0" };
const totalLine = { fontSize: "15px" };
const bookBtn = {
  backgroundColor: "#111827",
  color: "#fff",
  fontSize: "12px",
  padding: "6px 12px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "4px",
};
const primaryBtn = {
  backgroundColor: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  padding: "10px 18px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
};
const footer = { color: "#999", fontSize: "12px", marginTop: "20px" };
