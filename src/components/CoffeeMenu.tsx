'use client';
import { useState } from 'react';
import CustomizationModal from './CustomizationModal';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Coffee = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageColor: string;
};

const COFFEES: Coffee[] = [
  { id: '1', name: 'The Void Espresso', description: 'A dark, intense shot of pure energy.', basePrice: 330, imageColor: 'from-stone-900 to-black' },
  { id: '2', name: 'Nebula Cold Brew', description: 'Smooth, slow-steeped with a hint of cosmic vanilla.', basePrice: 450, imageColor: 'from-blue-900 to-slate-900' },
  { id: '3', name: 'Gravity Flat White', description: 'Perfectly balanced espresso with micro-foam.', basePrice: 410, imageColor: 'from-amber-900 to-stone-900' },
  { id: '4', name: 'Quantum Macchiato', description: 'Espresso marked with a cloud of steamed milk.', basePrice: 370, imageColor: 'from-orange-900 to-black' },
  { id: '5', name: 'Singularity Mocha', description: 'Rich dark chocolate melted into bold espresso.', basePrice: 490, imageColor: 'from-red-900 to-stone-900' },
  { id: '6', name: 'Event Horizon Latte', description: 'Silky milk layered over a double ristretto.', basePrice: 410, imageColor: 'from-slate-800 to-black' },
];

export type CartItem = {
  coffee: Coffee;
  customization: {
    size: string;
    milk: string;
    sweetness: string;
    addons: string[];
  };
  totalPrice: number;
  quantity: number;
};

export default function CoffeeMenu() {
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setSelectedCoffee(null);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      await addDoc(collection(db, "orders"), {
        items: cart.map(item => ({
          coffeeName: item.coffee.name,
          customization: item.customization,
          quantity: item.quantity,
          price: item.totalPrice
        })),
        totalAmount: cartTotal,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert("Order placed successfully! The stars have aligned.");
      setCart([]);
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      
      {/* Menu Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        {COFFEES.map((coffee) => (
          <div 
            key={coffee.id} 
            className="group cursor-pointer bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#EAC678]/50 transition-all duration-300"
            onClick={() => setSelectedCoffee(coffee)}
          >
            <div className={`h-48 bg-gradient-to-br ${coffee.imageColor} relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              {/* Abstract Coffee Art Placeholder */}
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(234,198,120,0.1)] group-hover:shadow-[0_0_40px_rgba(234,198,120,0.3)] transition-shadow duration-500 flex items-center justify-center">
                 <svg className="w-10 h-10 text-white/40 group-hover:text-[#EAC678] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1h3c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2zm0 5h-3v-3h3v3zM14 22L4 22C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2L14 2C15.1 2 16 2.9 16 4V20C16 21.1 15.1 22 14 22Z" />
                 </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-[#EAC678] transition-colors">{coffee.name}</h3>
                <span className="text-lg font-medium text-white">₹{coffee.basePrice}</span>
              </div>
              <p className="text-white/60 text-sm font-light leading-relaxed">{coffee.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      <div className="lg:w-96">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sticky top-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            Your Order
            <span className="bg-[#EAC678] text-black text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
          </h3>
          
          {cart.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p>Your cart is empty.</p>
              <p className="text-sm mt-2">Select a coffee to start customizing.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 relative group">
                    <button 
                      onClick={() => removeItem(idx)}
                      className="absolute top-3 right-3 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >✕</button>
                    <div className="flex justify-between items-start mb-2 pr-6">
                      <h4 className="font-bold text-white">{item.quantity}x {item.coffee.name}</h4>
                      <span className="text-[#EAC678] font-medium">₹{item.totalPrice * item.quantity}</span>
                    </div>
                    <ul className="text-xs text-white/60 space-y-1 font-light">
                      <li>• {item.customization.size}, {item.customization.milk}</li>
                      <li>• Sweetness: {item.customization.sweetness}</li>
                      {item.customization.addons.length > 0 && (
                        <li>• + {item.customization.addons.join(', ')}</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-[#EAC678] text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCoffee && (
        <CustomizationModal 
          coffee={selectedCoffee} 
          onClose={() => setSelectedCoffee(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}
    </div>
  );
}
