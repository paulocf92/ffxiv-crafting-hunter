import styled from 'styled-components/native';

export const Container = styled.View``;

export const Label = styled.Text`
  font-size: 18px;
  padding: 10px 10px 0;
`;

export const ItemList = styled.FlatList.attrs({
  showsVerticalScrollIndicator: false,
})`
  padding: 10px 15px;
`;
