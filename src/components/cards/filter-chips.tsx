interface Props {
  items: string[]
  selected: string
  onSelect: (v: string) => void
}

export function FilterChips({ items, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(i => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`px-3.5 py-1.5 text-sm rounded-[14px] transition-all duration-150 cursor-pointer ${
            i === selected
              ? 'bg-accent text-white'
              : 'bg-white/10 text-dim hover:bg-white/20 hover:text-text'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  )
}
