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
  mood: Mood;
  comment: string;
  time: Time;
};

export function moodCompare(left: MoodEntry, right: MoodEntry): -1 | 0 | 1 {
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

export interface MoodTracker {
  trackMood(mood: MoodEntry): Promise<"ok" | "error">;
  moods(): Promise<
    { type: "ok"; moods: MoodEntry[] } | { type: "error"; errors: string[] }
  >;
}
