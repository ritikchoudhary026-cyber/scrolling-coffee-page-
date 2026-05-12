'use client';
import { useState } from 'react';
import { Coffee, CartItem } from './CoffeeMenu';

type CustomizationModalProps = {
  coffee: Coffee;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
};

const SIZES = [
  { name: 'Regular', price: 0 },
  { name: 'Large', price: 120 },
];

const MILK_TYPES = [
  { name: 'Regular Milk', price: 0 },
  { name: 'Oat Milk', price: 80 },
  { name: 'Almond Milk', price: 80 },
  { name: 'Soy Milk', price: 40 },
];

const SWEETNESS = [
  { name: 'None (0%)' },
  { name: 'Less (50%)' },
  { name: 'Regular (100%)' },
  { name: 'Extra (150%)' },
];

const ADDONS = [
  { name: 'Honey', price: 40 },
  { name: 'Whipped Cream', price: 60 },
  { name: 'Caramel Syrup', price: 40 },
  { name: 'Vanilla Flavor', price: 40 },
];

export default function CustomizationModal({ coffee, onClose, onAddToCart }: CustomizationModalProps) {
  const [size, setSize] = useState(SIZES[0]);
  const [milk, setMilk] = useState(MILK_TYPES[0]);
  const [sweetness, setSweetness] = useState(SWEETNESS[2]);
  const [selectedAddons, setSelectedAddons] = useState<typeof ADDONS>([]);
  const [quantity, setQuantity] = useState(1);

  const handleAddonToggle = (addon: typeof ADDONS[0]) => {
    if (selectedAddons.find(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const totalPrice = coffee.basePrice + size.price + milk.price + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const handleSubmit = () => {
    onAddToCart({
      coffee,
      customization: {
        size: size.name,
        milk: milk.name,
        sweetness: sweetness.name,
        addons: selectedAddons.map(a => a.name),
      },
      totalPrice,
      quantity
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative h-48 flex items-end p-6 bg-gradient-to-br from-stone-900 to-black border-b border-white/10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            ✕
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{coffee.name}</h2>
            <p className="text-white/60 text-sm font-light">{coffee.description}</p>
          </div>
        </div>

        {/* Options (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Size */}
          <section>
            <h3 className="text-sm font-mono tracking-widest uppercase text-white/40 mb-4">Glass Size</h3>
            <div className="space-y-2">
              {SIZES.map((s) => (
                <label key={s.name} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:border-white/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="size" 
                      checked={size.name === s.name} 
                      onChange={() => setSize(s)}
                      className="w-4 h-4 accent-[#EAC678]"
                    />
                    <span className="text-white font-medium">{s.name}</span>
                  </div>
                  {s.price > 0 && <span className="text-[#EAC678] text-sm">+₹{s.price}</span>}
                </label>
              ))}
            </div>
          </section>

          {/* Sweetness */}
          <section>
            <h3 className="text-sm font-mono tracking-widest uppercase text-white/40 mb-4">Sweetness</h3>
            <div className="grid grid-cols-2 gap-2">
              {SWEETNESS.map((s) => (
                <label key={s.name} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${sweetness.name === s.name ? 'border-[#EAC678] bg-[#EAC678]/10 text-[#EAC678]' : 'border-white/5 bg-white/5 text-white hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="sweetness" 
                    checked={sweetness.name === s.name} 
                    onChange={() => setSweetness(s)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium">{s.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Milk Type */}
          <section>
            <h3 className="text-sm font-mono tracking-widest uppercase text-white/40 mb-4">Milk Type</h3>
            <div className="space-y-2">
              {MILK_TYPES.map((m) => (
                <label key={m.name} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:border-white/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="milk" 
                      checked={milk.name === m.name} 
                      onChange={() => setMilk(m)}
                      className="w-4 h-4 accent-[#EAC678]"
                    />
                    <span className="text-white font-medium">{m.name}</span>
                  </div>
                  {m.price > 0 && <span className="text-[#EAC678] text-sm">+₹{m.price}</span>}
                </label>
              ))}
            </div>
          </section>

          {/* Add-ons */}
          <section>
            <h3 className="text-sm font-mono tracking-widest uppercase text-white/40 mb-4">Add-ons</h3>
            <div className="space-y-2">
              {ADDONS.map((a) => {
                const isSelected = selectedAddons.some(sa => sa.name === a.name);
                return (
                  <label key={a.name} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:border-white/20 transition-colors">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleAddonToggle(a)}
                        className="w-4 h-4 accent-[#EAC678] rounded"
                      />
                      <span className="text-white font-medium">{a.name}</span>
                    </div>
                    <span className="text-[#EAC678] text-sm">+₹{a.price}</span>
                  </label>
                );
              })}
            </div>
          </section>
          
        </div>

        {/* Footer (Action) */}
        <div className="p-6 bg-black border-t border-white/10 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
              >-</button>
              <span className="text-xl font-bold w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
              >+</button>
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{totalPrice * quantity}
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-[#EAC678] text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors"
          >
            Add item to order
          </button>
        </div>
      </div>
    </div>
  );
}
