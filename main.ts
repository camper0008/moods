import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

async function listen(port: number) {
  const secret = prompt("enter secret:");

  const routes = new Router();
  routes.get("/", async (ctx) => {});

  const app = new Application();
  app.use(routes.routes());
  app.use(routes.allowedMethods());

  console.log("listening on", port);
  await app.listen({ port });
}

function main() {
  const port = parseInt(Deno.args[0]);
  listen(port);
}

main();
