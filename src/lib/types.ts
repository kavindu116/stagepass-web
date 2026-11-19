export type EventStatus = "available" | "selling-fast" | "queue" | "sold-out";

export type Category = "Concert" | "Festival" | "Movie" | "Sports" | "Theatre";

export interface Tier {
  id: string;
  name: string;
  price: number; // LKR
  color: string; // seat outline colour on the map
  remaining: string;
}

export interface Show {
  id: string;
  dateLabel: string; // "Sat, 14 Dec"
  timeLabel: string; // "7:00 PM · Night 1"
  soldOut?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  short: string; // big word on the card art
  category: Category;
  day: string;
  month: string;
  dateLabel: string; // "Sat, 14 Dec 2026"
  time: string; // "7:00 PM"
  doors: string; // "6:00 PM"
  venue: string;
  venueAddress: string;
  city: string;
  priceFrom: number;
  tint: string;
  status: EventStatus;
  description: string;
  shows: Show[];
  tiers: Tier[];
}

export type SeatStatus = "available" | "held" | "sold";

export interface Seat {
  id: string; // "C7" (label shown to the user)
  row: string; // "C"
  number: number; // 7
  tierId: string;
  status: SeatStatus;
  showSeatId?: number; // backend id, sent in POST /api/holds
  posX?: number; // grid column; a jump > 1 between neighbours = aisle
}

export interface SeatRow {
  label: string;
  seats: Seat[];
}

export type BookingStatus = "CONFIRMED" | "ATTENDED" | "REFUNDED";

export interface Booking {
  id: string;
  eventId: string;
  title: string;
  day: string;
  month: string;
  venue: string;
  time: string;
  seatsLabel: string;
  status: BookingStatus;
  tint: string;
  upcoming: boolean;
}
