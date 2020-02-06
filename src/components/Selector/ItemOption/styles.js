import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const Option = styled(RectButton)`
  padding: 5px;
`;
