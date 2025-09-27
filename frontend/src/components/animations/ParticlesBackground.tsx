'use client'

import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface ParticlesBackgroundProps {
  particleCount?: number
  color?: string
}

export const ParticlesBackground = ({
  particleCount = 50,
  color = '#3182CE',
}: ParticlesBackgroundProps) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 2,
  }))

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
      zIndex={0}
    >
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -100],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </Box>
  )
}