'use client'

import { CATEGORIES, type Category } from '@/lib/constants'

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            selected === cat
              ? 'bg-primary-400 text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
