'use client'

import { Container, Box, Heading, Text, Button, Stack, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export default function HeroSection() {
  return (
    <Box 
      position="relative" 
      height="100vh" 
      display="flex" 
      alignItems="center"
      bgGradient="linear(to-r, blue.600, purple.600)"
      color="white"
      overflow="hidden"
    >
      {/* Animasyonlu arka plan desenleri */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundImage: 'url("/grid-pattern.svg")',
          opacity: 0.1,
        }}
      />

      <Container maxW="7xl" position="relative" zIndex={1}>
        <Stack
          textAlign="center"
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
            lineHeight="110%"
          >
            Geleceğin Uygulama Geliştirme{' '}
            <Text as="span" color="blue.200">
              Platformu
            </Text>
          </Heading>

          <Text color="gray.100" maxW="3xl" fontSize={{ base: 'lg', md: 'xl' }} mx="auto">
            AppLab Agent ile yapay zeka destekli uygulama geliştirmenin gücünü keşfedin.
            Otomatik kod üretimi, akıllı optimizasyonlar ve enterprise-grade güvenlik.
          </Text>

          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={4}
            justify="center"
          >
            <Button
              rounded="full"
              size="lg"
              fontWeight="normal"
              px={6}
              colorScheme="blue"
              bg="blue.400"
              _hover={{ bg: 'blue.500' }}
            >
              Ücretsiz Başlayın
            </Button>
            <Button
              rounded="full"
              size="lg"
              fontWeight="normal"
              px={6}
              leftIcon={<FiPlay />}
              colorScheme="whiteAlpha"
            >
              Demo İzleyin
            </Button>
          </Stack>

          {/* Metriks */}
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={{ base: 4, md: 8 }}
            maxW="4xl"
            mx="auto"
            mt={8}
          >
            <MetricBox number="10K+" label="Aktif Kullanıcı" />
            <MetricBox number="50+" label="Enterprise Müşteri" />
            <MetricBox number="99.9%" label="Uptime" />
            <MetricBox number="24/7" label="Destek" />
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Animasyonlu gradient overlay */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="200px"
        bgGradient="linear(to-t, blackAlpha.600, transparent)"
      />
    </Box>
  )
}

const MetricBox = ({ number, label }: { number: string; label: string }) => (
  <Box textAlign="center">
    <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
      {number}
    </Text>
    <Text fontSize="sm" color="gray.200">
      {label}
    </Text>
  </Box>
)