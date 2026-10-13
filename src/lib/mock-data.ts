/**
 * Mock data — swap these functions for real calls to the Spring Boot API
 * (see src/lib/api.ts). Shapes match src/lib/types.ts.
 */
import type { Booking, EventItem, Seat, SeatRow, Tier } from "./types";

export const TIERS: Tier[] = [
  { id: "vip", name: "VIP", price: 15000, color: "#FFB02E", remaining: "12 left" },
  { id: "gold", name: "Gold", price: 8000, color: "#B4A9FF", remaining: "64 left" },
  { id: "silver", name: "Silver", price: 5000, color: "#6FD6A2", remaining: "140 left" },
  { id: "general", name: "General", price: 3500, color: "#7CB8FF", remaining: "300+ left" },
];

const defaultShows = [
  { id: "n1", dateLabel: "Sat, 14 Dec", timeLabel: "7:00 PM · Night 1" },
  { id: "n2", dateLabel: "Sun, 15 Dec", timeLabel: "7:00 PM · Night 2" },
  { id: "n0", dateLabel: "Fri, 13 Dec", timeLabel: "Sold out", soldOut: true },
];

const desc =
  "[Event description — artist bio, what to expect, set length, supporting acts.]";

export const EVENTS: EventItem[] = [
  {
    id: "artist-live-colombo", title: "[Artist] Live in Concert", short: "LIVE", category: "Concert",
    day: "14", month: "DEC", dateLabel: "Sat, 14 Dec 2026", time: "7:00 PM", doors: "6:00 PM",
    venue: "[Venue]", venueAddress: "[Street address], Colombo 07", city: "Colombo",
    priceFrom: 3500, tint: "#4B2E83", status: "selling-fast", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "jazz-night", title: "[Jazz Night] Sessions", short: "JAZZ", category: "Concert",
    day: "25", month: "OCT", dateLabel: "Fri, 25 Oct 2026", time: "8:00 PM", doors: "7:00 PM",
    venue: "[Venue]", venueAddress: "[Street address], Colombo 03", city: "Colombo",
    priceFrom: 2000, tint: "#1F5C57", status: "available", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "t20-final", title: "[Team A] vs [Team B]", short: "T20", category: "Sports",
    day: "03", month: "NOV", dateLabel: "Sun, 03 Nov 2026", time: "2:30 PM", doors: "1:00 PM",
    venue: "[Stadium]", venueAddress: "[Street address], Colombo", city: "Colombo",
    priceFrom: 1500, tint: "#7A2E2E", status: "available", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "standup-tour", title: "[Comedian] Tour", short: "STAND-UP", category: "Theatre",
    day: "19", month: "OCT", dateLabel: "Sat, 19 Oct 2026", time: "7:30 PM", doors: "6:30 PM",
    venue: "[Theatre]", venueAddress: "[Street address], Colombo 02", city: "Colombo",
    priceFrom: 2500, tint: "#7A5A12", status: "available", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "beach-party", title: "[DJ] Beach Party", short: "EDM", category: "Concert",
    day: "30", month: "NOV", dateLabel: "Sat, 30 Nov 2026", time: "6:00 PM", doors: "5:00 PM",
    venue: "[Beach venue]", venueAddress: "[Street address], Negombo", city: "Negombo",
    priceFrom: 4000, tint: "#22408A", status: "available", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "play-title", title: "[Play title]", short: "DRAMA", category: "Theatre",
    day: "07", month: "NOV", dateLabel: "Thu, 07 Nov 2026", time: "7:00 PM", doors: "6:30 PM",
    venue: "[Theatre]", venueAddress: "[Street address], Colombo 07", city: "Colombo",
    priceFrom: 1200, tint: "#5A2A5E", status: "available", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "music-festival", title: "[Music Festival] 2026", short: "FEST", category: "Festival",
    day: "21", month: "DEC", dateLabel: "Sat, 21 Dec 2026", time: "4:00 PM", doors: "3:00 PM",
    venue: "[Grounds]", venueAddress: "[Street address], Colombo", city: "Colombo",
    priceFrom: 5000, tint: "#2E5A2A", status: "queue", description: desc, shows: defaultShows, tiers: TIERS,
  },
  {
    id: "movie-premiere", title: "[Movie] Premiere", short: "IMAX", category: "Movie",
    day: "23", month: "OCT", dateLabel: "Wed, 23 Oct 2026", time: "8:00 PM", doors: "7:30 PM",
    venue: "[Cinema]", venueAddress: "[Street address], Colombo 05", city: "Colombo",
    priceFrom: 1800, tint: "#33363F", status: "sold-out", description: desc, shows: defaultShows, tiers: TIERS,
  },
];

export function getEvents(): EventItem[] {
  return EVENTS;
}

export function getEvent(id: string): EventItem | undefined {
  return EVENTS.find((e) => e.id === id);
}

const ROWS = "ABCDEFGHIJ".split("");
export const SEATS_PER_ROW = 16;
/** Aisles are drawn before these seat numbers. */
export const AISLE_BEFORE = [5, 13];

export function tierForRow(row: string): Tier {
  const i = ROWS.indexOf(row);
  if (i < 2) return TIERS[0];
  if (i < 5) return TIERS[1];
  if (i < 8) return TIERS[2];
  return TIERS[3];
}

export function tierForSeat(seatId: string): Tier {
  return tierForRow(seatId.charAt(0));
}

/** Deterministic fake seat map (same as the design). */
export function getSeatMap(_eventId: string): SeatRow[] {
  return ROWS.map((row, ri) => {
    const seats: Seat[] = [];
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const id = `${row}${n}`;
      const sold = (ri * 7 + n * 3) % 11 === 0 || (ri < 2 && n > 5 && n < 12) || id === "D9";
      const held = !sold && (ri + n * 5) % 13 === 0;
      seats.push({
        id, row, number: n, tierId: tierForRow(row).id,
        status: sold ? "sold" : held ? "held" : "available",
      });
    }
    return { label: row, seats };
  });
}

export const BOOKINGS: Booking[] = [
  { id: "SP-1001", eventId: "artist-live-colombo", title: "[Artist] Live in Concert", day: "14", month: "DEC", venue: "[Venue], Colombo 07", time: "7:00 PM", seatsLabel: "2 × Gold · C7, C8", status: "CONFIRMED", tint: "#4B2E83", upcoming: true },
  { id: "SP-1002", eventId: "jazz-night", title: "[Jazz Night] Sessions", day: "25", month: "OCT", venue: "[Venue], Colombo 03", time: "8:00 PM", seatsLabel: "1 × General · Standing", status: "CONFIRMED", tint: "#1F5C57", upcoming: true },
  { id: "SP-0950", eventId: "standup-tour", title: "[Comedian] Tour", day: "10", month: "AUG", venue: "[Theatre], Colombo 02", time: "7:30 PM", seatsLabel: "2 × Silver · F3, F4", status: "ATTENDED", tint: "#7A5A12", upcoming: false },
  { id: "SP-0911", eventId: "t20-final", title: "[Team A] vs [Team B]", day: "22", month: "JUN", venue: "[Stadium], Colombo", time: "2:30 PM", seatsLabel: "3 × General", status: "ATTENDED", tint: "#7A2E2E", upcoming: false },
  { id: "SP-0874", eventId: "play-title", title: "[Play title]", day: "05", month: "MAY", venue: "[Theatre], Colombo 07", time: "7:00 PM", seatsLabel: "1 × Gold · D2", status: "REFUNDED", tint: "#5A2A5E", upcoming: false },
];

export const CURRENT_USER = { name: "Kavindu Lakshan", initial: "K", memberSince: "2026" };
