import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-sentinel-dark text-slate-100 flex flex-col">
      <Navbar />
      <Hero />
    </main>
  );
}