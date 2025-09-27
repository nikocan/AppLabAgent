'use client'

import { Box, Container, SimpleGrid, Heading, Text, Icon, Stack, useColorModeValue } from '@chakra-ui/react'
import { FiDatabase, FiLayers, FiGitBranch, FiCpu, FiShield, FiCloud } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const features = [
  {
    title: 'Veri Yönetimi',
    text: 'Gelişmiş veri yönetimi ve görselleştirme araçları ile verilerinizi kontrol edin.',
    icon: FiDatabase,
  },
  {
    title: 'Modüler Mimari',
    text: 'Ölçeklenebilir ve genişletilebilir modüler mimari yapısı.',
    icon: FiLayers,
  },
  {
    title: 'Versiyon Kontrolü',
    text: 'Git tabanlı versiyon kontrol sistemi ile kod yönetimi.',
    icon: FiGitBranch,
  },
  {
    title: 'AI Optimizasyon',
    text: 'Yapay zeka destekli kod optimizasyonu ve öneriler.',
    icon: FiCpu,
  },
  {
    title: 'Güvenlik',
    text: 'Enterprise-grade güvenlik ve şifreleme sistemleri.',
    icon: FiShield,
  },
  {
    title: 'Cloud Native',
    text: 'Modern bulut altyapısı ve container desteği.',
    icon: FiCloud,
  },
]

export default function FeaturesSection() {
  const bg = useColorModeValue('white', 'gray.800')
  const boxBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  return (
    <Box bg={bg} py={20}>
      <Container maxW="7xl">
        <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={16}>
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight="110%"
          >
            Güçlü{' '}
            <Text as="span" color="blue.400">
              Özellikler
            </Text>
          </Heading>
          <Text color={textColor} fontSize="xl">
            Modern uygulama geliştirme için ihtiyacınız olan tüm araçlar tek bir platformda.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {features.map((feature, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Stack
                bg={boxBg}
                rounded="xl"
                p={8}
                spacing={4}
                height="100%"
                border="1px solid"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
                _hover={{
                  transform: 'translateY(-5px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.3s"
              >
                <Icon
                  as={feature.icon}
                  w={10}
                  h={10}
                  color="blue.400"
                />
                <Heading size="md">{feature.title}</Heading>
                <Text color={textColor}>{feature.text}</Text>
              </Stack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}