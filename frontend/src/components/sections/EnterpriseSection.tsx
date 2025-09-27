'use client'

import React from 'react';
import { Box, Container, Grid, Heading, Text, Flex } from '@chakra-ui/react';
import { HiCode, HiLightningBolt, HiDatabase, HiCloud, HiServer, HiShieldCheck, HiChartBar } from 'react-icons/hi';
import {
  TechGridBackground,
  PowerCircle,
  SecurityBadge,
  EnterpriseMetric,
  TechnologyStack,
  DataCenterPulse,
  ServerStatus,
  PerformanceGraph
} from '@/components/ui/EnterpriseElements';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { ModernCard } from '@/components/ui/ModernCard';

const enterpriseMetrics = [
  { value: '99.99%', label: 'Uptime Garantisi' },
  { value: '500TB+', label: 'İşlenen Veri' },
  { value: '200ms', label: 'Ortalama Yanıt Süresi' },
  { value: '50+', label: 'Global Veri Merkezi' }
];

const techStack = [
  { icon: HiCode, name: 'API' },
  { icon: HiLightningBolt, name: 'AI' },
  { icon: HiDatabase, name: 'BigData' },
  { icon: HiCloud, name: 'Cloud' },
  { icon: HiServer, name: 'Edge' },
  { icon: HiShieldCheck, name: 'Security' }
];

const performanceBars = Array(12).fill(0).map(() => Math.random() * 100);

export default function EnterpriseSection() {
  return (
    <Box position="relative" py={20} overflow="hidden">
      <TechGridBackground />
      <PowerCircle style={{ left: '20%', top: '30%' }} />
      <PowerCircle style={{ right: '-10%', bottom: '20%' }} />

      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12}>
          {/* Sol Kolon - Güvenlik ve Performans */}
          <Box>
            <Flex align="center" gap={4} mb={8}>
              <SecurityBadge>Enterprise-Grade Security</SecurityBadge>
              <ServerStatus>
                <span className="status-dot" />
                Tüm Sistemler Aktif
              </ServerStatus>
            </Flex>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {enterpriseMetrics.map((metric, index) => (
                <EnterpriseMetric key={index}>
                  <Text className="value">{metric.value}</Text>
                  <Text className="label">{metric.label}</Text>
                </EnterpriseMetric>
              ))}
            </Grid>

            <Box mt={8}>
              <Heading size="lg" mb={4}>
                Gerçek Zamanlı Performans
              </Heading>
              <PerformanceGraph>
                {performanceBars.map((height, index) => (
                  <div
                    key={index}
                    className="bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </PerformanceGraph>
            </Box>
          </Box>

          {/* Sağ Kolon - Teknoloji Stack */}
          <Box>
            <Heading size="lg" mb={6}>
              Enterprise Teknoloji Stack
            </Heading>
            
            <TechnologyStack>
              {techStack.map((tech, index) => (
                <div key={index} className="tech-item">
                  <AnimatedIcon
                    icon={tech.icon}
                    size={32}
                    color="#4F46E5"
                    hoverColor="#FF3366"
                  />
                  <span className="name">{tech.name}</span>
                </div>
              ))}
            </TechnologyStack>

            <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={8}>
              <ModernCard>
                <Box p={6}>
                  <Flex align="center" gap={4} mb={4}>
                    <DataCenterPulse />
                    <Text>Global Edge Network</Text>
                  </Flex>
                  <Text color="gray.400">
                    50+ veri merkezi ile global ölçekte yüksek performans
                  </Text>
                </Box>
              </ModernCard>

              <ModernCard>
                <Box p={6}>
                  <Flex align="center" gap={4} mb={4}>
                    <HiChartBar />
                    <Text>Otomasyon & Ölçeklendirme</Text>
                  </Flex>
                  <Text color="gray.400">
                    Otomatik ölçeklendirme ve yük dengeleme
                  </Text>
                </Box>
              </ModernCard>
            </Grid>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}