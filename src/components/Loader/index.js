import React from 'react';

import { Container, LoadingText, LoadingIcon } from './styles';

export default function Loader() {
  return (
    <Container>
      <LoadingText>Loading...</LoadingText>
      <LoadingIcon />
    </Container>
  );
}
