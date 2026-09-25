"use strict";
import tape from "tape";
import { encode, decode, encodingLength } from "../src/esm/index.js";

import fixtures from "./fixtures.json" assert { type: "json" };
const { valid, invalid } = fixtures;

valid.forEach(function (fixture, i) {
    tape("valid encode #" + (i + 1), function (t) {
        const res = encode(BigInt(fixture.dec));
        t.same(Buffer.from(res.buffer).toString("hex"), fixture.hex);
        t.same(res.bytes, fixture.hex.length / 2);
        t.end();
    });

    tape("valid decode #" + (i + 1), function (t) {
        const res = decode(Buffer.from(fixture.hex, "hex"));
        if(fixture.dec <= Number.MAX_SAFE_INTEGER) {            
            t.same(res.numberValue, fixture.dec);
        }else {
            t.same(res.numberValue, null);
            t.same(res.bigintValue, BigInt(fixture.dec));
        }
        t.same(res.bytes, fixture.hex.length / 2);
        t.end();
    });

    tape("valid encodingLength #" + (i + 1), function (t) {
        t.same(encodingLength(fixture.dec), fixture.hex.length / 2);
        t.end();
    });
});

invalid.forEach(function (fixture, i) {
    tape("invalid encode #" + (i + 1), function (t) {
        t.throws(function () {
            encode(fixture.dec);
        }, new RegExp(fixture.msg));
        t.end();
    });

    tape("invalid encodingLength #" + (i + 1), function (t) {
        t.throws(function () {
            encodingLength(fixture.dec);
        }, new RegExp(fixture.msg));
        t.end();
    });
});

tape("encode", function(t) {
    t.test("should throw if number and > 53 bits", function (t) {
        t.throws(function () {
            encode(Number.MAX_SAFE_INTEGER + 2);
        }, new RegExp(/value out of range/));
        t.end();
    })

    t.test("should throw if bigint and > 64 bits", function (t) {
        t.throws(function () {
            encode(0xffffffffffffffffffn + 2n);
        }, new RegExp(/value out of range/));
        t.end();
    })
})

tape("encode", function (t) {
    t.test("write to buffer with offset", function (t) {
        const buffer = Buffer.from([0x00, 0x00]);
        const res = encode(BigInt(0xfc), buffer, 1);
        t.same(res.buffer.toString("hex"), "00fc");
        t.same(res.bytes, 1);
        t.end();
    });

    t.end();
});

tape("decode", function (t) {
    t.test("read from buffer with offset", function (t) {
        var buffer = Buffer.from([0x00, 0xfc]);
        const res = decode(buffer, 1);
        t.same(res.numberValue, 0xfc);
        t.same(res.bytes, 1);
        t.end();
    });

    t.test("should be a valid offset", function (t) {
        t.throws(function () {
            decode([], 1);
        }, new Error("buffer too small"));
        t.end();
    });

    t.test("should return a number if it is valid", function (t) {
        var buffer = Buffer.alloc(18);
        buffer.writeUIntBE(0xff, 0, 1);
        buffer.writeBigUint64LE(BigInt(Number.MAX_SAFE_INTEGER), 1);
        const res = decode(buffer, 0);
        t.same(res.numberValue, Number.MAX_SAFE_INTEGER);
        t.same(res.bigintValue, BigInt(Number.MAX_SAFE_INTEGER));
        t.same(res.bytes, 9);
        t.end();
    });

    t.test("should reject a non-minimal encoding", function (t) {
        t.throws(function () {
            decode(Buffer.from("fd0100", "hex"));
        }, new Error("non-minimal encoding"));
        t.throws(function () {
            decode(Buffer.from("fe01000000", "hex"));
        }, new Error("non-minimal encoding"));
        t.throws(function () {
            decode(Buffer.from("ff0100000000000000", "hex"));
        }, new Error("non-minimal encoding"));
        t.end();
    });

    t.test("should return null if a number is invalid", function (t) {
        var buffer = Buffer.alloc(18);
        buffer.writeUIntBE(0xff, 0, 1);
        buffer.writeBigUint64LE(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 1);
        const res = decode(buffer, 0);
        t.same(res.numberValue, null);
        t.same(res.bigintValue, BigInt(Number.MAX_SAFE_INTEGER) + 1n);
        t.same(res.bytes, 9);
        t.end();
    });

    t.end();
});
