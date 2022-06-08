import { StyledComponentsRegistry } from '@/components/StyledComponentRegistry'

import './global.css'

type RootLayoutProps = {
  children: React.ReactNode
}
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />

        <title>Inspired Beings</title>

        <link href="/images/logo-notext-transparent-512x512.png" rel="icon" />
      </head>
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
