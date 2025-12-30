/**
 * Device Detection and Performance Utilities
 * Helps optimize experience based on device capabilities
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLowEnd: boolean
  hasTouch: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
}

/**
 * Detect if device is low-end based on hardware concurrency and memory
 */
export const isLowEndDevice = (): boolean => {
  const hardwareConcurrency = navigator.hardwareConcurrency || 2
  const deviceMemory = (navigator as any).deviceMemory || 4
  
  return hardwareConcurrency <= 2 || deviceMemory <= 2
}

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1
  
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent) || (isMobile && screenWidth >= 768)
  const isDesktop = !isMobile && !isTablet
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isLowEnd = isLowEndDevice()
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLowEnd,
    hasTouch,
    screenWidth,
    screenHeight,
    pixelRatio
  }
}

/**
 * Check if Three.js heavy effects should be disabled
 */
export const shouldDisableHeavyEffects = (): boolean => {
  const deviceInfo = getDeviceInfo()
  
  return deviceInfo.isLowEnd || deviceInfo.isMobile
}

/**
 * Get recommended quality settings based on device
 */
export const getQualitySettings = () => {
  const deviceInfo = getDeviceInfo()
  
  if (deviceInfo.isLowEnd) {
    return {
      imageQuality: 'low',
      enableAnimations: false,
      enable3D: false,
      enableParticles: false,
      maxImageWidth: 800
    }
  }
  
  if (deviceInfo.isMobile) {
    return {
      imageQuality: 'medium',
      enableAnimations: true,
      enable3D: false,
      enableParticles: false,
      maxImageWidth: 1200
    }
  }
  
  return {
    imageQuality: 'high',
    enableAnimations: true,
    enable3D: true,
    enableParticles: true,
    maxImageWidth: 1920
  }
}

/**
 * Prefers reduced motion check
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
