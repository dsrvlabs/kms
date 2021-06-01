# @dsrv/kms
dsrv key management store

## Usage
```html
<script src="node_modules/argon2-browser/lib/argon2.js"></script>
```
```javascript
import { KMS, COIN, createKeyStore } from "@dsrv/kms";


// create key store
const mnemonic = "....";
const password = "strong password";
const keyStore = await createKeyStore(mnemonic.split(" "), password);

/*
{
  t: 9,
  m: 262144,
  s: '89aaLUkbh3E3yvBvatitUsmznTMd2p7jU1cri5D5xBnu',
  j: [
    'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUEJFUzItSFMyNTYrQTEyOEtXIiwia2lkIjoiT1lBd0hGRW4zYmFKSWJkLXoyc09VMFhnRjVLRmtfb2ZBeWQwWmxMM0FjMCIsInAycyI6IlBqNHpCdS1aMC1laVVPcGx5emh5dXciLCJwMmMiOjgxOTJ9',
    'A7jjx9G1jwylhRqmk9WLgc29_G_0Bn36buUSXC1u6zRq0jLzAEKOpg',
    '9COzNxXnCc_T1Jtg',
    'VD5EXQ',
    'BboSFxRBdGQlNyHqG8hOxw'
  ]
}
*/

// get account
const kms = new KMS({
  keyStore,
  transport: null,
});
const account = await kms.getAccount(password, {
  type: COIN.MINA,
  account: 0,
  index: 0,
});

/*
B62qpgyAmA5yNgY4buNhTxTKYTvkqSFf442KkHzYHribCFjDmXcfHHm
*/

```
