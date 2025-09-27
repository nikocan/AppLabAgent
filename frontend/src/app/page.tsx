'use client'

import React from 'react';
import { Box, Container, Grid, Heading, Text, Stack, Button, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { FiCode, FiZap, FiDatabase, FiCloud, FiActivity, FiLayout } from 'react-icons/fi';
import { 
  NeonButton, 
  GradientButton, 
  FloatingCard, 
  GlowingCard,
  Badge,
  IconWrapper,
  ProgressBar 
} from '@/components/ui/StyledComponents';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { CoolLoader } from '@/components/ui/CoolLoader';
import { ModernCard } from '@/components/ui/ModernCard';
import EnterpriseSection from '@/components/sections/EnterpriseSection';
import theme from '@/theme';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: any }) => {
  return (
    <Stack
      bg='white'
      rounded={'xl'}
      p={6}
      gap={4}
      border="1px solid"
      borderColor='gray.100'
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
      transition="all 0.3s"
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg='blue.500'
        mb={1}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color='gray.600'>{text}</Text>
    </Stack>
  )
}

export default function Home() {
  return (
    
      <Box>
      {/* Hero Section */}
      <Container maxW={'7xl'} py={32}>
        <Stack
          align={'center'}
          spacing={{ base: 8, md: 10 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text
                as={'span'}
                position={'relative'}
                color='blue.600'
              >
                AppLab Agent
              </Text>
              <br />
              <Text as={'span'} color='gray.900'>
                Akıllı Otomasyon Platformu
              </Text>
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize={'xl'}>
              AppLab Agent, işlerinizi otomatikleştirmenin ve optimize etmenin en akıllı yoludur.
              Yapay zeka destekli ajanlar ile iş süreçlerinizi dönüştürün.
            </Text>
            <Stack spacing={6} direction={{ base: 'column', sm: 'row' }}>
              <Button
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                colorScheme={'blue'}
                bg={'blue.400'}
                _hover={{ bg: 'blue.500' }}
              >
                Hemen Başlayın
              </Button>
              <Button
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                leftIcon={<FiCode />}
              >
                API Dokümantasyonu
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* Features Section */}
        <Box py={20}>
          <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
            <Heading fontSize={'3xl'}>Güçlü Özellikler</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize={'xl'}>
              AppLab Agent ile tüm iş süreçlerinizi otomatikleştirin ve optimize edin.
            </Text>
          </Stack>

          <Container maxW={'7xl'} mt={12}>
            <Stack
              spacing={{ base: 10, md: 4 }}
              display={{ md: 'grid' }}
              gridTemplateColumns={{ md: 'repeat(2,1fr)' }}
              gridColumnGap={{ md: 8 }}
              gridRowGap={{ md: 10 }}
            >
              <Feature
                icon={FiActivity}
                title={'Akıllı Otomasyon'}
                text={'Yapay zeka destekli ajanlar ile iş süreçlerinizi otomatikleştirin.'}
              />
              <Feature
                icon={FiCloud}
                title={'Bulut Entegrasyonu'}
                text={'Tüm bulut platformları ile sorunsuz entegrasyon sağlayın.'}
              />
              <Feature
                icon={FiCode}
                title={'API Öncelikli'}
                text={'Güçlü API altyapısı ile tüm sistemlerinizi entegre edin.'}
              />
              <Feature
                icon={FiLayout}
                title={'Özelleştirilebilir'}
                text={'İhtiyaçlarınıza göre özelleştirilebilir çözümler sunun.'}
              />
            </Stack>
          </Container>
        </Box>
      </Container>
      <EnterpriseSection />
    </Box>
  )
}
