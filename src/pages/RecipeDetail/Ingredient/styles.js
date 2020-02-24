import styled from 'styled-components/native';

export const Container = styled.View`
  align-items: center;
  justify-content: center;
  width: 80px;
  margin: 1px 5px 5px;
`;

export const Item = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: rgba(150, 150, 150, 0.8);
  border-radius: 4px;
  padding: 5px;
`;

export const ItemData = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const ItemName = styled.Text`
  padding-left: 5px;
  color: #fff;
`;

export const ItemQty = styled.Text`
  padding-right: 5px;
  font-size: 14px;
  color: #fff;
`;

export const ItemIcon = styled.Image`
  height: 20px;
  width: 20px;
  padding: 0 5px;
`;
