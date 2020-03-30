import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Image = styled.Image`
  height: 20px;
  width: 20px;
  margin-top: 3px;
`;

export const Name = styled.Text`
  flex-wrap: wrap;
  padding-left: 5px;

  font-size: 13px;
`;

export const ItemData = styled(RectButton).attrs({
  rippleColor: Platform.OS === 'ios' ? null : '#beff33',
})`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;
