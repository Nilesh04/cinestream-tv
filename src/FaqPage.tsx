import { useEffect, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { fetchFaq, type FaqItem } from './api';

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaq().then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-32 px-8 md:px-16 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Frequently Asked Questions</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-white/40" /></div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-lg pr-4">{item.q}</span>
                  <ChevronDown size={20} className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-96' : 'max-h-0'}`}>
                  <p className="px-5 pb-5 text-white/60 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
