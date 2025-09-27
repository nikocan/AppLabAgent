'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react'

const updates = [
  {
    version: '2.1.0',
    date: '2025-09-25',
    type: 'major',
    changes: [
      'Yapay zeka destekli ajan optimizasyonu eklendi',
      'Performans iyileştirmeleri yapıldı',
      'Yeni dashboard arayüzü',
      'Gelişmiş analitik raporları',
    ],
  },
  {
    version: '2.0.5',
    date: '2025-09-10',
    type: 'patch',
    changes: [
      'Güvenlik güncellemeleri',
      'Hata düzeltmeleri',
      'Docker entegrasyonu iyileştirmeleri',
    ],
  },
  {
    version: '2.0.0',
    date: '2025-08-15',
    type: 'major',
    changes: [
      'Yeni nesil otomasyon motoru',
      'Çoklu ajan desteği',
      'Gerçek zamanlı metrikler',
      'API v2 desteği',
      'Yeni kullanıcı arayüzü',
    ],
  },
]

type UpdateType = 'major' | 'minor' | 'patch'

const UpdateBadge = ({ type }: { type: UpdateType }) => {
  const colors: Record<UpdateType, string> = {
    major: 'red',
    minor: 'blue',
    patch: 'green',
  }

  return (
    <Badge colorScheme={colors[type]} px={2} py={1} rounded="md">
      {type.toUpperCase()}
    </Badge>
  )
}

export default function Updates() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box as="main" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="xl" mb={8}>
          Güncellemeler ve Değişiklikler
        </Heading>

        <Text mb={8}>
          AppLab Agent platformunun en son güncellemeleri ve değişiklikleri burada
          listelenmektedir. Her güncelleme ile platformumuz daha da gelişmekte ve
          kullanıcılarımıza daha iyi bir deneyim sunmaktayız.
        </Text>

        <VStack spacing={8} align="stretch">
          {updates.map((update, index) => (
            <Box
              key={index}
              p={6}
              bg={bgColor}
              rounded="lg"
              border="1px solid"
              borderColor={borderColor}
              shadow="sm"
            >
              <HStack spacing={4} mb={4}>
                <Heading as="h2" size="md">
                  Sürüm {update.version}
                </Heading>
                <UpdateBadge type={update.type as UpdateType} />
                <Text color="gray.500" fontSize="sm">
                  {update.date}
                </Text>
              </HStack>

              <Divider mb={4} />

              <VStack align="stretch" spacing={2}>
                {update.changes.map((change, changeIndex) => (
                  <Text key={changeIndex}>• {change}</Text>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  )
}