import type { RatingLevel } from "../components/shared/RatingDial";

export const ratingInfo = {
  time: {
    bad: {
      range: ">6 seconds",
      description: "Needs improvement. Consider more practice."
    },
    average: {
      range: "3-6 seconds",
      description: "Getting there! Keep practicing."
    },
    good: {
      range: "1.5-3 seconds",
      description: "Solid performance! You're doing well."
    },
    excellent: {
      range: "<1.5 seconds",
      description: "Outstanding speed! You've mastered this."
    }
  },
  accuracy: {
    bad: {
      range: "<70%",
      description: "Focus on accuracy before speed."
    },
    average: {
      range: "70-85%",
      description: "Making progress. Review errors to improve."
    },
    good: {
      range: "85-95%",
      description: "Good accuracy! Almost there."
    },
    excellent: {
      range: "95-100%",
      description: "Excellent! You've mastered these facts."
    }
  }
};

export function getRatingDescription(type: "time" | "accuracy", rating: RatingLevel): string {
  return ratingInfo[type][rating].description;
}

export function getRatingRange(type: "time" | "accuracy", rating: RatingLevel): string {
  return ratingInfo[type][rating].range;
}