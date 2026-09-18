"use client";

export interface WeightSliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function WeightSlider({ label, description, value, onChange, disabled }: WeightSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">{label}</label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={value.toFixed(2)}
          disabled={disabled}
          onChange={(e) => onChange(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
          className="h-8 w-20 rounded-md border border-border bg-background px-2 text-right text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
