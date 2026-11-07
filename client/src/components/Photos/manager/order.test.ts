import { describe, expect, it } from 'vitest';

import { reconcileOrder } from './order';

const items = (...ids: string[]) => ids.map(id => ({ id }));

describe('reconcileOrder', () => {
  it('drops items that are gone and appends ones the order lacks', () => {
    expect(
      reconcileOrder(items('3', 'gone', '1'), items('1', '2', '3', 'new')),
    ).toEqual(items('3', '1', '2', 'new'));
  });
});
