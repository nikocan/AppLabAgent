import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const pulseKeyframe = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const gridKeyframe = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
`;

export const TechGridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(79, 70, 229, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(79, 70, 229, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: -1;
  animation: ${gridKeyframe} 4s infinite;
`;

export const PowerCircle = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 2px solid rgba(79, 70, 229, 0.2);
  transform: translate(-50%, -50%);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid rgba(79, 70, 229, 0.4);
    animation: ${pulseKeyframe} 3s infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid rgba(79, 70, 229, 0.1);
  }
`;

export const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '🔒';
    font-size: 16px;
  }
`;

export const EnterpriseMetric = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(145deg, rgba(23, 25, 35, 0.9), rgba(23, 25, 35, 0.7));
  border-radius: 16px;
  border: 1px solid rgba(79, 70, 229, 0.2);
  backdrop-filter: blur(10px);
  
  .value {
    font-size: 48px;
    font-weight: 700;
    background: linear-gradient(90deg, #4F46E5, #FF3366);
    -webkit-background-clip: text;
    color: transparent;
    margin: 16px 0;
  }
  
  .label {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

export const TechnologyStack = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(23, 25, 35, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(79, 70, 229, 0.2);
  overflow-x: auto;
  
  .tech-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    min-width: 80px;
    
    .icon {
      font-size: 24px;
      color: #4F46E5;
    }
    
    .name {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

export const DataCenterPulse = styled.div`
  position: relative;
  width: 12px;
  height: 12px;
  background: #4F46E5;
  border-radius: 50%;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    background: rgba(79, 70, 229, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ${pulseKeyframe} 2s infinite;
  }
`;

export const ServerStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(23, 25, 35, 0.8);
  border-radius: 8px;
  font-size: 14px;
  color: #4ADE80;
  
  .status-dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
  }
`;

export const PerformanceGraph = styled.div`
  height: 60px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 8px;
  background: rgba(23, 25, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(79, 70, 229, 0.2);
  
  .bar {
    flex: 1;
    background: linear-gradient(to top, #4F46E5, #FF3366);
    border-radius: 2px;
    transition: height 0.3s ease;
    
    &:hover {
      transform: scaleY(1.1);
    }
  }
`;