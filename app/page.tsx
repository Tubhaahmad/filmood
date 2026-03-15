import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-black">
      <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tight mb-4">
        FILMOOD
      </h1>
      <p className="text-xl sm:text-2xl text-white/60 mb-2">
        The movie is a mood.
      </p>
      <p className="text-white/40 max-w-md mb-10">
        Tell Filmood how you want to feel. It tells you what to watch — alone or as a group.
      </p>
      <Link
        href="/mood"
        className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/90 transition"
      >
        Start
      </Link>
    </main>
  );
}
