import { MoodEntry, MoodTracker, Time } from "./mod.ts";

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

function prepareFileName(entry: MoodEntry): string {
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

export class FileMoodTracker implements MoodTracker {
  private dirPath: string;
  private constructor(dirPath: string) {
    this.dirPath = dirPath;
  }
  public static async new(dirPath: string) {
    try {
      await Deno.mkdir(dirPath);
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        throw err;
      }
    }
    return new FileMoodTracker(dirPath);
  }
  async trackMood(entry: MoodEntry): Promise<"ok" | "error"> {
    const fileName = prepareFileName(entry);
    const filePath = path.join(this.dirPath, fileName);
    await Deno.writeTextFile(filePath, JSON.stringify(entry));
    return "ok";
  }
  async moods(): Promise<
    { type: "ok"; moods: MoodEntry[] } | { type: "error"; errors: string[] }
  > {
    const moods = [];
    const errors = [];
    const entries = Deno.readDir(this.dirPath);
    for await (const entry of entries) {
      if (!entry.isFile) {
        errors.push(`entry "${entry.name}" is not a file`);
        continue;
      }
      const mood = JSON.parse(
        await Deno.readTextFile(path.join(this.dirPath, entry.name)),
      );
      moods.push(mood);
    }
    if (errors.length > 0) {
      return { type: "error", errors };
    } else {
      return { type: "ok", moods };
    }
  }
}
