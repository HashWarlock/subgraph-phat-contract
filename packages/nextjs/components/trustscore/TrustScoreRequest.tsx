import React from "react";
import { Address } from "../scaffold-eth";
import { Address as AddressType } from "viem";

export type TrustScoreRequest = {
  requester: AddressType;
  target: AddressType;
  threshold: string;
  premium: boolean;
  value: bigint;
};

export type TrustScoreRequestEventsProps = {
  requests: TrustScoreRequest[];
};

export const TrustScoreRequestEvents = ({ requests }: TrustScoreRequestEventsProps) => {
  return (
    <div className="mx-10">
      <div className="flex w-auto justify-center h-10">
        <p className="flex justify-center text-lg font-bold">Trust Score Request Events</p>
      </div>

      <table className="mt-4 p-2 bg-base-100 table table-zebra shadow-lg w-full overflow-hidden">
        <thead className="text-accent-content text-md">
          <tr>
            <th className="bg-primary text-md" colSpan={2}>
              <span>Requester</span>
            </th>
            <th className="bg-primary text-md" colSpan={2}>
              <span>Target</span>
            </th>
            <th className="bg-primary text-md">
              <span>Threshold (1-5)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map(({ requester, target, threshold, premium, value }, i) => (
            <tr key={i}>
              <td colSpan={2} className="py-2.5">
                <Address address={requester} size="sm" />
              </td>
              <td colSpan={2} className="py-2.5">
                <Address address={target} size="sm" />
              </td>
              <td className="col-span-1 text-md">
                <span> {threshold} </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
