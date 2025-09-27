'use client'

import { Box, Container, Stack, Heading, Text, Button, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const plans = [
  {
    name: 'Başlangıç',
    price: '0',
    features: [
      'Temel AI özellikleri',
      '5 proje limiti',
      'Topluluk desteği',
      'Temel analitikler',
      'Git entegrasyonu',
    ],
    buttonText: 'Ücretsiz Başlayın',
    buttonVariant: 'outline',
  },
  {
    name: 'Pro',
    price: '49',
    features: [
      'Gelişmiş AI özellikleri',
      'Sınırsız proje',
      'Öncelikli destek',
      'Detaylı analitikler',
      'CI/CD entegrasyonu',
      'Özel temalar',
    ],
    buttonText: 'Pro\'ya Geçin',
    buttonVariant: 'solid',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Özel',
    features: [
      'Özelleştirilmiş AI modelleri',
      'Özel geliştirmeler',
      '7/24 kurumsal destek',
      'SLA garantisi',
      'Özel eğitimler',
      'On-premise kurulum',
      'SSO entegrasyonu',
    ],
    buttonText: 'İletişime Geçin',
    buttonVariant: 'ghost',
  },
]

export default function PricingSection() {
  const bg = useColorModeValue('gray.50', 'gray.900')
  const boxBg = useColorModeValue('white', 'gray.800')

  return (
    <Box bg={bg} py={20}>
      <Container maxW="7xl">
        <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={16}>
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight="110%"
          >
            Basit ve Şeffaf{' '}
            <Text as="span" color="blue.400">
              Fiyatlandırma
            </Text>
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.200')} fontSize="xl">
            İhtiyaçlarınıza uygun planı seçin. İstediğiniz zaman yükseltme yapabilirsiniz.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} alignItems="center">
          {plans.map((plan, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Box
                bg={boxBg}
                rounded="xl"
                overflow="hidden"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                p={6}
                textAlign="center"
                position="relative"
                transform={plan.popular ? 'scale(1.05)' : 'none'}
                boxShadow={plan.popular ? 'xl' : 'base'}
                zIndex={plan.popular ? 1 : 0}
              >
                {plan.popular && (
                  <Box
                    position="absolute"
                    top={4}
                    right={4}
                    bg="blue.400"
                    color="white"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    Popular
                  </Box>
                )}

                <Stack spacing={4}>
                  <Heading size="md">{plan.name}</Heading>
                  <Stack spacing={1}>
                    <Text fontSize="4xl" fontWeight="bold">
                      ₺{plan.price}
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      /ay
                    </Text>
                  </Stack>
                  <Stack spacing={3}>
                    {plan.features.map((feature, index) => (
                      <Text key={index} color={useColorModeValue('gray.500', 'gray.400')}>
                        {feature}
                      </Text>
                    ))}
                  </Stack>
                  <Button
                    mt={4}
                    w="full"
                    colorScheme={plan.popular ? 'blue' : 'gray'}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </Stack>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}