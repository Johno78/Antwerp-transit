import type { Config } from "@netlify/functions"

// Only these two De Lijn calls are allowed through, with the key added server-side.
const ROUTES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\/search\/([^/]+)$/, (m) => `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${m[1]}`],
  [/^\/realtime\/(\d+)\/(\d+)$/, (m) => `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${m[1]}/${m[2]}/real-time`],
]

export default async (req: Request) => {
  const key = Netlify.env.get("DELIJN_KEY")
  if (!key) return new Response("No De Lijn key configured", { status: 503 })

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/delijn/, "")
  for (const [re, build] of ROUTES) {
    const m = path.match(re)
    if (m) {
      const res = await fetch(build(m) + url.search, {
        headers: { "Ocp-Apim-Subscription-Key": key },
      })
      return new Response(res.body, {
        status: res.status,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      })
    }
  }
  return new Response("Not allowed", { status: 403 })
}

export const config: Config = {
  path: "/api/delijn/*",
  method: "GET",
}
