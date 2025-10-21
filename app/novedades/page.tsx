import { supabaseServer } from "@/lib/supabaseServer";

export default async function Novedades() {
  const supabase = supabaseServer();
  const { data: news } = await supabase.from("news").select("*").order("published_at", { ascending: false });
  return (
    <main className="pb-20 space-y-3">
      <h1 className="text-xl font-semibold">Novedades</h1>
      {(news ?? []).map(n => (
        <article key={n.id} className="border rounded p-3">
          <h2 className="font-semibold">{n.title}</h2>
          <p className="text-sm text-gray-600">{new Date(n.published_at).toLocaleString()}</p>
          <p className="mt-2">{n.body}</p>
        </article>
      ))}
      {!news?.length && <p className="text-gray-600">Sin novedades por ahora.</p>}
    </main>
  );
}
