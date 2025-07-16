type ProgressBarProps = {
    value: number
    current?: number
    total?: number
  }
  
  export default function ProgressBar({ value, current, total }: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, value))
    const color =
      percentage >= 100 ? 'bg-green-500'
      : percentage >= 50 ? 'bg-yellow-400'
      : 'bg-red-400'
  
    return (
      <div className="w-full">
        <div className="w-full h-3 bg-gray-200 rounded overflow-hidden mt-1">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {current !== undefined && total !== undefined && (
          <div className="text-xs text-gray-600 mt-1 text-right">
            {current} out of {total}
          </div>
        )}
      </div>
    )
  }
  