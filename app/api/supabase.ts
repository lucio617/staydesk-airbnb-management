import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../chatgpt-auth";

export const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

export async function withOwner(req: Request, action: (owner: string) => Promise<Response>) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Please sign in" }, 401);
  const origin = req.headers.get("origin");
  if (req.method !== "GET" && origin && origin !== new URL(req.url).origin)
    return json({ error: "Invalid origin" }, 403);
  try {
    return await action(user.userId);
  } catch {
    return json({ error: "Could not access Supabase. Check the server configuration and try again." }, 503);
  }
}

export async function supabase(path: string, init: RequestInit = {}) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase configuration");
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  if (!key.startsWith("sb_secret_")) headers.set("Authorization", "Bearer " + key);
  const response = await fetch(new URL(path, url), { ...init, headers, redirect: "error" });
  if (!response.ok) throw new Error("Supabase request failed: " + response.status);
  return response;
}

type Table = "bookings" | "documents";
export function table(name: Table, owner: string, filters: Record<string, string> = {}, options: Record<string, string> = {}) {
  const query = new URLSearchParams(options);
  for (const [column, value] of Object.entries({ ...filters, owner })) {
    query.set(column, 'eq."' + value.replaceAll("\\", "\\\\").replaceAll('"', '\\"') + '"');
  }
  return "/rest/v1/staydesk_" + name + "?" + query;
}

export function write(method: string, value: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(value) };
}

const bucket = "/storage/v1/object/staydesk-guest-documents";
export const objectPath = (key: string) => bucket + "/" + key.split("/").map(encodeURIComponent).join("/");
export async function deleteObject(key: string) {
  await supabase(bucket, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [key] }) });
}
