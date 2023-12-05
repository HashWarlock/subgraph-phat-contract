// *** YOU ARE LIMITED TO THE FOLLOWING IMPORTS TO BUILD YOUR PHAT CONTRACT     ***
// *** ADDING ANY IMPORTS WILL RESULT IN ERRORS & UPLOADING YOUR CODE TO PHALA  ***
// *** NETWORK WILL FAIL. IF YOU WANT TO KNOW MORE, JOIN OUR DISCORD TO SPEAK   ***
// *** WITH THE PHALA TEAM AT https://discord.gg/5HfmWQNX THANK YOU             ***
// *** FOR DOCS ON HOW TO CUSTOMIZE YOUR PC 2.0 https://bit.ly/customize-pc-2-0 ***
import "@phala/pink-env";
import {decodeAbiParameters, encodeAbiParameters, parseAbiParameters} from "viem";

type HexString = `0x${string}`;
const encodeReplyAbiParams = 'uint respType, uint id, uint256 score';
const decodeRequestAbiParams = 'uint id, address target';

function encodeReply(abiParams: string, reply: any): HexString {
    return encodeAbiParameters(parseAbiParameters(abiParams),
        reply
    );
}

function decodeRequest(abiParams: string, request: HexString): any {
    return decodeAbiParameters(parseAbiParameters(abiParams),
        request
    );
}

// Defined in OracleConsumerContract.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

enum Error {
    BadRequestString = "BadRequestString",
    FailedToFetchData = "FailedToFetchData",
    FailedToDecode = "FailedToDecode",
    MalformedRequest = "MalformedRequest",
}

function errorToCode(error: Error): number {
    switch (error) {
        case Error.BadRequestString:
            return 1;
        case Error.FailedToFetchData:
            return 2;
        case Error.FailedToDecode:
            return 3;
        case Error.MalformedRequest:
            return 4;
        default:
            return 0;
    }
}
function stringToHex(str: string): string {
    var hex = "";
    for (var i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return "0x" + hex;
}

function fetchApiStats(apiUrl: string, apiKey: string, target: string): any {
    let headers = {
        "Content-Type": "application/json",
        "User-Agent": "phat-contract"
    };
    const baseApiUrl = `${apiUrl}${apiKey}/`
    const ensDomainSubgraph = `https://api.thegraph.com/subgraphs/name/ensdomains/ens`;
    const eip721Subgraph = `${baseApiUrl}subgraphs/id/AVZ1dGwmRGKsbDAbwvxNmXzeEkD48voB3LfGqj5w7FUS`;
    const snapshotSubgraph = `${baseApiUrl}subgraphs/id/3Q4vnuSqemXnSNHoiLD7wdBbGCXszUYnUbTz191kDMNn`;
    const hasNfts = JSON.stringify({ query:`
  query HasNfts { account(id: "${target}") { id ERC721tokens(first: 50) { id identifier contract { id } } } }
  `});
    const hasNounsDaoNft = JSON.stringify({ query:`
  query HasNounsDaoNft { account(id: "${target}") { id ERC721tokens(where: {contract: "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03"}) { id identifier contract { id } } } }
  `});
    const hasEnsDomains = JSON.stringify({ query:`
  query HasEnsDomain { account(id: "${target}") { domains { name } } }
  `});
    const hasVotesDelegatedTo = JSON.stringify({ query:`
  query DelegationsOnSnapshot { delegations(where: {delegate_in: ["${target}"]}) { id delegator } }
  `});

    //
    // In Phat Contract runtime, we not support async/await, you need use `pink.batchHttpRequest` to
    // send http request. The Phat Contract will return an array of response.
    //
    let responses = pink.batchHttpRequest(
        [
            { url: eip721Subgraph, method: "POST", headers, body: stringToHex(hasNfts), returnTextBody: true },
            { url: eip721Subgraph, method: "POST", headers, body: stringToHex(hasNounsDaoNft), returnTextBody: true },
            { url: ensDomainSubgraph, method: "POST", headers, body: stringToHex(hasEnsDomains), returnTextBody: true },
            { url: snapshotSubgraph, method: "POST", headers, body: stringToHex(hasVotesDelegatedTo), returnTextBody: true },
        ],
        10000 // Param for timeout in milliseconds. Your Phat Contract script has a timeout of 10 seconds
    ); // Notice the [0]. This is important bc the `pink.batchHttpRequest` function expects an array of up to 5 HTTP requests.
    return computeTrustScore(responses);
}

function getResponseBody(response: any) {
    if (response.statusCode !== 200) {
        console.log(`Fail to read api with status code: ${response.statusCode}, error: ${response.error || response.body}}`);
        throw Error.FailedToFetchData;
    }
    if (typeof response.body !== "string") {
        throw Error.FailedToDecode;
    }
    console.log(response.body);
    return JSON.parse(response.body)
}

function computeTrustScore(responses: any): any {
    let result = 0;
    // Weight values are indexed to map to the index of the responses. e.g. responses[n] => weightValues[n]
    const weightValues = [1, 69, 4, 20];
    const hasNftsResponseBody = getResponseBody(responses[0]);
    result += (hasNftsResponseBody.data?.account?.ERC721tokens?.length ?? 0) * weightValues[0];
    console.log(`ERC-721 NFTs owned on ETH Check... Result [${result}]`);
    const hasNounsDaoNftResponseBody = getResponseBody(responses[1]);
    result += (hasNounsDaoNftResponseBody.data?.account?.ERC721tokens?.length > 0 ?? false) ? weightValues[1] : 0;
    console.log(`Has a NounsDAO NFT Check... Result [${result}]`);
    const hasEnsDomainsResponseBody = getResponseBody(responses[2]);
    result += (hasEnsDomainsResponseBody.data?.account?.domains?.length ?? 0) * weightValues[2];
    console.log(`Has ENS Domains Check... Result [${result}]`);
    const hasVotesDelegatedTo = getResponseBody(responses[3]);
    result += (hasVotesDelegatedTo.data?.delegations?.length > 0 ?? false) ? weightValues[3] : 0;
    console.log(`Has Delegated Votes on Snapshot Check... Result [${result}]`);
    return result;
}
//
// Here is what you need to implemented for Phat Contract, you can customize your logic with
// JavaScript here.
//
// The Phat Contract will be called with two parameters:
//
// - request: The raw payload from the contract call `request` (check the `request` function in TestLensApiConsumerConract.sol).
//            In this example, it's a tuple of two elements: [requestId, profileId]
// - secrets: The custom secrets you set with the `config_core` function of the Action Offchain Rollup Phat Contract. In
//            this example, it just a simple text of the lens api url prefix. For more information on secrets, checkout the SECRETS.md file.
//
// Your returns value MUST be a hex string, and it will send to your contract directly. Check the `_onMessageReceived` function in
// OracleConsumerContract.sol for more details. We suggest a tuple of three elements: [successOrNotFlag, requestId, data] as
// the return value.
//
export default function main(request: HexString, secrets: string): HexString {
    console.log(`handle req: ${request}`);
    // Uncomment to debug the `secrets` passed in from the Phat Contract UI configuration.
    // console.log(`secrets: ${secrets}`);
    let requestId, targetAddress, parsedSecrets;
    try {
        [requestId, targetAddress] = decodeRequest(`${decodeRequestAbiParams}`, request);
        console.log(`[${requestId}]: ${targetAddress}`);
        parsedSecrets = JSON.parse(secrets);
    } catch (error) {
        console.info("Malformed request received");
        return encodeReply(encodeReplyAbiParams, [TYPE_ERROR, requestId, errorToCode(error as Error)]);
    }
    console.log(`Request received for profile ${targetAddress}`);
    try {
        const targetAddressScore = fetchApiStats(parsedSecrets.apiUrl, parsedSecrets.apiKey, targetAddress.toLowerCase());
        console.log("response:", [TYPE_RESPONSE, requestId, targetAddressScore]);
        return encodeReply(encodeReplyAbiParams, [TYPE_RESPONSE, requestId, targetAddressScore]);
    } catch (error) {
        if (error === Error.FailedToFetchData) {
            throw error;
        } else {
            // otherwise tell client we cannot process it
            console.log("error:", [TYPE_ERROR, requestId, error]);
            return encodeReply(encodeReplyAbiParams, [TYPE_ERROR, requestId, errorToCode(error as Error)]);
        }
    }
}
