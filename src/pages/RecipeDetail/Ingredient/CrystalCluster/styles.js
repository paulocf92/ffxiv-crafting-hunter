import styled from 'styled-components/native';

export const Container = styled.View`
  align-items: center;
  justify-content: center;
  width: 80px;
  margin: 1px 5px 5px;
`;

export const Crystal = styled.View`
  flex-direction: row;
  background: rgba(150, 150, 150, 0.8);
  border-radius: 4px;
  padding: 2px 5px;
  margin-bottom: 2px;
`;

export const CrystalData = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
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
