import React from "react";
import { Address } from "../scaffold-eth";
import { Address as AddressType } from "viem";

export type TrustScoreReceived = {
  reqId: string;
  target: AddressType;
  score: string;
};

export type TrustScoreReceivedEventsProps = {
  received: TrustScoreReceived[];
};

export const TrustScoreReceivedEvents = ({ received }: TrustScoreReceivedEventsProps) => {
  return (
    <div className="mx-10">
      <div className="flex w-auto justify-center h-10">
        <p className="flex justify-center text-lg font-bold">Trust Score Received Events</p>
      </div>

      <table className="mt-4 p-2 bg-base-100 table table-zebra shadow-lg w-full overflow-hidden border-2 border-base-300">
        <thead className="text-accent-content text-sm">
          <tr>
            <th className="bg-primary text-sm" colSpan={2}>
              <span>Target</span>
            </th>
            <th className="bg-primary text-sm">
              <span>Score</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {received.map(({ reqId, target, score }, i) => (
            <tr key={i}>
              <td colSpan={2} className="py-2.5">
                <Address address={target} size="sm" />
              </td>
              <td className={score >= "50" ? 'py-0.5 text-success' : 'col-span-1 text-sm text-red'}>
                <span> {score} </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
