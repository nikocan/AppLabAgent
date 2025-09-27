import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Dot = styled(motion.div)<{ size?: number; color?: string }>`
  width: ${props => props.size || 12}px;
  height: ${props => props.size || 12}px;
  background: ${props => props.color || '#4F46E5'};
  border-radius: 50%;
`;

interface LoaderProps {
  size?: number;
  color?: string;
}

export const CoolLoader: React.FC<LoaderProps> = ({ 
  size = 12, 
  color = '#4F46E5' 
}) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-20, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <LoaderContainer
      as={motion.div}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[...Array(3)].map((_, i) => (
        <Dot
          key={i}
          size={size}
          color={color}
          variants={dotVariants}
        />
      ))}
    </LoaderContainer>
  );
};