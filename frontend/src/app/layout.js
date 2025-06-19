  import { Inter } from "next/font/google";
  import "./globals.css";
  import Link from "next/link";
  
  const inter = Inter({ subsets: ["latin"] });
  
  export const metadata = {
    title: "ShrEdu",
    description: "AI-powered study summarizer with sass",
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-black text-white`}>
          <header className="w-full px-6 py-4 border-b border-purple-800 bg-black/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 rounded-full" />
              <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
                ShrEdu
              </h1>
            </div>
            <nav className="flex gap-6 text-sm font-medium text-purple-300">
              <Link href="/home" className="hover:text-purple-100 transition">Home</Link>
              <Link href="/visuals-test" className="hover:text-purple-100 transition">Visuals</Link>
              <Link href="/epic-feed" className="hover:text-purple-100 transition">Feed</Link>
              <Link href="/epic-uploads" className="hover:text-purple-100 transition">Upload</Link>
            </nav>
          </header>
          <main>{children}</main>
        </body>
      </html>
    );
  }
