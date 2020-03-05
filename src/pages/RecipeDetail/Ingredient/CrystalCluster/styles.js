import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const Container = styled(TouchableOpacity).attrs({
  activeOpacity: 0.4,
})`
  align-items: center;
  justify-content: center;
  min-width: 80px;
  margin: 1px 0;
`;

export const Crystal = styled(LinearGradient)`
  flex-direction: row;
  margin-bottom: 2px;
  padding: 5px;
  border-radius: 4px;
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
