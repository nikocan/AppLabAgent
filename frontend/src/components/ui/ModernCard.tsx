import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const CardWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #FF3366, #4F46E5, #00FFFF);
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: translateY(0);
  }
`;

const GlowEffect = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
`;

interface ModernCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({ children, onClick }) => {
  const [glowPosition, setGlowPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPosition({
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 100,
    });
  };

  return (
    <CardWrapper
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <GlowEffect
        animate={{
          x: glowPosition.x,
          y: glowPosition.y,
        }}
        transition={{ type: 'spring', damping: 10 }}
      />
      {children}
    </CardWrapper>
  );
};