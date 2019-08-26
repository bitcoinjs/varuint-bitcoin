
import tape from 'tape';
import * as varuint from '../';
import fixtures from './fixtures.json';

fixtures.valid.forEach((fixture, i) => {
  tape('valid encode #' + (i + 1), t => {
    t.same(varuint.encode(fixture.dec).toString('hex'), fixture.hex);
    t.same(varuint.encode.bytes, fixture.hex.length / 2);
    t.end();
  });

  tape('valid decode #' + (i + 1), t => {
    t.same(varuint.decode(Buffer.from(fixture.hex, 'hex')), fixture.dec);
    t.same(varuint.decode.bytes, fixture.hex.length / 2);
    t.end();
  });

  tape('valid encodingLength #' + (i + 1), t => {
    t.same(varuint.encodingLength(fixture.dec), fixture.hex.length / 2);
    t.end();
  });
});

fixtures.invalid.forEach((fixture, i) => {
  tape('invalid encode #' + (i + 1), t => {
    t.throws(() => {
      varuint.encode(fixture.dec);
    }, new RegExp(fixture.msg));
    t.end();
  });

  tape('invalid encodingLength #' + (i + 1), t => {
    t.throws(() => {
      varuint.encodingLength(fixture.dec);
    }, new RegExp(fixture.msg));
    t.end();
  });

  if (fixture.hex) {
    tape('invalid decode #' + (i + 1), t => {
      t.throws(() => {
        varuint.decode(Buffer.from(fixture.hex, 'hex'));
      }, new RegExp(fixture.msg));
      t.end();
    });
  }
});

tape('encode', t => {
  t.test('write to buffer with offset', tt => {
    const buffer = Buffer.from([0x00, 0x00]);
    tt.same(varuint.encode(0xfc, buffer, 1).toString('hex'), '00fc');
    tt.same(varuint.encode.bytes, 1);
    tt.end();
  });

  t.end();
});

tape('decode', t => {
  t.test('read from buffer with offset', tt => {
    const buffer = Buffer.from([0x00, 0xfc]);
    tt.same(varuint.decode(buffer, 1), 0xfc);
    tt.same(varuint.decode.bytes, 1);
    tt.end();
  });

  t.end();
});
