import type { Config } from "@netlify/functions"

const BASE = "https://api.delijn.be/DLKernOpenData/api/v1"

export default async (req: Request) => {
  const key = Netlify.env.get("DELIJN_KEY")
  if (!key) return new Response("No De Lijn key configured", { status: 503 })

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/delijn/, "")
  // Only allow stop search and stop departures
  if (!/^\/(zoeken\/haltes\/|haltes\/\d+\/\d+\/real-time)/.test(path)) {
    return new Response("Not allowed", { status: 403 })
  }

  const res = await fetch(BASE + path + url.search, {
    headers: { "Ocp-Apim-Subscription-Key": key },
  })
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })
}

export const config: Config = {
  path: "/api/delijn/*",
  method: "GET",
}
