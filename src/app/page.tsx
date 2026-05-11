import ScrollScene from '@/components/CoffeeScrollScene';

export default function Home() {
  return (
    <main className="w-full bg-[#050505] min-h-screen text-white">
      {/* 400vh Scrollytelling Component */}
      <ScrollScene />

      {/* Reviews Section */}
      <section className="py-24 px-8 md:px-24 bg-[#050505] relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-[#EAC678]">Client Testimonials</h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter">What they say</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Ritik’s ability to blend deep engineering with flawless design is unparalleled. The scroll sequence feels like magic.", author: "Sarah J.", role: "Creative Director" },
              { text: "The performance optimization on these 3D scenes is incredible. A true master of both code and aesthetics.", author: "Mark T.", role: "Lead Engineer" },
              { text: "It's rare to find someone who understands hardware data and can present it in such a breathtaking UI.", author: "Elena R.", role: "Product Manager" }
            ].map((review, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 hover:bg-white/10 transition-colors">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-[#EAC678]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-white/80 font-light leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-medium text-white">{review.author}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{review.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Leave a Review Form */}
          <div className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-8">
              <h3 className="text-2xl font-bold tracking-tighter">Leave a Review</h3>
              <p className="text-white/60 font-light">Share your experience with my work.</p>
            </div>
            <form action="mailto:choudharyritik026@gmail.com" method="post" encType="text/plain" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-mono tracking-widest uppercase text-white/40">Name</label>
                  <input type="text" name="Name" required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#EAC678] transition-colors" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono tracking-widest uppercase text-white/40">Role</label>
                  <input type="text" name="Role" required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#EAC678] transition-colors" placeholder="Your role/title" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-mono tracking-widest uppercase text-white/40">Review</label>
                <textarea name="Review" required rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#EAC678] transition-colors resize-none" placeholder="Write your review here..."></textarea>
              </div>
              <button type="submit" className="w-full px-8 py-4 bg-[#EAC678] text-black hover:bg-white transition-colors rounded-xl font-medium uppercase tracking-widest text-sm">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

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
