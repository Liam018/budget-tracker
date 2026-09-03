/**
 * MorphEyeIcon.jsx
 * Animated Eye ↔ EyeOff morph using morphicons/react + lucide icon data.
 * The icon smoothly morphs between states using spring physics.
 *
 * Usage:
 *   <MorphEyeIcon visible={showPassword} size={16} className="..." style={{...}} />
 */
import { MorphIcon } from "morphicons/react"
import { Eye, EyeOff } from "lucide"    // icon DATA (not components) from "lucide" package

export default function MorphEyeIcon({ visible, size = 16, className = "", style = {} }) {
  return (
    <MorphIcon
      icon={visible ? EyeOff : Eye}
      size={size}
      className={className}
      style={style}
      strokeWidth={2}
    />
  )
}
