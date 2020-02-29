import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  justify-content: center;
  width: 200px;
  height: ${props => (props.withCrystals ? '80px' : '64px')};
`;

export const Item = styled(TouchableOpacity).attrs({
  activeOpacity: 0.4,
})`
  flex-direction: row;
  flex-grow: 1;
  background: rgba(150, 150, 150, 0.8);
  border-radius: 4px;
  padding: 4px;
  margin: 2px 0;
`;

export const ItemData = styled.View`
  flex-grow: 1;
  flex-direction: row;
`;

export const Progress = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const ItemText = styled.Text`
  flex-wrap: wrap;
  padding-left: 5px;

  font-size: 12px;
  color: #fff;
`;

export const ItemQty = styled.Text`
  width: 22px;
  text-align: center;
  padding-right: 5px;
  color: #fff;
`;

export const ItemIcon = styled.Image`
  height: 20px;
  width: 20px;
  margin-top: 3px;
`;
