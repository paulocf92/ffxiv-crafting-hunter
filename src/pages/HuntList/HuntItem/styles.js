import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  flex-direction: row;

  padding-bottom: 5px;
`;

export const Delete = styled(TouchableOpacity).attrs({
  activeOpacity: 0.4,
})`
  justify-content: center;
`;

export const ItemContainer = styled.View`
  flex: 1;

  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const Item = styled(RectButton)`
  flex-direction: row;
  padding: 8px;
`;

export const Title = styled.Text`
  font-weight: bold;
  padding-left: 5px;
`;

export const Image = styled.Image`
  height: 20px;
  width: 20px;
`;
