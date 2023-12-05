import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address as AddressType } from "viem";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput, IntegerVariant } from "~~/components/scaffold-eth";
import { TrustScoreReceived, TrustScoreReceivedEvents } from "~~/components/trustscore/TrustScoreReceived";
import {
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

const ROLL_ETH_VALUE = "0.002";
// const ROLLING_TIME_MS = 500;
const MAX_TABLE_ROWS = 10;

const TrustScore: NextPage = () => {
  const [received, setReceived] = useState<TrustScoreReceived[]>([]);
  const [target, setTarget] = useState<AddressType>();
  const [requested, setRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const { data: receivedHistoryData, isLoading: receivedHistoryLoading } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "ResponseReceived",
    fromBlock: 0n,
  });

  useEffect(() => {
    if (!received.length && !!receivedHistoryData?.length && !receivedHistoryLoading) {
      setReceived(
        (
          receivedHistoryData?.map(({ args }) => ({
            reqId: args.reqId?.toString().toUpperCase(),
            target: args.target,
            score: args.score?.toString().toUpperCase(),
          })) || []
        ).slice(0, MAX_TABLE_ROWS),
      );
      console.log(received);
    }
  }, [received, receivedHistoryData, receivedHistoryLoading]);

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "ResponseReceived",
    listener: logs => {
      logs.map(log => {
        const { reqId, target, score } = log.args;
        if (reqId && target) {
          console.log(`[${reqId}, ${target}, ${score}]`);
          // setTimeout(() => {
          setIsRequesting(false);
          setRequested(false);
          // @ts-ignore
          setReceived(received =>
            [{ reqid: reqId.toString().toUpperCase(), target, score: score.toString().toUpperCase() }, ...received].slice(0, MAX_TABLE_ROWS),
          );
          // }, ROLLING_TIME_MS);
        }
      });
    },
  });

  const { writeAsync: request, isError: targetTrustScoreError } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "request",
    args: [target],
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
      <div className="py-2.5 px-2.5">
        <div className="grid grid-cols-1 max-md:grid-cols-1">
          <div className="flex flex-col items-center pt-4 max-md:row-start-1">

              <span className="text-xl">Request Target's Trust Score</span>
              <div className="flex flex-col mt-2 px-7 py-4 bg-primary opacity-80 rounded-2xl shadow-lg border-2 border-base-300 ">
                <span className="text-accent-content">Target Address</span>
                <AddressInput
                  placeholder="Target Address"
                  value={target ?? ""}
                  onChange={value => setTarget(value)}
                />
                <button
                  onClick={() => {
                    if (!requested) {
                      setRequested(true);
                    }
                    setIsRequesting(true);
                    request({ args: [target] });
                  }}
                  disabled={isRequesting}
                  className="mt-2 btn btn-sm normal-case font-bold text-md"
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

          <div className="max-lg:row-start-1">
            <TrustScoreReceivedEvents received={received} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrustScore;
