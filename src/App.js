import { applySnapshot, getSnapshot, destroy, types } from 'mobx-state-tree';
import { moveItem } from 'mobx-utils';
import React, { useCallback, useEffect } from 'react';
import { Observer } from 'mobx-react';

const Item = types.model({
  id: types.identifier,
});

const Root = types
  .model({
    items: types.map(Item),
    itemRefs: types.array(types.safeReference(Item)),
  })
  .actions((self) => ({
    addItemRef(id) {
      self.itemRefs.push(id);
    },

    removeItem(id) {
      const item = self.items.get(id);
      destroy(item);
    },

    swap() {
      moveItem(self.itemRefs, 0, 1);
    },
  }));

const apple = Item.create({ id: 'apple' });
const orange = Item.create({ id: 'orange' });

// Store has apple
const store = Root.create({
  items: {
    apple,
    orange,
  },
});

const App = () => {
  useEffect(() => {
    applySnapshot(store, {
      ...getSnapshot(store),
      itemRefs: [apple.id, orange.id],
    });
  }, []);

  const handleRemoveItem = useCallback(
    (id) => (e) => {
      window.setTimeout(() => store.removeItem(id), 1);
    },
    []
  );

  const handleSwap = useCallback(
    (id) => (e) => {
      store.swap();
    },
    []
  );

  return (
    <div className="App">
      <main>
        <Observer>
          {() => (
            <div>
              <h1>items</h1>
              {store.itemRefs.map((i) => (
                <div key={i.id}>
                  {i.id}{' '}
                  <button onClick={handleRemoveItem(i.id)}> remove </button>
                </div>
              ))}
              <button onClick={handleSwap()}> swap 0/1 </button>
            </div>
          )}
        </Observer>

        <h1>snapshot before via unobserved</h1>
        <pre>{JSON.stringify(store.toJSON(), null, 2)}</pre>

        <h1>snapshot after via observed</h1>
        <Observer>
          {() => <pre>{JSON.stringify(store.toJSON(), null, 2)}</pre>}
        </Observer>
      </main>
    </div>
  );
};

export default App;
