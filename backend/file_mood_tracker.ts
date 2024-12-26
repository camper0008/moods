import * as path from "jsr:@std/path";
import { MoodEntry, SleepEntry, Time, Tracker } from "./mod.ts";

function pad(entry: number, length: number = 2): string {
  return entry.toString().padStart(length, "0");
}

function padTime(entry: Time): { [key in keyof Time]: string } {
  const { year, month, date, hour, minute } = entry;
  return {
    year: pad(year, 4),
    month: pad(month, 2),
    date: pad(date, 2),
    hour: pad(hour, 2),
    minute: pad(minute, 2),
  };
}

function prepareSleepName(entry: SleepEntry): string {
  const { year, month, date, hour, minute } = padTime(entry.time);
  return `sleep_${year}-${month}-${date}-${hour}-${minute}.json`;
}

function prepareMoodName(entry: MoodEntry): string {
  let status: "manic" | "euthymic" | "depressed";
  if (entry.mood > 0) {
    status = "manic";
  } else if (entry.mood < 0) {
    status = "depressed";
  } else {
    status = "euthymic";
  }
  const { year, month, date, hour, minute } = padTime(entry.time);
  return `mood_${year}-${month}-${date}-${hour}-${minute}_${status}.json`;
}

type FileTrackerOptions = { moodDir: string; sleepDir: string };

export class FileTracker implements Tracker {
  private moodDir: string;
  private sleepDir: string;
  private constructor({ moodDir, sleepDir }: FileTrackerOptions) {
    this.moodDir = moodDir;
    this.sleepDir = sleepDir;
  }
  public static async new({ moodDir, sleepDir }: FileTrackerOptions) {
    try {
      await Deno.mkdir(moodDir);
      await Deno.mkdir(sleepDir);
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        throw err;
      }
    }
    return new FileTracker({ moodDir, sleepDir });
  }
  async trackMood(entry: MoodEntry): Promise<"ok" | "error"> {
    const fileName = prepareMoodName(entry);
    const filePath = path.join(this.moodDir, fileName);
    await Deno.writeTextFile(filePath, JSON.stringify(entry));
    return "ok";
  }
  async moods(): Promise<
    { type: "ok"; moods: MoodEntry[] } | { type: "error"; errors: string[] }
  > {
    const moods = [];
    const errors = [];
    const entries = Deno.readDir(this.moodDir);
    for await (const entry of entries) {
      if (!entry.isFile) {
        errors.push(`entry "${entry.name}" is not a file`);
        continue;
      }
      const mood = JSON.parse(
        await Deno.readTextFile(path.join(this.moodDir, entry.name)),
      );
      moods.push(mood);
    }
    if (errors.length > 0) {
      return { type: "error", errors };
    } else {
      return { type: "ok", moods };
    }
  }

  async trackSleep(entry: SleepEntry): Promise<"ok" | "error"> {
    const fileName = prepareSleepName(entry);
    const filePath = path.join(this.sleepDir, fileName);
    await Deno.writeTextFile(filePath, JSON.stringify(entry));
    return "ok";
  }
  async sleep(): Promise<
    { type: "ok"; sleep: SleepEntry[] } | { type: "error"; errors: string[] }
  > {
    const sleep = [];
    const errors = [];
    const entries = Deno.readDir(this.sleepDir);
    for await (const entry of entries) {
      if (!entry.isFile) {
        errors.push(`entry "${entry.name}" is not a file`);
        continue;
      }
      const mood = JSON.parse(
        await Deno.readTextFile(path.join(this.sleepDir, entry.name)),
      );
      sleep.push(mood);
    }
    if (errors.length > 0) {
      return { type: "error", errors };
    } else {
      return { type: "ok", sleep };
    }
  }
}
