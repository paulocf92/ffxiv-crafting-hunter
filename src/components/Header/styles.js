import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

import logo from '~/assets/logo.png';

export const Background = styled(LinearGradient).attrs({
  colors: ['rgba(173, 255, 0, 0)', '#adff00'],
})`
  flex: 1;
  align-items: center;
  padding: 6px 0 38px;

  background: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #8acc00;
`;

export const Logo = styled.Image.attrs({
  source: logo,
  resizeMode: 'cover',
})`
  width: 100px;
  height: 32px;
`;
