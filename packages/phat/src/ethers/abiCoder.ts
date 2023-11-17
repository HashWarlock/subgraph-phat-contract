import {Coders} from "@phala/ethers";

export type HexString = `0x${string}`;

export const uintCoder = new Coders.NumberCoder(32, false, "uint256");
export const uint8Coder = new Coders.NumberCoder(1, false, 'uint8');
export const bytesCoder = new Coders.BytesCoder("bytes");
export const uint8ArrayCoder = new Coders.ArrayCoder(uint8Coder, -1, "uint8[]");
export const addressCoder = new Coders.AddressCoder("address");
export const stringCoder = new Coders.StringCoder("string");
export const booleanCoder = new Coders.BooleanCoder("boolean");

export function encodeReply(reply: [number, number, string, boolean]): HexString {
    return Coders.encode([uintCoder, uintCoder, addressCoder, booleanCoder], reply) as HexString;
}
