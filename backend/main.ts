import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { MoodEntry, SleepEntry, timeCompare, Tracker } from "./mod.ts";
import { FileTracker } from "./file_mood_tracker.ts";

type TrackMoodBody = MoodEntry & {
  secret: string;
};

type TrackSleepBody = SleepEntry & {
  secret: string;
};

async function listen(port: number, database: Tracker) {
  const secret = prompt("enter secret:");

  const routes = new Router();
  routes.post("/track_mood", async (ctx) => {
    const body: TrackMoodBody = await ctx.request.body.json();
    if (body.secret !== secret) {
      ctx.response.body = { type: "error", msg: "bad secret" };
      return;
    }
    await database.trackMood(body);
    ctx.response.body = { type: "ok" };
  });

  routes.post("/track_sleep", async (ctx) => {
    const body: TrackSleepBody = await ctx.request.body.json();
    if (body.secret !== secret) {
      ctx.response.body = { type: "error", msg: "bad secret" };
      return;
    }
    await database.trackSleep(body);
    ctx.response.body = { type: "ok" };
  });

  routes.get("/moods", async (ctx) => {
    const moods = await database.moods().then((result) =>
      result.type === "ok"
        ? result.moods.toSorted(timeCompare)
        : `${result.errors.length} error(s) occurred:\n- ${
          result.errors.join("\n- ")
        }`
    );
    ctx.response.body = { type: "ok", moods };
  });

  routes.get("/sleep", async (ctx) => {
    const moods = await database.sleep().then((result) =>
      result.type === "ok"
        ? result.sleep.toSorted(timeCompare)
        : `${result.errors.length} error(s) occurred:\n- ${
          result.errors.join("\n- ")
        }`
    );
    ctx.response.body = { type: "ok", moods };
  });

  const app = new Application();
  app.use(routes.routes());
  app.use(routes.allowedMethods());

  console.log("listening on", port);
  await app.listen({ port });
}

async function main() {
  try {
    const port = parseInt(Deno.args[0]);
    if (isNaN(port)) {
      console.error(`invalid port "${Deno.args[0]}"`);
    }
    await listen(
      port,
      await FileTracker.new({
        moodDir: "mood_entries",
        sleepDir: "sleep_entries",
      }),
    );
  } catch {
    console.error(`invalid port "${Deno.args[0]}"`);
  }
}

if (import.meta.main) {
  await main();
}
