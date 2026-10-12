import tape from 'tape';
import { decode } from '../src/esm/index.js';

for (const offset of [-1, -0.5, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  tape(`decode rejects invalid offset ${offset}`, t => {
    for (const bytes of [[1, 2], [1, 2, 0xfd]]) {
      t.throws(() => decode(Uint8Array.from(bytes), offset), RangeError);
    }
    t.end();
  });
}

tape('decode preserves valid offsets for every CompactSize width', t => {
  for (const [hex, expected, bytes] of [
    ['fc', 252n, 1],
    ['fdfd00', 253n, 3],
    ['fe00000100', 65536n, 5],
    ['ff0000000001000000', 4294967296n, 9],
  ]) {
    const encoded = Buffer.from(hex, 'hex');
    const padded = Buffer.concat([Buffer.from([0x42]), encoded]);
    t.deepEqual(decode(padded, 1), { numberValue: Number(expected), bigintValue: expected, bytes });
    t.deepEqual(decode(encoded, 0), decode(encoded));
    t.throws(() => decode(encoded, encoded.length), /buffer too small/);
  }
  t.end();
});
