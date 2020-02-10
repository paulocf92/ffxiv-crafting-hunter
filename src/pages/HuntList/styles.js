import styled from 'styled-components/native';
import Button from '~/components/Button';

export const Container = styled.View`
  flex: 1;
  padding: 20px;
`;

export const ClearButton = styled(Button)`
  background: ${props => (props.enabled ? '#f64c75' : '#e5e5e5')};
`;

export const List = styled.FlatList.attrs({
  showsVerticalScrollIndicator: false,
})`
  padding: 10px 0;
`;
