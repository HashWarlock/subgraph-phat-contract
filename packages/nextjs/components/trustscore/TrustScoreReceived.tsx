import React from "react";
import { Address } from "../scaffold-eth";
import { Address as AddressType } from "viem";

export type TrustScoreReceived = {
  reqid: string;
  requester: AddressType;
  target: AddressType;
  threshold: string;
  theGraphTrustScore: string;
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

      <table className="mt-4 p-2 bg-base-100 table table-zebra shadow-sm w-full overflow-hidden">
        <thead className="text-secondary text-sm">
          <tr>
            <th className="bg-primary text-sm" colSpan={2}>
              <span>Requester</span>
            </th>
            <th className="bg-primary text-sm" colSpan={2}>
              <span>Target</span>
            </th>
            <th className="bg-primary text-sm">
              <span>Threshold (1-5)</span>
            </th>
            <th className="bg-primary text-sm">
              <span>Trusted (True/False)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {received.map(({ reqid, requester, target, threshold, theGraphTrustScore }, i) => (
            <tr key={i}>
              <td colSpan={2} className="py-2.5">
                <Address address={requester} size="sm" />
              </td>
              <td colSpan={2} className="py-2.5">
                <Address address={target} size="sm" />
              </td>
              <td className="col-span-1 text-sm">
                <span> {threshold} </span>
              </td>
              <td className={theGraphTrustScore === "TRUE" ? 'py-0.5 badge badge-success' : 'col-span-1 text-sm text-red'}>
                <span> {theGraphTrustScore} </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
