import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import styled from '@emotion/styled';

interface AnimatedIconProps {
  icon: IconType;
  size?: number;
  color?: string;
  hoverColor?: string;
  onClick?: () => void;
}

const IconContainer = styled(motion.div)<{ size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || 40}px;
  height: ${props => props.size || 40}px;
  cursor: pointer;
`;

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon: Icon,
  size = 40,
  color = '#4F46E5',
  hoverColor = '#6366F1',
  onClick
}) => {
  return (
    <IconContainer
      size={size}
      onClick={onClick}
      whileHover={{ 
        scale: 1.2,
        rotate: 10,
        transition: { type: 'spring', stiffness: 300 }
      }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={{ color }}
        whileHover={{ color: hoverColor }}
        transition={{ duration: 0.2 }}
      >
        <Icon size={size * 0.6} />
      </motion.div>
    </IconContainer>
  );
};