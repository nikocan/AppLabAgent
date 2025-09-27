import { Box, Container, Link, Stack, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function Navbar() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={100}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Container maxW="container.xl" py={4}>
        <Stack
          direction="row"
          spacing={8}
          align="center"
          justify="space-between"
        >
          <NextLink href="/" passHref>
            <Link fontSize="xl" fontWeight="bold">
              AppLab Agent
            </Link>
          </NextLink>

          <Stack direction="row" spacing={8}>
            <NextLink href="/docs" passHref>
              <Link>Dokümantasyon</Link>
            </NextLink>
            <NextLink href="/help" passHref>
              <Link>Yardım</Link>
            </NextLink>
            <NextLink href="/updates" passHref>
              <Link>Güncellemeler</Link>
            </NextLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}