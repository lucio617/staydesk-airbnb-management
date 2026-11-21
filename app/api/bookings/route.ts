import { bookingSchema } from "../../model";
import { deleteObject, json, supabase, table, withOwner, write } from "../supabase";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return withOwner(req, async owner => {
    const bookings: unknown[] = [];
    for (;;) {
      const query = table("bookings", owner, {}, {
        select: "data", order: "updated.desc,id", limit: "500", offset: String(bookings.length),
      });
      const rows = await (await supabase(query)).json() as { data: unknown }[];
      if (!rows.length) return json(bookings);
      bookings.push(...rows.map(row => row.data));
    }
  });
}

export function POST(req: Request) {
  return withOwner(req, async owner => {
    const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
    const data = { ...parsed.data, id: parsed.data.id || crypto.randomUUID() };
    const updated = new Date().toISOString();
    if (parsed.data.id) {
      const result = await supabase(table("bookings", owner, { id: data.id }), write("PATCH", { data, updated }));
      if (!(await result.json() as unknown[]).length) return json({ error: "Booking not found" }, 404);
    } else {
      await supabase("/rest/v1/staydesk_bookings", write("POST", { id: data.id, owner, data, updated }));
    }
    return json(data);
  });
}

export function DELETE(req: Request) {
  return withOwner(req, async owner => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing booking" }, 400);
    const documents = table("documents", owner, { booking: id }, { select: "id,key" });
    // Delete rows individually so a concurrent upload cannot lose its metadata.
    // The foreign key prevents booking deletion while any documents remain.
    for (;;) {
      const rows = await (await supabase(documents)).json() as { id: string; key: string }[];
      if (!rows.length) break;
      for (const row of rows) {
        await deleteObject(row.key);
        await supabase(table("documents", owner, { id: row.id }), { method: "DELETE" });
      }
    }
    await supabase(table("bookings", owner, { id }), { method: "DELETE" });
    return json({ ok: true });
  });
}
