type Depression = -3.5 | -3 | -2.5 | -2 | -1.5 | -1 | -0.5;
type Euthymia = 0;
type Mania = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5;
export type Mood = Depression | Euthymia | Mania;

export type Time = {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
};

export type MoodEntry = {
  type: "mood";
  mood: Mood;
  comment: string;
} & Timed;

export type SleepEntry = {
  type: "sleep";
  sleep: "wake_up" | "sleep";
  comment: string;
} & Timed;

type Timed = {
  time: Time;
};

export function timeCompare(left: Timed, right: Timed): -1 | 0 | 1 {
  const keys: (keyof Time)[] = ["year", "month", "date", "hour", "minute"];
  for (const key of keys) {
    if (left.time[key] > right.time[key]) {
      return -1;
    }
    if (left.time[key] < right.time[key]) {
      return 1;
    }
  }

  return 0;
}

export interface Tracker {
  trackMood(entry: MoodEntry): Promise<"ok" | "error">;
  moods(): Promise<
    { type: "ok"; moods: MoodEntry[] } | { type: "error"; errors: string[] }
  >;
  trackSleep(entry: SleepEntry): Promise<"ok" | "error">;
  sleep(): Promise<
    { type: "ok"; sleep: SleepEntry[] } | { type: "error"; errors: string[] }
  >;
}
