import Link from 'next/link';

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 py-12 md:p-24 relative overflow-hidden">

      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#6b4226] rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#c4aead] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none" />

      {/* Content Container */}
      <div className="z-10 max-w-4xl w-full flex flex-col space-y-6">

        {/* Back Button */}
        <div className="self-start pl-2 md:pl-0">
          <Link href="/" className="group flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm uppercase tracking-widest font-mono">Return</span>
          </Link>
        </div>

        <div className="space-y-8 md:space-y-12 backdrop-blur-lg bg-white/5 border border-white/10 p-6 sm:p-10 md:p-16 rounded-3xl shadow-2xl">

          <header className="space-y-4">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 text-transparent bg-clip-text">
              RITIK CHOUDHARY
            </h1>
            <p className="text-lg md:text-2xl font-light text-white/80 tracking-wide">
              Engineer • Creator • Python Developer • GenAI
            </p>
          </header>

          <div className="w-16 h-[1px] bg-white/20" />

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-white/40">About</h2>
            <p className="text-base md:text-xl text-white/70 font-light leading-relaxed">
              Welcome to the intersection of precision engineering and artisan craft. I specialize in building highly optimized, visually stunning digital experiences that push the boundaries of modern web technologies.
            </p>
            <p className="text-base md:text-xl text-white/70 font-light leading-relaxed">
              Every detail matters, just like the perfect espresso extraction. From robust backend architecture to fluid, scrollytelling frontend animations, the goal is always perfection without compromise.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-6">
              <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-white/40">Expertise</h2>
              <ul className="space-y-3 text-white/80 font-light">
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAC678]" />
                  <span>Frontend Architecture & UI/UX</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAC678]" />
                  <span>PythonGenAI</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAC678]" />
                  <span>Machine Learning & Data Science</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAC678]" />
                  <span>Hardware & Firmware (Pixhawk,Esp32/IoT)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-mono tracking-[0.2em] uppercase text-white/40">Connect</h2>
              <div className="flex flex-col space-y-4">
                <a href="https://github.com/ritikchoudhary026-cyber" className="text-white/80 hover:text-white hover:translate-x-1 transition-all flex items-center space-x-3">
                  <span className="font-light">GitHub</span>
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
                <a href="https://www.instagram.com/ritik_jxtt/" className="text-white/80 hover:text-white hover:translate-x-1 transition-all flex items-center space-x-3">
                  <span className="font-light">Instagram</span>
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
                <a href="mailto:choudharyritik026@gmail.com" className="text-white/80 hover:text-white hover:translate-x-1 transition-all flex items-center space-x-3">
                  <span className="font-light">Email</span>
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
