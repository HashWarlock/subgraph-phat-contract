export type Variables = { [key: string]: any };

export type QueryAndVariables = {
    query: string;
    variables: Variables
}

export function generateQuery(queryTemplate: string, variables: Variables): string {
    const queryWithVariables = queryTemplate.replace(/"\$\{(\w+)\}"/g, (_, varName) => {
        const value = variables[varName];
        if (typeof value === 'string') {
            return JSON.stringify(value);
        }
        return JSON.stringify(value);
    })
    return JSON.stringify({query: queryWithVariables});
}

export const hasVotesDelegatedToQuery = `query DelegationsOnSnapshot {
    delegations(where: {delegate_in: ["\${target}"]}) {
        id
        delegator
    }
}`

export const isFollowingTargetQuery =
`
    query isFollowingTarget {
    Wallet(input: {identity: "\${requester}", blockchain: ethereum}) {
        socialFollowings(
            input: {filter: {identity: {_in: ["\${target}"]}}}
    ) {
            Following {
                dappName
                dappSlug
                followingProfileId
                followerProfileId
                followerAddress {
                    addresses
                    socials {
                        dappName
                        profileName
                    }
                    domains {
                        name
                    }
                }
            }
        }
    }
}`;

export const hasLensAndFarcasterAccountsQuery =
`
    query hasLensAndFarcasterAccountsQuery {
        Socials(
            input: {filter: {dappName: {_in: [lens, farcaster]}, identity: {_in: ["\${target}"]}}, blockchain: ethereum}
            ) {
                Social {
                  profileName
                  profileTokenId
                  profileTokenIdHex
                  followerCount
                  followingCount
                }
        }
    }
`;

export const isEnsPrimaryAccountQuery =
`
    query MyQuery {
        Domains(input: {filter: {owner: {_in: ["\${target}"]}, isPrimary: {_eq: true}}, blockchain: ethereum}) {
            Domain {
              name
              owner
              isPrimary
            }
        }
    }
`;

export const requesterTxWithTargetQuery =
`
    query GetTokenTransfers {
      ethereum: TokenTransfers(
        input: {filter: {from: {_in: ["\${requester}"]}, to: {_eq: "\${target}"}}, blockchain: ethereum}
      ) {
        TokenTransfer {
          from {
            addresses
          }
          to {
            addresses
          }
          transactionHash
        }
      }
      polygon: TokenTransfers(
        input: {filter: {from: {_in: ["\${requester}"]}, to: {_eq: "\${target}"}}, blockchain: polygon}
      ) {
        TokenTransfer {
          from {
            addresses
          }
          to {
            addresses
          }
          transactionHash
        }
      }
}`;

export const isFollowingSocialsQuery =
`
    query isFollowingTarget {
    Wallet(input: {identity: "\${requester}", blockchain: ethereum}) {
        socialFollowings(
            input: {filter: {identity: {_in: ["\${target}"]}}}
    ) {
            Following {
                dappName
                dappSlug
                followingProfileId
                followerProfileId
                followerAddress {
                    addresses
                    socials {
                        dappName
                        profileName
                    }
                    domains {
                        name
                    }
                }
            }
        }
    }
}`;
