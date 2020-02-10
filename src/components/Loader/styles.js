import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #eee;
  opacity: 0.7;
`;

export const LoadingText = styled.Text`
  padding: 0 0 30px 15px;
  font-size: 24px;
  color: #8cd115;
`;

export const LoadingIcon = styled.ActivityIndicator.attrs({
  size: 'large',
  color: '#8cd115',
})`
  transform: scale(2.5);
`;
