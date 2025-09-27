import { ThemeConfig, extendTheme } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#B3E3FF', 
      200: '#80D0FF',
      300: '#4DBDFF',
      400: '#1AAAFF',
      500: '#0097E6',
      600: '#007AB3',
      700: '#005C80',
      800: '#003D4D',
      900: '#001F1A',
    },
  },
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'full',
      },
      sizes: {
        xl: {
          h: '56px',
          fontSize: 'lg',
          px: '32px',
        },
      },
      variants: {
        'with-shadow': {
          bg: 'red.400',
          boxShadow: '0 0 2px 2px #efdfde',
        },
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.200' : 'brand.500',
        }),
      },
    },
  },
})

export default theme