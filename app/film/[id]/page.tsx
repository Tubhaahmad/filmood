export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-black">
      <h1 className="text-3xl font-bold text-white mb-4">Film Detail</h1>
      <p className="text-white/50">Film ID: {id}</p>
      <p className="text-white/40 mt-2">Detail page coming soon...</p>
    </main>
  );
}
