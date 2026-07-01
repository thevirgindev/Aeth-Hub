import { TriangleAlert } from 'lucide-react'

export function AgeGate({ onConfirm, onLeave }: { onConfirm: () => void; onLeave: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-deep/95 backdrop-blur-xl">
      <div className="flex flex-col items-center text-center max-w-md px-6">
        <TriangleAlert size={56} className="text-[#FFB84D] mb-6" />
        <h1 className="text-3xl font-bold text-text mb-2">Adult Content</h1>
        <p className="text-dim text-sm mb-8 leading-relaxed">
          This section contains adult-oriented material intended for viewers 18 years and older.
          By proceeding, you confirm that you are at least 18 years of age.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-[#FFB84D] text-deep font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
          >
            I am 18 or older — Enter
          </button>
          <button
            onClick={onLeave}
            className="w-full py-3 rounded-xl border border-border text-dim text-sm hover:text-text hover:bg-white/5 transition-all cursor-pointer"
          >
            Leave
          </button>
        </div>
        <p className="text-[11px] text-muted mt-6">Parents: protect your children with parental control software.</p>
      </div>
    </div>
  )
}
