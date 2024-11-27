type Timestamp = {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
};

type Note = {
  tags: string[];
  comment: string;
  timestamp: Timestamp;
};

function formatTimestamp(value: number, type: keyof Timestamp): string {
  switch (type) {
    case "year":
      return value.toString().padStart(4, "0");
    case "month": {
      const months = [
        "january",
        "february",
        "march",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      return value.toString().padStart(2, "0") + "_" + months[value];
    }
    case "date":
    case "hour":
    case "minute":
      return value.toString().padStart(2, "0");
  }
}

export async function writeNote({ timestamp, comment, tags }: Note) {
  const keys: (keyof Timestamp)[] = [
    "year",
    "month",
    "date",
    "hour",
    "minute",
  ];
  let path = "notes/";
  for (const key of keys) {
    path += formatTimestamp(timestamp[key], key) + "_";
  }
  await Deno.mkdir(path, { recursive: true });
  path += "message.json";
  await Deno.writeTextFile(path, JSON.stringify({ comment, tags }));
}

type FileNote = {
  tags: string[];
  comment: string;
};

function extractTimestampFromName(name: string): Timestamp {
  // yyyy_mm_dd_hh_mm_message.json
  const nameRegex =
    /(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_message.json/;
  const match = name.match(nameRegex);
  if (match === null) {
    throw new Error("mismatched date item");
  }
  const [_, year, month, date, hour, minute] = match;
  return {
    year: parseInt(year),
    month: parseInt(month),
    date: parseInt(date),
    hour: parseInt(hour),
    minute: parseInt(minute),
  };
}

export async function notes(): Promise<Note[]> {
  const notes: Note[] = [];
  const entries = Deno.readDir("notes");
  for await (const entry of entries) {
    const timestamp = extractTimestampFromName(entry.name);
    const { comment, tags }: FileNote = JSON.parse(
      await Deno.readTextFile(
        `notes/${entry.name}`,
      ),
    );
    notes.push({
      timestamp,
      comment,
      tags,
    });
  }
  return notes;
}
