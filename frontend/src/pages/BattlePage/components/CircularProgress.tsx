interface CircularProgressProps {
  progress: number; // процент от 0 до 100
  size: number; // размер в пикселях
  strokeWidth?: number;
  children: React.ReactNode;
}

export const CircularProgress = ({
  progress,
  size,
  strokeWidth = 3,
  children,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {/* Контент (аватарка) по центру */}
      <div className="relative z-10">{children}</div>
      {/* Прогресс поверх контента - показывается только если progress > 0 */}
      {progress > 0 && (
        <svg
          className="absolute top-0 left-0 -rotate-90 pointer-events-none z-20"
          width={size}
          height={size}
        >
          {/* Фоновая полоска */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Прогресс полоска */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progress <= 33 ? "#ef4444" : "#6b7280"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
      )}
    </div>
  );
};
