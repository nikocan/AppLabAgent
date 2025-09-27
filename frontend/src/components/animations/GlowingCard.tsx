'use client'

import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface GlowingCardProps {
  children: React.ReactNode
  glowColor?: string
  intensity?: number
}

export const GlowingCard = ({
  children,
  glowColor = 'blue.400',
  intensity = 0.5,
}: GlowingCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
      }}
    >
      <Box
        position="relative"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`,
          opacity: intensity,
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      >
        <Box position="relative" zIndex={1}>
          {children}
        </Box>
      </Box>
    </motion.div>
  )
}