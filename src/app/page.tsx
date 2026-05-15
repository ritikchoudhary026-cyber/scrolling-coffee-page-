import ScrollScene from '@/components/CoffeeScrollScene';
import ReviewsSection from '@/components/ReviewsSection';
import InfoSection from '@/components/InfoSection';

export default function Home() {
  return (
    <main className="w-full bg-[#050505] min-h-screen text-white">
      {/* 400vh Scrollytelling Component */}
      <ScrollScene />

      {/* Dynamic Reviews Section */}
      <ReviewsSection />

      {/* Dashboard & Info Section */}
      <InfoSection />

      {/* Contacts / Footer Section */}
      <footer className="py-24 px-8 md:px-24 bg-gradient-to-b from-[#050505] to-[#111] relative z-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-12">
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Ready to brew something amazing?</h2>
            <p className="text-lg text-white/60 font-light">Whether it's a high-performance web app or a complex hardware integration, I'm open to discussing new opportunities.</p>
          </div>
          
          <a href="mailto:choudharyritik026@gmail.com" className="inline-block px-12 py-5 bg-white text-black hover:bg-gray-200 transition-colors rounded-full font-medium uppercase tracking-widest text-sm">
            Drop your experiance
          </a>

          <div className="flex space-x-8 pt-12 border-t border-white/10 w-full justify-center">
            <a href="https://github.com/ritikchoudhary026-cyber" className="text-white/40 hover:text-[#EAC678] transition-colors uppercase tracking-widest text-xs">GitHub</a>
            <a href="https://www.instagram.com/ritik_jxtt/" className="text-white/40 hover:text-[#EAC678] transition-colors uppercase tracking-widest text-xs">Instagram</a>
          </div>
          
          <p className="text-white/20 text-xs tracking-widest uppercase mt-12">© {new Date().getFullYear()} Ritik Choudhary. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
