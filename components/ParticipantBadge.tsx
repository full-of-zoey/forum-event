interface ParticipantBadgeProps {
  name: string
  affiliation: string
  size?: 'sm' | 'md'
}

export default function ParticipantBadge({ name, affiliation, size = 'sm' }: ParticipantBadgeProps) {
  const initials = name.slice(0, 1)

  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0 ${
          size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
        }`}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <span className={`font-medium text-gray-900 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {name}
        </span>
        <span className={`text-gray-400 ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {affiliation}
        </span>
      </div>
    </div>
  )
}
