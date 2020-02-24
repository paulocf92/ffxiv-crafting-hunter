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

export const Line = styled.View`
  flex-direction: ${props => (props.horizontal ? 'row' : 'column')};
  height: ${props => (props.horizontal ? '1px' : `${props.length}px`)};
  width: ${props => (props.horizontal ? `${props.length}px` : '1px')};
  border-left-width: ${props =>
    props.horizontal ? 0 : `${props.thickness || 1}px`};
  border-left-color: ${props => (props.color ? props.color : '#000')};
  border-bottom-width: ${props =>
    props.horizontal ? `${props.thickness || 1}px` : 0};
  border-bottom-color: ${props => (props.color ? props.color : '#000')};
`;

export const RecipeTreeContainer = styled.ScrollView``;

export const RecipeTree = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {
    flexDirection: 'column',
  },
})``;

export const RecipeTreeNode = styled.View`
  justify-content: center;
`;

export const RecipeTreeRow = styled.View`
  flex-direction: row;
`;
