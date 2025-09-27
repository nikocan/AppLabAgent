'use client'

import { Box, Container, Stack, Heading, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export default function CTASection() {
  const bg = useColorModeValue('blue.50', 'blue.900')

  return (
    <Box bg={bg} py={20}>
      <Container maxW="7xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack
            spacing={4}
            as={Container}
            maxW="4xl"
            textAlign="center"
            position="relative"
          >
            {/* Background decoration */}
            <Box
              position="absolute"
              top="-20%"
              left="50%"
              transform="translateX(-50%)"
              width="140%"
              height="140%"
              backgroundImage="radial-gradient(circle, rgba(66, 153, 225, 0.1) 0%, transparent 70%)"
              zIndex={0}
            />

            <Heading
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
              lineHeight="110%"
              zIndex={1}
            >
              Geleceğin Teknolojisine{' '}
              <Text as="span" color="blue.400">
                Bugün Başlayın
              </Text>
            </Heading>
            
            <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize="xl" zIndex={1}>
              Modern uygulama geliştirmenin gücünü keşfedin. AI destekli geliştirme araçlarıyla
              projelerinizi hızlandırın.
            </Text>

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={4}
              justify="center"
              zIndex={1}
              pt={6}
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
                Ücretsiz Hesap Oluşturun
              </Button>
              <Button
                rounded="full"
                size="lg"
                fontWeight="normal"
                px={6}
                variant="outline"
                colorScheme="blue"
              >
                Daha Fazla Bilgi
              </Button>
            </Stack>

            {/* Trust indicators */}
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={{ base: 4, md: 8 }}
              justify="center"
              pt={10}
              zIndex={1}
            >
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                ⭐️ 4.9/5 Müşteri Memnuniyeti
              </Text>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                🔒 Enterprise-Grade Güvenlik
              </Text>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                🚀 7/24 Teknik Destek
              </Text>
            </Stack>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  )
}