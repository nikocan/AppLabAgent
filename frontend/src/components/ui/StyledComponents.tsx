import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// Neon efekti için keyframe animasyonu
const neonPulse = keyframes`
  0% {
    box-shadow: 0 0 5px #4F46E5, 0 0 10px #4F46E5, 0 0 15px #4F46E5;
  }
  50% {
    box-shadow: 0 0 10px #4F46E5, 0 0 20px #4F46E5, 0 0 30px #4F46E5;
  }
  100% {
    box-shadow: 0 0 5px #4F46E5, 0 0 10px #4F46E5, 0 0 15px #4F46E5;
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Modern, neon efektli buton
export const NeonButton = styled.button`
  background: ${props => props.variant === 'outline' ? 'transparent' : '#4F46E5'};
  color: ${props => props.variant === 'outline' ? '#4F46E5' : 'white'};
  border: 2px solid #4F46E5;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${neonPulse} 2s infinite;

  &:hover {
    transform: scale(1.05);
    background: #4338CA;
    border-color: #4338CA;
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Gradient buton
export const GradientButton = styled.button`
  background: linear-gradient(45deg, #FF3366, #FF6B6B);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(45deg, #FF6B6B, #FF3366);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 51, 102, 0.3);
  }
`;

// Floating Card bileşeni
export const FloatingCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${floatAnimation} 3s ease-in-out infinite;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

// Işıklı kenar efektli card
export const GlowingCard = styled.div`
  background: rgba(20, 20, 20, 0.95);
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(45deg, #FF3366, #4F46E5, #00FFFF);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

// Modern Badge bileşeni
export const Badge = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(45deg, #34D399, #10B981)';
      case 'warning': return 'linear-gradient(45deg, #FBBF24, #F59E0B)';
      case 'error': return 'linear-gradient(45deg, #EF4444, #DC2626)';
      default: return 'linear-gradient(45deg, #6366F1, #4F46E5)';
    }
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

// Özel Icon Container
export const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  background: rgba(79, 70, 229, 0.1);
  border-radius: 12px;
  color: #4F46E5;
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(10deg) scale(1.1);
    background: rgba(79, 70, 229, 0.2);
  }
`;

// Progress Bar
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(45deg, #4F46E5, #6366F1);
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;