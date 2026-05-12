import CoffeeMenu from '@/components/CoffeeMenu';

export const metadata = {
  title: 'Order | Ritik Coffee Shop',
  description: 'Customize and order premium coffee.',
};

export default function OrderPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16 text-center">
          <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-[#EAC678] mb-4">The Menu</h2>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Craft Your Experience</h1>
          <p className="text-white/60 text-lg md:text-xl font-light">Select a blend and customize it to your exact preference.</p>
        </header>
        <CoffeeMenu />
      </div>
    </main>
  );
}
