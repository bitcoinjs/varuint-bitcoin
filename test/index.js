'use strict'
import tape from 'tape'
import { encode, decode, encodingLength } from '../src/esm/index.js'

import fixtures from './fixtures.json' assert { type: "json" }
const { valid, invalid } = fixtures

valid.forEach(function (fixture, i) {
  tape('valid encode #' + (i + 1), function (t) {
    const res = encode(fixture.dec)
    t.same(Buffer.from(res.buffer).toString('hex'), fixture.hex)
    t.same(res.bytes, fixture.hex.length / 2)
    t.end()
  })

  tape('valid decode #' + (i + 1), function (t) {
    const res = decode(Buffer.from(fixture.hex, 'hex'))
    t.same(res.value, fixture.dec)
    t.same(res.bytes, fixture.hex.length / 2)
    t.end()
  })

  tape('valid encodingLength #' + (i + 1), function (t) {
    t.same(encodingLength(fixture.dec), fixture.hex.length / 2)
    t.end()
  })
})

invalid.forEach(function (fixture, i) {
  tape('invalid encode #' + (i + 1), function (t) {
    t.throws(function () {
      encode(fixture.dec)
    }, new RegExp(fixture.msg))
    t.end()
  })

  tape('invalid encodingLength #' + (i + 1), function (t) {
    t.throws(function () {
      encodingLength(fixture.dec)
    }, new RegExp(fixture.msg))
    t.end()
  })

  if (fixture.hex) {
    tape('invalid decode #' + (i + 1), function (t) {
      t.throws(function () {
        t.decode(decode(Buffer.from(fixture.hex, 'hex')).bytes)
      }, new RegExp(fixture.msg))
      t.end()
    })
  }
})

tape('encode', function (t) {
  t.test('write to buffer with offset', function (t) {
    const buffer = Buffer.from([0x00, 0x00])
    const res = encode(0xfc, buffer, 1)
    t.same(res.buffer.toString('hex'), '00fc')
    t.same(res.bytes, 1)
    t.end()
  })

  t.end()
})

tape('decode', function (t) {
  t.test('read from buffer with offset', function (t) {
    var buffer = Buffer.from([0x00, 0xfc])
    const res = decode(buffer, 1)
    t.same(res.value, 0xfc)
    t.same(res.bytes, 1)
    t.end()
  })

  t.test('should be a valid offset', function (t) {
    t.throws(function () {
      decode([], 1)
    }, new Error('buffer too small'))
    t.end()
  })

  t.end()
})
