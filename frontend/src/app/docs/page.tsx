'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
  Link,
  Image,
  Stack,
  Button,
  Icon,
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'
import { FiBook, FiCode, FiLayers, FiServer } from 'react-icons/fi'
const documentationSections = [
  {
    title: 'Platform Genel Bakış',
    icon: FiLayers,
    description: 'AppLab Agent platformunun temel bileşenleri ve mimarisi hakkında bilgi edinin.',
    sections: [
      {
        title: 'Mimari Yapı',
        content: `AppLab Agent, modüler bir mimari üzerine inşa edilmiştir:

        - Ajan Motoru: İş yüklerini yöneten çekirdek bileşen
        - API Katmanı: RESTful ve GraphQL API'leri
        - Entegrasyon Katmanı: Harici sistemlerle iletişim
        - Görev Zamanlayıcı: Zamanlanmış görevleri yöneten bileşen`,
        image: '/docs/architecture.png',
      },
      {
        title: 'Temel Kavramlar',
        content: `Platformun temel kavramlarını öğrenin:

        1. Ajanlar
        - İş yüklerini yöneten otonom birimler
        - Yapılandırılabilir davranışlar
        - Olay tabanlı tetikleyiciler
        
        2. İş Akışları
        - Sıralı ve paralel görev zincirleri
        - Koşullu dallanmalar
        - Hata yönetimi ve geri alma
        
        3. Entegrasyonlar
        - API bağlantıları
        - Webhook tetikleyicileri
        - Veri dönüşümleri`,
        image: '/docs/concepts.png',
      },
    ],
  },
  {
    title: 'Başlangıç Kılavuzu',
    icon: FiBook,
    description: 'Platformu kullanmaya başlamak için adım adım rehber.',
    sections: [
      {
        title: 'Kurulum ve Yapılandırma',
        content: `Sistemi kurmak için adımlar:

        1. Ön Gereksinimler
        - Node.js 18 veya üzeri
        - Docker
        - PostgreSQL
        
        2. Kurulum
        \`\`\`bash
        git clone https://github.com/applabagent/platform
        cd platform
        npm install
        \`\`\`
        
        3. Yapılandırma
        - .env dosyasını oluşturun
        - Veritabanı bağlantısını yapılandırın
        - API anahtarlarını ayarlayın`,
        image: '/docs/setup.png',
      },
    ],
  },
  {
    title: 'API Dokümantasyonu',
    icon: FiCode,
    description: "REST ve GraphQL API'lerinin detaylı dokümantasyonu.",
    sections: [
      {
        title: 'REST API',
        content: `REST API Endpoints:

        1. Ajanlar
        GET /api/v1/agents - Tüm ajanları listele
        POST /api/v1/agents - Yeni ajan oluştur
        GET /api/v1/agents/:id - Ajan detaylarını getir
        
        2. İş Akışları
        GET /api/v1/workflows - İş akışlarını listele
        POST /api/v1/workflows - Yeni iş akışı oluştur
        
        3. Görevler
        GET /api/v1/tasks - Görevleri listele
        POST /api/v1/tasks - Yeni görev oluştur`,
        image: '/docs/api.png',
      },
    ],
  },
  {
    title: 'İleri Düzey Konular',
    icon: FiServer,
    description: 'Gelişmiş özellikler ve optimizasyon teknikleri.',
    sections: [
      {
        title: 'Ölçeklendirme',
        content: `Sistemi ölçeklendirme stratejileri:

        1. Yatay Ölçeklendirme
        - Konteyner orchestration
        - Load balancing
        - Dağıtık önbellek
        
        2. Dikey Ölçeklendirme
        - Kaynak optimizasyonu
        - Veritabanı indeksleme
        - Query optimizasyonu`,
        image: '/docs/scaling.png',
      },
    ],
  },
]

export default function Documentation() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box as="main" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="xl" mb={8}>
          Dokümantasyon
        </Heading>

        <Text fontSize="lg" mb={12}>
          AppLab Agent platformunun tüm özellikleri ve kullanımı hakkında detaylı bilgi edinin.
        </Text>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
          {documentationSections.map((section, index) => (
            <GridItem key={index}>
              <Box
                p={6}
                bg={bgColor}
                rounded="lg"
                border="1px solid"
                borderColor={borderColor}
                height="100%"
              >
                <Stack spacing={4}>
                  <Icon as={section.icon} boxSize={8} color="blue.500" />
                  <Heading as="h2" size="lg">
                    {section.title}
                  </Heading>
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    {section.description}
                  </Text>

                  {section.sections.map((subsection, subIndex) => (
                    <Box key={subIndex} mt={6}>
                      <Heading as="h3" size="md" mb={4}>
                        {subsection.title}
                      </Heading>
                      <Text whiteSpace="pre-line" mb={4}>
                        {subsection.content}
                      </Text>
                      {subsection.image && (
                        <Box border="1px solid" borderColor={borderColor} rounded="md" p={2}>
                          <Image
                            src={subsection.image}
                            alt={subsection.title}
                            rounded="md"
                            objectFit="cover"
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </GridItem>
          ))}
        </Grid>

        <Box mt={12} p={6} bg={bgColor} rounded="lg" border="1px solid" borderColor={borderColor}>
          <Heading as="h2" size="lg" mb={4}>
            İlave Kaynaklar
          </Heading>
          <Stack spacing={4}>
            <Link href="/docs/api" color="blue.500">
              API Referansı →
            </Link>
            <Link href="/docs/examples" color="blue.500">
              Örnek Projeler →
            </Link>
            <Link href="/docs/tutorials" color="blue.500">
              Video Eğitimleri →
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}