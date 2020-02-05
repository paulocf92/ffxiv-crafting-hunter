import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const Background = styled(LinearGradient).attrs({
  colors: ['#fff', '#adff00', '#fff'],
})`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

export const Instructions = styled.Text`
  padding: 80px 0 40px;
`;

export const Logo = styled.Image`
  width: 280px;
  height: 91px;
`;
