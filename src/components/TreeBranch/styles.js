import styled from 'styled-components/native';

export const Container = styled.View`
  align-items: center;
`;

export const Fill = styled.View`
  flex-grow: 1;
`;

const handleAlignment = type => {
  switch (type) {
    case 'u':
      return 'flex-end';
    case 'd':
      return 'flex-start';
    default:
      return 'center';
  }
};

export const Vertical = styled.View`
  flex-grow: 1;
  justify-content: ${props => handleAlignment(props.type)};

  border-left-width: ${props => `${props.thickness}px`};
  border-left-color: ${props => props.color};
`;

export const Horizontal = styled.View`
  width: ${props => `${props.length}px`};
  border-top-width: ${props => `${props.thickness}px`};
  border-top-color: ${props => props.color};
  background: red;
`;
