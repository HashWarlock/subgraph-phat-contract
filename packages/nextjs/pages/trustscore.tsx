import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { Address as AddressType } from "viem";
import { useBalance } from "wagmi";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, AddressInput, IntegerVariant } from "~~/components/scaffold-eth";
import { UInt8Input } from "~~/components/trustscore/Input/UInt8Input";
import { TrustScoreReceived, TrustScoreReceivedEvents } from "~~/components/trustscore/TrustScoreReceived";
import { TrustScoreRequest, TrustScoreRequestEvents } from "~~/components/trustscore/TrustScoreRequest";
import {
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

const ROLL_ETH_VALUE = "0.002";
// const ROLLING_TIME_MS = 500;
const MAX_TABLE_ROWS = 10;

const TrustScore: NextPage = () => {
  const [requests, setRequests] = useState<TrustScoreRequest[]>([]);
  const [received, setReceived] = useState<TrustScoreReceived[]>([]);
  const [requester, setRequester] = useState<AddressType>();
  const [target, setTarget] = useState<AddressType>();
  const [threshold, setThreshold] = useState<bigint>(BigInt(0));

  const videoRef = useRef<HTMLVideoElement>(null);

  const [requested, setRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const { data: lastTargetAddress } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "lastTargetAddress",
  });

  const { data: requestsHistoryData, isLoading: requestsHistoryLoading } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "TrustScoreRequested",
    fromBlock: 0n,
  });

  useEffect(() => {
    if (!requests.length && !!requestsHistoryData?.length && !requestsHistoryLoading) {
      setRequests(
        (
          requestsHistoryData?.map(({ args }) => ({
            requester: args.requester,
            target: args.target,
            threshold: args.threshold.toString(8).toUpperCase(),
            premium: args.premium,
            value: args.value,
          })) || []
        ).slice(0, MAX_TABLE_ROWS),
      );
    }
  }, [requests, requestsHistoryData, requestsHistoryLoading]);

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "TrustScoreRequested",
    listener: logs => {
      logs.map(log => {
        const { requester, target, threshold, premium, value } = log.args;

        if (requester && target && threshold) {
          // setTimeout(() => {
          setIsRequesting(false);
          // @ts-ignore
          setRequests(requests =>
            [{ requester, target, threshold: threshold.toString().toUpperCase(), premium, value }, ...requests].slice(
              0,
              MAX_TABLE_ROWS,
            ),
          );
          // }, ROLLING_TIME_MS);
        }
      });
    },
  });

  const { data: receivedHistoryData, isLoading: receivedHistoryLoading } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "TheGraphTrustScoreReceived",
    fromBlock: 0n,
  });

  useEffect(() => {
    if (!received.length && !!receivedHistoryData?.length && !receivedHistoryLoading) {
      setReceived(
        (
          receivedHistoryData?.map(({ args }) => ({
            requestId: args.requestId,
            requester: args.requester,
            target: args.target,
            threshold: args.threshold,
            theGraphTrustScore: args.theGraphTrustScore,
          })) || []
        ).slice(0, MAX_TABLE_ROWS),
      );
    }
  }, [receivedHistoryData, receivedHistoryLoading, received.length]);

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "TheGraphTrustScoreReceived",
    listener: logs => {
      logs.map(log => {
        const { requestId, requester, target, threshold, theGraphTrustScore } = log.args;

        if (requestId && requester && target && threshold && theGraphTrustScore) {
          // setTimeout(() => {
          setIsRequesting(false);
          // @ts-ignore
          setReceived(received =>
            [{ requestId, requester, target, threshold, theGraphTrustScore }, ...received].slice(0, MAX_TABLE_ROWS),
          );
          // }, ROLLING_TIME_MS);
        }
      });
    },
  });

  const {
    writeAsync: setTestSender,
    isError: setTestSenderError,
    isLoading: setTestSenderLoading,
  } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "setTestSender",
    value: "0.002",
    args: [requester, Number(threshold)],
  });

  const { writeAsync: getTargetTrustScore, isError: targetTrustScoreError } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "getTargetTrustScore",
    value: "0.002",
    args: [lastTargetAddress, 5],
  });

  useEffect(() => {
    if (targetTrustScoreError) {
      setIsRequesting(false);
      setRequested(false);
    }
  }, [targetTrustScoreError]);

  return (
    <>
      <MetaHeader />
      <div className="py-10 px-10">
        <div className="grid grid-cols-3 max-lg:grid-cols-1">
          <div className="max-lg:row-start-2">
            <TrustScoreRequestEvents requests={requests} />
          </div>

          <div className="flex flex-col items-center pt-4 max-lg:row-start-1">
            <div className="flex w-full justify-center">
              <span className="text-2xl"> Set Test Requester and Query Threshold </span>
            </div>

            <div className="flex flex-col mt-2 px-7 py-4 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
              <span className="text-accent">Test Requester</span>
              <AddressInput
                placeholder="Test Requester"
                value={requester ?? "0x0000000000000000000000000000000000000000"}
                onChange={value => setRequester(value)}
              />
              <br></br>
              <span className="text-accent">Query Threshold</span>
              <UInt8Input
                value={threshold ?? 0n}
                onChange={value => setThreshold(BigInt(value))}
                variant={IntegerVariant.UINT8}
              />
              <button
                onClick={() => {
                  setTestSender({ args: [requester, Number(threshold)] });
                }}
                disabled={setTestSenderLoading}
                className="mt-2 btn btn-secondary btn-xl normal-case font-xl text-lg"
              >
                <CalculatorIcon className="h-6 w-6" />
                Set Config
              </button>
            </div>

            <div className="mt-4 pt-2 flex flex-col items-center w-full justify-center border-t-4 border-primary">
              <span className="text-2xl">Request Target's Trust Score</span>
              <div className="flex flex-col mt-2 px-7 py-4 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
                <span className="text-accent">Target Address</span>
                <AddressInput
                  placeholder="Target Address"
                  value={target ?? "0x0000000000000000000000000000000000000000"}
                  onChange={value => setTarget(value)}
                />
                <br></br>
                <span className="text-accent">Query Threshold</span>
                <UInt8Input
                  value={threshold ?? 0n}
                  onChange={value => setThreshold(BigInt(value))}
                  variant={IntegerVariant.UINT8}
                />
                <button
                  onClick={() => {
                    if (!requested) {
                      setRequested(true);
                    }
                    setIsRequesting(true);
                    getTargetTrustScore({ args: [requester, Number(threshold)] });
                  }}
                  disabled={isRequesting}
                  className="mt-2 btn btn-secondary btn-xl normal-case font-xl text-lg"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" className="h-6 w-6">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.1462 10.5611C12.4236 10.8372 12.4488 11.2693 12.2219 11.5738L12.1462 11.661L9.02112 14.7722C8.716 15.0759 8.2214 15.0759 7.91629 14.7722C7.63891 14.496 7.6137 14.064 7.84064 13.7595L7.91629 13.6723L11.0414 10.5611C11.3465 10.2573 11.8411 10.2573 12.1462 10.5611ZM7.6875 1C10.2763 1 12.375 3.08934 12.375 5.66665C12.375 8.24396 10.2763 10.3333 7.6875 10.3333C5.09867 10.3333 3 8.24396 3 5.66665C3 3.08934 5.09867 1 7.6875 1ZM7.6875 2.55555C5.96165 2.55555 4.5625 3.94838 4.5625 5.66665C4.5625 7.38492 5.96165 8.77775 7.6875 8.77775C9.41345 8.77775 10.8125 7.38492 10.8125 5.66665C10.8125 3.94838 9.41345 2.55555 7.6875 2.55555ZM13.1563 1C13.5878 1 13.9375 1.34816 13.9375 1.77778C13.9375 2.20739 13.5878 2.55555 13.1563 2.55555C12.7248 2.55555 12.3751 2.20739 12.3751 1.77778C12.3751 1.34816 12.7248 1 13.1563 1Z"
                    ></path>
                  </svg>
                  Request Trust Score
                </button>
              </div>
            </div>
          </div>

          <div className="max-lg:row-start-3">
            <TrustScoreReceivedEvents requests={received} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrustScore;