import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-sky-50 to-blue-100 text-gray-900">
      <div className="max-w-xl text-center bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-purple-300">LearnPal</span> 💜 </h1>
        <p className="text-lg mb-6 text-gray-700">
          AI-powered summaries that teach <em>why</em>, not just <em>what</em>.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
  href="/upload"
  className="px-6 py-3 bg-purple-500 text-white rounded shadow hover:bg-purple-700 transition"
>
  Get Started — Upload Notes
</Link>
        </div>
      </div>
    </main>
  );
}