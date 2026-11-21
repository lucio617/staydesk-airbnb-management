import { deleteObject, json, objectPath, supabase, table, withOwner, write } from "../supabase";
export const dynamic = "force-dynamic";

type Document = { id: string; guest: string; key: string; name: string; type: string };

async function findDocument(owner: string, id: string) {
  const response = await supabase(table("documents", owner, { id }));
  return (await response.json() as Document[])[0];
}

export function GET(req: Request) {
  return withOwner(req, async owner => {
    const query = new URL(req.url).searchParams;
    const id = query.get("id");
    if (id) {
      const doc = await findDocument(owner, id);
      if (!doc) return json({ error: "Document not found" }, 404);
      const file = await supabase(objectPath(doc.key));
      return new Response(file.body, { headers: {
        "Content-Type": doc.type,
        "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(doc.name),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      } });
    }
    const booking = query.get("booking");
    if (!booking) return json([]);
    const response = await supabase(table("documents", owner, { booking }, { select: "id,guest,name,type" }));
    return json(await response.json());
  });
}

function matchesType(bytes: Uint8Array, type: string) {
  if (type === "application/pdf") return new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  if (type === "image/png") return [137,80,78,71].every((byte, i) => bytes[i] === byte);
  return type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
}

export function POST(req: Request) {
  return withOwner(req, async owner => {
    const form = await req.formData();
    const file = form.get("file");
    const booking = String(form.get("booking") || "");
    const guest = String(form.get("guest") || "");
    if (!(file instanceof File) || !file.size || file.size > 8388608)
      return json({ error: "Choose a file under 8 MB" }, 400);
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      return json({ error: "Use JPG, PNG or PDF" }, 400);
    const response = await supabase(table("bookings", owner, { id: booking }, { select: "data" }));
    const [row] = await response.json() as { data: { guests: { id: string }[] } }[];
    if (!row) return json({ error: "Save the booking first" }, 404);
    if (!row.data.guests.some(person => person.id === guest))
      return json({ error: "Guest not found in this booking" }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesType(bytes, file.type)) return json({ error: "File content does not match its type" }, 400);
    const doc = { id: crypto.randomUUID(), guest, name: file.name.slice(0, 200), type: file.type };
    const key = booking + "/" + doc.id;
    await supabase(objectPath(key), { method: "POST", headers: { "Content-Type": doc.type }, body: bytes });
    try {
      await supabase("/rest/v1/staydesk_documents", write("POST", { ...doc, key, owner, booking }));
    } catch (error) {
      // A lost response may still mean the insert committed.
      if (!(await findDocument(owner, doc.id))) {
        await deleteObject(key);
        throw error;
      }
    }
    return json(doc);
  });
}

export function DELETE(req: Request) {
  return withOwner(req, async owner => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing document" }, 400);
    const doc = await findDocument(owner, id);
    if (!doc) return json({ error: "Document not found" }, 404);
    await deleteObject(doc.key);
    await supabase(table("documents", owner, { id }), { method: "DELETE" });
    return json({ ok: true });
  });
}
