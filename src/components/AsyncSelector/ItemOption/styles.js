import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  border-top-width: 1px;
  border-top-color: #ddd;
  border-right-width: 1px;
  border-right-color: #ddd;
  border-left-width: 1px;
  border-left-color: #ddd;
  border-bottom-width: ${props => (props.last ? '1px' : 0)};
  border-bottom-color: #ddd;
`;

export const Option = styled(RectButton)`
  padding: 5px 5px 5px 10px;
`;
