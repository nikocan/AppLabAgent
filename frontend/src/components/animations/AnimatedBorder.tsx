'use client'

import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface AnimatedBorderProps {
  children: React.ReactNode
  duration?: number
  borderColor?: string
  borderWidth?: number
}

export const AnimatedBorder = ({
  children,
  duration = 2,
  borderColor = 'blue.400',
  borderWidth = 2,
}: AnimatedBorderProps) => {
  return (
    <Box position="relative">
      <motion.div
        animate={{
          background: [
            `linear-gradient(90deg, ${borderColor} ${borderWidth}px, transparent 0) 0 0`,
            `linear-gradient(90deg, ${borderColor} ${borderWidth}px, transparent 0) 0 100%`,
            `linear-gradient(0deg, ${borderColor} ${borderWidth}px, transparent 0) 0 100%`,
            `linear-gradient(0deg, ${borderColor} ${borderWidth}px, transparent 0) 100% 100%`,
            `linear-gradient(90deg, ${borderColor} ${borderWidth}px, transparent 0) 100% 100%`,
            `linear-gradient(90deg, ${borderColor} ${borderWidth}px, transparent 0) 100% 0`,
            `linear-gradient(0deg, ${borderColor} ${borderWidth}px, transparent 0) 100% 0`,
            `linear-gradient(0deg, ${borderColor} ${borderWidth}px, transparent 0) 0 0`,
          ],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
        }}
      />
      {children}
    </Box>
  )
}