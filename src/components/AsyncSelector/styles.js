import styled from 'styled-components/native';

export const Container = styled.SafeAreaView``;

export const InputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  height: 40px;
  margin-bottom: 5px;
  padding: 0 5px;

  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
`;

export const SearchInput = styled.TextInput`
  flex-basis: 90%;
`;

export const ListContainer = styled.View`
  flex: 1;
  z-index: 2;
`;

export const List = styled.FlatList.attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  background: ${props =>
    props.opacity
      ? `rgba(240, 240, 240, ${props.opacity})`
      : 'rgba(240, 240, 240, 1)'};
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  padding: 3px 5px;
  position: absolute;
`;
