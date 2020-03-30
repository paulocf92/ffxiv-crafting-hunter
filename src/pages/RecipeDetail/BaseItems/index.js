import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Item from './Item';

import { OutputItem, OutputItemText, OutputItemImage } from '../shared_styles';
import { Container, Label, ItemList } from './styles';

export default function BaseItems() {
  const recipe = useSelector(state => state.recipe.editing.item);
  const items = useSelector(state => state.recipe.editing.baseItems);

  const data = useMemo(
    () =>
      items
        ? {
            crystals: items.ids.slice(items.rawItemCount),
            rawItems: items.ids.slice(0, items.rawItemCount),
          }
        : null,
    [items],
  );

  return (
    <Container>
      {recipe && (
        <OutputItem>
          <OutputItemImage
            source={{
              uri: recipe.icon,
            }}
          />
          <OutputItemText>{recipe.name}</OutputItemText>
        </OutputItem>
      )}
      {data && (
        <>
          <Label>Raw materials</Label>
          <ItemList
            initialNumToRender={items.rawItemCount}
            data={data.rawItems}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item: id }) => <Item data={items.data[id]} />}
          />
          <Label>Shards, crystals and clusters</Label>
          <ItemList
            data={data.crystals}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item: id }) => <Item data={items.data[id]} />}
          />
        </>
      )}
    </Container>
  );
}
