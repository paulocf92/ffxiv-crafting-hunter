import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

export const Container = styled.View`
  flex: 1;
  flex-direction: row;

  border-bottom-width: ${props => (props.last ? 0 : '1px')};
  border-bottom-color: #d2d2d2;
  padding-bottom: ${props => (props.last ? 0 : '3px')};
  margin-bottom: ${props => (props.last ? 0 : '3px')};
`;

export const Option = styled(RectButton).attrs({
  rippleColor: Platform.OS === 'ios' ? null : '#beff33',
})`
  width: 100%;
  padding: 6px 5px 7px;
`;
