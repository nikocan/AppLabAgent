'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  UnorderedList,
  ListItem,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'

const helpTopics = [
  {
    title: 'Başlangıç Kılavuzu',
    content: `AppLab Agent platformuna hoş geldiniz! Bu bölümde, uygulamayı nasıl kullanmaya başlayacağınızı adım adım öğreneceksiniz:
    
    1. Hesap Oluşturma ve Giriş
    - Sağ üst köşedeki "Kayıt Ol" butonuna tıklayın
    - Gerekli bilgileri doldurun ve hesabınızı oluşturun
    - E-posta doğrulamasını tamamlayın
    - Giriş yapın ve dashboard'a erişin

    2. İlk Projenizi Oluşturma
    - Dashboard'da "Yeni Proje" butonuna tıklayın
    - Proje adı ve açıklaması girin
    - Proje türünü seçin
    - Otomasyon tercihlerini belirleyin

    3. Ajanları Yapılandırma
    - Proje detay sayfasında "Ajanlar" sekmesine gidin
    - "Yeni Ajan" butonuna tıklayın
    - Ajan türünü ve görevlerini tanımlayın
    - Tetikleyicileri ve koşulları belirleyin`,
  },
  {
    title: 'Sık Sorulan Sorular',
    content: `1. AppLab Agent nedir?
    AppLab Agent, işlerinizi otomatikleştirmenize ve optimize etmenize yardımcı olan bir otomasyon platformudur.
    
    2. Hangi entegrasyonları destekliyor?
    - GitHub
    - GitLab
    - Jira
    - Slack
    - Microsoft Teams
    - Custom API entegrasyonları
    
    3. Ücretsiz sürüm var mı?
    Evet, temel özellikleri içeren ücretsiz bir sürüm sunuyoruz.
    
    4. Özel geliştirmeler yapılabiliyor mu?
    Evet, API'lerimizi kullanarak kendi özel entegrasyonlarınızı geliştirebilirsiniz.`,
  },
  {
    title: 'Sorun Giderme',
    content: `Yaygın sorunlar ve çözümleri:

    1. Bağlantı Hataları
    - Ağ bağlantınızı kontrol edin
    - Güvenlik duvarı ayarlarınızı gözden geçirin
    - API anahtarlarınızın doğru olduğundan emin olun
    
    2. Ajan Çalışmıyor
    - Ajan durumunu kontrol edin
    - Log kayıtlarını inceleyin
    - Yapılandırma ayarlarını gözden geçirin
    
    3. Entegrasyon Sorunları
    - API kredilerini kontrol edin
    - Webhook URL'lerini doğrulayın
    - Rate limit durumunu kontrol edin`,
  },
]

export default function Help() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box as="main" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="xl" mb={8}>
          Yardım ve Destek
        </Heading>
        
        <Text mb={8}>
          AppLab Agent platformu hakkında yardıma mı ihtiyacınız var? 
          Aşağıdaki bölümlerde ihtiyacınız olan bilgileri bulabilirsiniz.
        </Text>

        <Accordion allowMultiple>
          {helpTopics.map((topic, index) => (
            <AccordionItem
              key={index}
              border="1px solid"
              borderColor={borderColor}
              bg={bgColor}
              rounded="md"
              mb={4}
            >
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    {topic.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} whiteSpace="pre-line">
                {topic.content}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <Box mt={12} p={6} bg={bgColor} rounded="md" border="1px solid" borderColor={borderColor}>
          <Heading as="h2" size="md" mb={4}>
            İletişim ve Destek
          </Heading>
          <Text mb={4}>
            Aradığınız bilgiyi bulamadınız mı? Bizimle iletişime geçin:
          </Text>
          <UnorderedList spacing={2}>
            <ListItem>
              <Link href="mailto:support@applabagent.com" color="blue.500">
                E-posta: support@applabagent.com
              </Link>
            </ListItem>
            <ListItem>
              <Link href="https://docs.applabagent.com" isExternal color="blue.500">
                Dokümantasyon
              </Link>
            </ListItem>
            <ListItem>
              <Link href="https://community.applabagent.com" isExternal color="blue.500">
                Topluluk Forumu
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>
      </Container>
    </Box>
  )
}