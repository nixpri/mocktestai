/**
 * Utility functions for consistent time formatting across the application
 */

/**
 * Format seconds to a human-readable time string
 * @param seconds - Total seconds
 * @returns Formatted time string (HH:MM:SS or MM:SS)
 */
export function formatTime(seconds: number): string {
  // Handle invalid inputs
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '00:00'
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

/**
 * Format minutes to a human-readable duration
 * @param minutes - Total minutes
 * @returns Formatted duration string (Xh Ym or Xm)
 */
export function formatDuration(minutes: number): string {
  // Handle invalid inputs
  if (!minutes || isNaN(minutes) || minutes < 0) {
    return '0m'
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`
    }
    return `${hours}h`
  }
  return `${mins}m`
}

/**
 * Format seconds to minutes with decimal
 * @param seconds - Total seconds
 * @returns Minutes with one decimal place
 */
export function secondsToMinutes(seconds: number): string {
  // Handle invalid inputs
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0.0'
  }
  
  return (seconds / 60).toFixed(1)
}

/**
 * Get duration in seconds, with proper validation
 * @param durationMinutes - Duration in minutes
 * @param defaultMinutes - Default duration if invalid
 * @returns Duration in seconds
 */
export function getDurationInSeconds(durationMinutes: number | undefined | null, defaultMinutes: number = 60): number {
  if (durationMinutes && !isNaN(durationMinutes) && durationMinutes > 0) {
    return durationMinutes * 60
  }
  return defaultMinutes * 60
}

/**
 * Format seconds to hours with decimal
 * @param seconds - Total seconds
 * @returns Hours with one decimal place
 */
export function secondsToHours(seconds: number): string {
  // Handle invalid inputs
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0.0'
  }
  
  return (seconds / 3600).toFixed(1)
}