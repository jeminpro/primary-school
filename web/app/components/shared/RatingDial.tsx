import React from "react";

export type RatingLevel = "bad" | "average" | "good" | "excellent";

interface ProgressDialProps {
  value: number; // The current value
  maxValue?: number; // Maximum value (default: 100)
  width?: number; // Width of the slider in pixels (default: 80)
  height?: number; // Height of the slider in pixels (default: 10)
  showIndicator?: boolean; // Whether to show the indicator triangle (default: true)
  rating: RatingLevel; // Rating level that determines the color
  showLabel?: boolean; // Whether to show the rating label below the dial
  showRatingText?: boolean; // Whether to show the rating text (bad, average, good, excellent) below the dial
  className?: string; // Additional CSS classes
  style?: React.CSSProperties; // Optional additional styles
}

// Gradient colors from red to yellow to green (matching your image)
const gradientStops = [
  { offset: "0%", color: "#F44336" },    // Red for bad
  { offset: "30%", color: "#FF9800" },   // Orange for below average
  { offset: "50%", color: "#FFEB3B" },   // Yellow for average
  { offset: "70%", color: "#8BC34A" },   // Light green for good
  { offset: "100%", color: "#4CAF50" },  // Dark green for excellent
];

export const ProgressDial: React.FC<ProgressDialProps> = ({
  value,
  maxValue = 100,
  width = 80,
  height = 10,
  showIndicator = true,
  rating,
  showLabel = false,
  showRatingText = false,
  className = "",
  style = {},
}) => {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max(value, 0), maxValue) / maxValue;
  
  // Calculate indicator position
  const indicatorPosition = width * normalizedValue;
  
  // Triangle size - slightly smaller to fit inside the dial
  const triangleSize = Math.min(height * 0.7, 5);
  
  // Format rating for display
  const capitalizedRating = rating.charAt(0).toUpperCase() + rating.slice(1);
  
  // Define a unique ID for the gradient
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  // Adjust the height to accommodate text if needed, but no extra space for triangle
  const svgHeight = showRatingText ? height + 16 : height;
  
  const sliderSvg = (
    <svg
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
      style={style}
    >
      {/* Define the gradient */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      
      {/* Background track - gradient slider */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={height / 2}
        fill={`url(#${gradientId})`}
        stroke="#E0E0E0"
        strokeWidth="0.5"
      />
      
      {/* Indicator triangle - pointing upwards and inside the dial */}
      {showIndicator && (
        <polygon
          points={`${indicatorPosition - triangleSize/2},${height/2 + triangleSize/2} ${indicatorPosition + triangleSize/2},${height/2 + triangleSize/2} ${indicatorPosition},${height/2 - triangleSize/2}`}
          fill="black"
          stroke="white"
          strokeWidth="0.5"
        />
      )}
      
      {/* Rating text label */}
      {showRatingText && (
        <text
          x={width / 2}
          y={height + 12}
          textAnchor="middle"
          fontSize="10"
          fontFamily="Arial, sans-serif"
          fill="#333333"
        >
          {capitalizedRating}
        </text>
      )}
    </svg>
  );

  if (showLabel) {
    // Get the appropriate color from the gradient based on the value
    const getColorAtPosition = () => {
      const index = Math.min(Math.floor(normalizedValue * gradientStops.length), gradientStops.length - 1);
      return gradientStops[index].color;
    };
    
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {sliderSvg}
        <span 
          className="text-xs mt-1 font-medium" 
          style={{ color: getColorAtPosition() }}
        >
          {capitalizedRating}
        </span>
      </div>
    );
  }

  return sliderSvg;
};

// Helper functions to determine rating based on time and accuracy
export const getTimeRating = (seconds: number): RatingLevel => {
  if (seconds < 1.5) return "excellent";
  if (seconds < 3) return "good";
  if (seconds < 6) return "average";
  return "bad";
};

export const getAccuracyRating = (accuracy: number): RatingLevel => {
  if (accuracy >= 95) return "excellent";
  if (accuracy >= 85) return "good";
  if (accuracy >= 70) return "average";
  return "bad";
};