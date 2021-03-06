import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton)`
  height: 40px;
  background: #96e80a;
  border-radius: 4px;
  padding: 0 30px;

  align-items: center;
  justify-content: center;
`;

export const Text = styled.Text`
  font-weight: bold;
  font-size: 16px;
`;
