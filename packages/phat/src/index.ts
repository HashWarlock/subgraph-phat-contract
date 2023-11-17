// *** YOU ARE LIMITED TO THE FOLLOWING IMPORTS TO BUILD YOUR PHAT CONTRACT     ***
// *** ADDING ANY IMPORTS WILL RESULT IN ERRORS & UPLOADING YOUR CODE TO PHALA  ***
// *** NETWORK WILL FAIL. IF YOU WANT TO KNOW MORE, JOIN OUR DISCORD TO SPEAK   ***
// *** WITH THE PHALA TEAM AT https://discord.gg/5HfmWQNX THANK YOU             ***
import "@phala/pink-env";
import { Coders } from "@phala/ethers";
import { Variables, generateQuery,
    hasLensAndFarcasterAccountsQuery, hasVotesDelegatedToQuery,
    isEnsPrimaryAccountQuery, isFollowingSocialsQuery, isFollowingTargetQuery,
    requesterTxWithTargetQuery} from "./http/subgraphQueries";
import {parseJson} from "./http/parseJsonResponse";
import {Error} from "./utils/errors";
import {stringToHex} from "./utils/utils";
import {addressCoder, encodeReply, uint8Coder, uintCoder, HexString} from "./ethers/abiCoder";
import {BatchRequestManager} from "./http/httpRequestBuilder";

// Defined in TestLensOracle.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

function fetchAirstackApiStats(airstackApi: string, target: string, requester: string): any {
    const apiKey = "3a41775a358a4cb99ca9a29c1f6fc486";
    const airstackApiUrl = "https://api.airstack.xyz/gql";
    const batchRequestManager = new BatchRequestManager();
    // const target = "ipeciura.eth";
    // const requester = "betashop.eth"
    const variables: Variables = {
        target: target,
        requester: requester
    };
    // profile_id should be like 0x0001
    let headers = {
        "Content-Type": "application/json",
        "User-Agent": "phat-contract",
        "Authorization": "3a41775a358a4cb99ca9a29c1f6fc486",
    };
    let headers2 = {
        "Content-Type": "application/json",
        "User-Agent": "phat-contract",
    }
    let queryIsFollowingTarget = generateQuery(isFollowingTargetQuery, variables);
    let body0 = stringToHex(queryIsFollowingTarget);
    batchRequestManager.addRequest({
        url: airstackApiUrl,
        method: "POST",
        headers,
        body: body0,
        returnTextBody: true
    });
    let queryTxCountWithTarget = generateQuery(requesterTxWithTargetQuery, variables);
    let body1 = stringToHex(queryTxCountWithTarget);
    batchRequestManager.addRequest({
        url: airstackApiUrl,
        method: "POST",
        headers,
        body: body1,
        returnTextBody: true,
    });
    let queryHasPrimaryEns = generateQuery(isEnsPrimaryAccountQuery, variables);
    let body2 = stringToHex(queryHasPrimaryEns);
    batchRequestManager.addRequest({
        url: airstackApiUrl,
        method: "POST",
        headers,
        body: body2,
        returnTextBody: true,
    });
    let queryHasLensAndFarcasterAccounts = generateQuery(hasLensAndFarcasterAccountsQuery, variables);
    let body3 = stringToHex(queryHasLensAndFarcasterAccounts);
    batchRequestManager.addRequest({
        url: airstackApiUrl,
        method: "POST",
        headers,
        body: body3,
        returnTextBody: true,
    });
    let queryDelegationsOnSnapshot = generateQuery(hasVotesDelegatedToQuery, variables);
    let snapshotSubgraphUrl = "https://gateway.thegraph.com/api/cd22a01e5b7f9828cddcb52caf03ee79/subgraphs/id/3Q4vnuSqemXnSNHoiLD7wdBbGCXszUYnUbTz191kDMNn";
    let body4 = stringToHex(queryDelegationsOnSnapshot);
    batchRequestManager.addRequest({
        url: snapshotSubgraphUrl,
        method: "POST",
        headers: headers2,
        body: body4,
        returnTextBody: true,
    });
    // Uncomment to debug the batchRequestManager queries
    // console.log(batchRequestManager.requests);
    // In Phat Function runtime, we not support async/await, you need use `pink.batchHttpRequest` to
    // send http request. The function will return an array of response.
    let [response0, response1, response2, response3, response4] = batchRequestManager.executeBatch(10000);

    const multiplier0Data = parseJson(response0, [0]);
    const multiplier1Data = parseJson(response1, [1, 2]);
    console.log(multiplier1Data);
    const multiplier2Data = parseJson(response2, [3]);
    console.log(multiplier2Data);
    const multiplier3Data = parseJson(response3, [4]);
    console.log(multiplier3Data);
    const multiplier4Data = parseJson(response4, [5]);
    console.log(multiplier4Data);

    return [multiplier0Data[0], multiplier1Data[0]+multiplier1Data[1], multiplier2Data[0], multiplier3Data[0], multiplier4Data[0]];
}

//
// Here is what you need to implemented for Phat Function, you can customize your logic with
// JavaScript here.
//
// The function will be called with two parameters:
//
// - request: The raw payload from the contract call `request` (check the `request` function in TestLensApiConsumerConract.sol).
//            In this example, it's a tuple of two elements: [requestId, profileId]
// - settings: The custom settings you set with the `config_core` function of the Action Offchain Rollup Phat Contract. In
//            this example, it just a simple text of the lens api url prefix.
//
// Your returns value MUST be a hex string, and it will send to your contract directly. Check the `_onMessageReceived` function in
// TestLensApiConsumerContract.sol for more details. We suggest a tuple of three elements: [successOrNotFlag, requestId, data] as
// the return value.
//
export default function main(request: HexString, secrets: string): HexString {
    console.log(`handle req: ${request}`);
    let requestId, encodedRequester, encodedTarget, threshold;
    try {
        [requestId, encodedRequester, encodedTarget, threshold] = Coders.decode([uintCoder, addressCoder, addressCoder, uint8Coder], request);
        console.log(`requestId: ${requestId}`);
        console.log(`encodedRequester: ${encodedRequester}`);
        console.log(`encodedTarget: ${encodedTarget}`);
        console.log(`threshold: ${threshold}`);
        //[requestId, encodedAccountId] = Coders.decode([uintCoder, bytesCoder, addressCoder, bytesArrayCoder], request);
    } catch (error) {
        console.info("Malformed request received");
        return encodeReply([TYPE_ERROR, requestId, encodedRequester, false]);
    }

    try {
        const multiplierData = fetchAirstackApiStats(secrets, encodedTarget, encodedRequester);
        //let stats = calculateScore(multiplierData, threshold);
        let stats = true;
        console.log("response:", [TYPE_RESPONSE, requestId, encodedRequester, stats]);
        return encodeReply([TYPE_RESPONSE, requestId, encodedRequester, stats]);
    } catch (error) {
        if (error === Error.FailedToFetchData) {
            throw error;
        } else {
            // otherwise tell client we cannot process it
            console.log("error:", [TYPE_ERROR, requestId, encodedRequester, false]);
            return encodeReply([TYPE_ERROR, requestId, encodedRequester, false]);
        }
    }
}
