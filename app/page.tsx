'use client'

import styled from 'styled-components'

export default function Page() {
  return (
    <Box>
      <h1>Hello World!</h1>
    </Box>
  )
}

const Box = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;
`
