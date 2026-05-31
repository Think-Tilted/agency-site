import type { SupabaseClient } from "@supabase/supabase-js";

/** One row of the `events` table (PRE-005 schema, migration 0001). */
export interface EventRow {
  id: string;
  title: string;
  event_date: string; // ISO date (YYYY-MM-DD)
  description: string;
  created_at: string;
  updated_at: string;
}

/** Shape accepted when creating an event (server fills the rest). */
export interface EventInput {
  title: string;
  event_date: string;
  description: string;
}

/** Fetch all events, soonest first. Works with the anon key (public read). */
export async function listEvents(supabase: SupabaseClient): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  if (error) throw new Error(`Failed to load events: ${error.message}`);
  return (data ?? []) as EventRow[];
}

/** Insert an event. Requires an authenticated session (RLS write policy). */
export async function createEvent(
  supabase: SupabaseClient,
  input: EventInput,
): Promise<EventRow> {
  const { data, error } = await supabase
    .from("events")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`Failed to create event: ${error.message}`);
  return data as EventRow;
}

/** Delete an event by id. Requires an authenticated session (RLS). */
export async function deleteEvent(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete event: ${error.message}`);
}

/** Format an ISO date (YYYY-MM-DD) for display, timezone-stable. */
export function formatEventDate(isoDate: string): string {
  const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
