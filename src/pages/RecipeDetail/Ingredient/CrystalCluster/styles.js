import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  align-items: center;
  justify-content: center;
  min-width: 80px;
  margin: 1px 0;
`;

export const Crystal = styled(TouchableOpacity).attrs({
  activeOpacity: 0.4,
})`
  flex-direction: row;
  background: rgba(150, 150, 150, 0.8);
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 2px;
`;

export const CrystalData = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: center;
`;

export const CrystalQty = styled.Text`
  padding-right: 5px;
  font-size: 10px;
  color: #fff;
`;

export const CrystalIcon = styled.Image`
  height: 15px;
  width: 15px;
  padding: 0 5px;
`;
