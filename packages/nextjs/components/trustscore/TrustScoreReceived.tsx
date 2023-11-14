import React from "react";
import { Address } from "../scaffold-eth";
import { Address as AddressType } from "viem";

export type TrustScoreReceived = {
  requestId: number;
  requester: AddressType;
  target: AddressType;
  threshold: number;
  theGraphTrustScore: boolean;
};

export type TrustScoreReceivedEventsProps = {
  requests: TrustScoreReceived[];
};

export const TrustScoreReceivedEvents = ({ requests }: TrustScoreReceivedEventsProps) => {
  return (
    <div className="mx-10">
      <div className="flex w-auto justify-center h-10">
        <p className="flex justify-center text-lg font-bold">Trust Score Received Events</p>
      </div>

      <table className="mt-4 p-2 bg-base-100 table table-zebra shadow-lg w-full overflow-hidden">
        <thead className="text-accent text-lg">
          <tr>
            <th className="bg-primary text-lg" colSpan={3}>
              <span>Requester</span>
            </th>
            <th className="bg-primary text-lg" colSpan={3}>
              <span>Target</span>
            </th>
            <th className="bg-primary text-lg">
              <span>Threshold (1-5)</span>
            </th>
            <th className="bg-primary text-lg">
              <span>Trusted (True/False)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map(({ requestId, requester, target, threshold, theGraphTrustScore }, i) => (
            <tr key={i}>
              <td colSpan={3} className="py-3.5">
                <Address address={requester} size="lg" />
              </td>
              <td colSpan={3} className="py-3.5">
                <Address address={target} size="lg" />
              </td>
              <td className="col-span-1 text-lg">
                <span> {threshold} </span>
              </td>
              <td className="col-span-1 text-lg">
                <span> {theGraphTrustScore} </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
