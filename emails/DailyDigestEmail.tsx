import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { EventRow, TripRow } from "@/lib/types";
import { CATEGORY_ICON, formatDate } from "@/lib/itinerary-utils";

export interface DailyDigestEmailProps {
  trip: TripRow;
  events: EventRow[]; // tomorrow's events only
  date: string; // tomorrow, YYYY-MM-DD
  baseUrl: string;
}

export function DailyDigestEmail({
  trip,
  events,
  date,
  baseUrl,
}: DailyDigestEmailProps) {
  const sorted = [...events].sort((a, b) => a.time_start.localeCompare(b.time_start));
  const tripUrl = `${baseUrl}/trips/${trip.id}`;

  return (
    <Html>
      <Head />
      <Preview>{`Tomorrow in ${trip.destination} — your plan`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Tomorrow in {trip.destination}</Heading>
          <Text style={subhead}>{formatDate(date)}</Text>

          {sorted.map((e) => (
            <Section key={e.id} style={row}>
              <Text style={line}>
                <strong>{e.time_start}</strong> {CATEGORY_ICON[e.category] ?? "•"}{" "}
                {e.title}
              </Text>
              {(e.location_name || e.location_address) && (
                <Text style={meta}>
                  📍 {[e.location_name, e.location_address].filter(Boolean).join(", ")}
                </Text>
              )}
              {e.booking_url && (
                <Text style={meta}>
                  <Link href={e.booking_url}>Booking link</Link>
                </Text>
              )}
            </Section>
          ))}

          <Section style={{ marginTop: "20px" }}>
            <Button style={primaryBtn} href={tripUrl}>
              View full itinerary
            </Button>
          </Section>
          <Text style={footer}>Planned with Voyagent.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyDigestEmail;

const body = { backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" };
const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "600px",
};
const h1 = { fontSize: "22px", margin: "0 0 4px" };
const subhead = { color: "#666", fontSize: "14px", margin: "0 0 16px" };
const row = { marginBottom: "12px", borderTop: "1px solid #eee", paddingTop: "10px" };
const line = { fontSize: "15px", margin: "0 0 2px" };
const meta = { color: "#666", fontSize: "12px", margin: "0 0 2px" };
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
