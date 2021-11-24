import { createMnemonic } from '.';

test('mnemonic length check', () => {
  const mnemonic = createMnemonic();

  expect(mnemonic.split(' ').length).toBe(24);
});
