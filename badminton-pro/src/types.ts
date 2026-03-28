export type Result = 'Win' | 'Lose';

export interface Match {
  id: string;
  date: string; // ISO string
  gameName: string;
  yourScore: number;
  opponentScore: number;
  result: Result;
  improvement: string;
  location: string;
  teammate: string;
  opponents: string[]; // Array of 2 opponents
}

export interface Gear {
  name: string;
  image?: string; // base64
}

export interface Profile {
  name: string;
  profilePhoto?: string; // base64
  racket: Gear;
  shoes: Gear;
}

export interface DailySummary {
  wins: number;
  losses: number;
}
