import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const OutputItem = styled.View`
  flex-direction: row;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.9);
`;

export const OutputItemText = styled.Text`
  font-size: 18px;
  color: #fff;
  padding-left: 5px;
`;

export const Image = styled.Image`
  height: ${props => (props.size ? `${props.size}px` : '30px')};
  width: ${props => (props.size ? `${props.size}px` : '30px')};
`;

export const RecipeTreeContainer = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexDirection: 'column',
    flexGrow: 1,
  },
})``;

export const RecipeTree = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {
    padding: 10,
  },
})``;

export const RecipeTreeRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => (props.spacing ? '20px' : 0)};
`;
