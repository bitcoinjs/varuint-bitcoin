'use strict'
// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991
function checkUInt53 (n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) { throw new RangeError('value out of range') }
}
export function encode (n, buffer, offset) {
  checkUInt53(n)
  if (!buffer) { buffer = Buffer.allocUnsafe(encodingLength(n)) }
  if (!Buffer.isBuffer(buffer)) { throw new TypeError('buffer must be a Buffer instance') }
  if (!offset) { offset = 0 }
  let bytes = 0
  // 8 bit
  if (n < 0xfd) {
    buffer.writeUInt8(n, offset)
    bytes = 1
    // 16 bit
  } else if (n <= 0xffff) {
    buffer.writeUInt8(0xfd, offset)
    buffer.writeUInt16LE(n, offset + 1)
    bytes = 3
    // 32 bit
  } else if (n <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset)
    buffer.writeUInt32LE(n, offset + 1)
    bytes = 5
    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset)
    buffer.writeUInt32LE(n >>> 0, offset + 1)
    buffer.writeUInt32LE((n / 0x100000000) | 0, offset + 5)
    bytes = 9
  }
  return { buffer, bytes }
}
export function decode (buffer, offset) {
  if (!Buffer.isBuffer(buffer)) { throw new TypeError('buffer must be a Buffer instance') }
  if (!offset) { offset = 0 }
  const first = buffer.readUInt8(offset)
  // 8 bit
  if (first < 0xfd) {
    return { value: first, bytes: 1 }
    // 16 bit
  } else if (first === 0xfd) {
    return { value: buffer.readUInt16LE(offset + 1), bytes: 3 }
    // 32 bit
  } else if (first === 0xfe) {
    return { value: buffer.readUInt32LE(offset + 1), bytes: 5 }
    // 64 bit
  } else {
    const lo = buffer.readUInt32LE(offset + 1)
    const hi = buffer.readUInt32LE(offset + 5)
    const number = hi * 0x0100000000 + lo
    checkUInt53(number)
    return { value: number, bytes: 9 }
  }
}
export function encodingLength (n) {
  checkUInt53(n)
  return (n < 0xfd
    ? 1
    : n <= 0xffff
      ? 3
      : n <= 0xffffffff
        ? 5
        : 9)
}
