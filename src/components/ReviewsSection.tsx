'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    // Real-time listener for reviews
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(fetchedReviews);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reviews: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    setIsSubmitting(true);
    const formData = new FormData(form);
    const newReview = {
      text: formData.get('Review') as string,
      author: formData.get('Name') as string,
      role: formData.get('Role') as string,
      rating: rating,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "reviews"), newReview);
      form.reset(); // Clear form
      setRating(5); // Reset stars
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to post review. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-8 md:px-24 bg-[#050505] relative z-20">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-[#EAC678]">Client Testimonials</h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter">What they say</h3>
        </div>
        
        {isLoading ? (
          <div className="text-center text-white/40 animate-pulse">Loading reviews from database...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-white/40">No reviews yet. Be the first to leave one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 hover:bg-white/10 transition-colors">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className={`w-4 h-4 ${j < (review.rating || 5) ? 'text-[#EAC678]' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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
        )}

        {/* Leave a Review Form */}
        <div className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h3 className="text-2xl font-bold tracking-tighter">Leave a Review</h3>
            <p className="text-white/60 font-light">Share your experience with my work.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="text-sm font-mono tracking-widest uppercase text-white/40">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? 'text-[#EAC678]' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-mono tracking-widest uppercase text-white/40">Review</label>
              <textarea name="Review" required rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#EAC678] transition-colors resize-none" placeholder="Write your review here..."></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-8 py-4 bg-[#EAC678] text-black hover:bg-white transition-colors rounded-xl font-medium uppercase tracking-widest text-sm disabled:opacity-50">
              {isSubmitting ? 'Submitting to database...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
