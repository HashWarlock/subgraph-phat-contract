import { Error } from "../utils/errors";

export type ParseInstruction = {
    path: string; // Dot-separated path to the data in the JSON object
    defaultValue?: any; // Default value if the path does not exist
    transform?: (value: any) => any; // Optional transformation function to apply to the value
};

export function getValueByPath(obj: any, path: string, defaultValue: any = undefined): any {
    // Handle null or undefined obj input
    if (obj == null) {
        return defaultValue;
    }

    // Split the path and reduce the object to the desired value
    return path.split('.').reduce((currentObject, key) => {
        // If the current value is null or undefined, return the default value
        if (currentObject === null || currentObject === undefined) {
            console.log(`${defaultValue}`)
            return defaultValue;
        }
        // If the key exists, proceed to the next key in the path
        if (Object.hasOwnProperty.call(currentObject, key)) {
            console.log(`ownproperty ${JSON.stringify(currentObject[key])}`)
            return currentObject[key] ? currentObject[key] : defaultValue;
        }
        // If the key does not exist, return the default value
        console.log(`${defaultValue}`)
        return defaultValue;
    }, obj);
}

export function parseJson(response: any, instructionIndexes: number[]): number[] {
    if (response.statusCode !== 200) {
        console.log(`Fail to read api with status code: ${response.statusCode}, error: ${response.error || response.body}}`);
        throw Error.FailedToFetchData;
    }
    if (typeof response.body !== "string") {
        throw Error.FailedToDecode;
    }
    console.log(response.body);
    let instructionsToParse: ParseInstruction[] = [];
    for (const index of instructionIndexes) {
        instructionsToParse.push(instructions[index]);
    }
    const result = parseJsonResponse(JSON.parse(response.body), instructionsToParse);
    console.log(`result: ${result}`);
    return result;
}

export function parseJsonResponse(json: any, instructions: ParseInstruction[]): any[] {
    return instructions.map(instruction => {
        const value = getValueByPath(json, instruction.path, instruction.defaultValue);
        return instruction.transform ? instruction.transform(value) : value;
    });
}

export const instructions: ParseInstruction[] = [
    {
        path: 'data.Wallet.socialFollowings.Following',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (followings: any[]) => followings.length // Count the followings
    },
    {
        path: 'data.ethereum.TokenTransfer',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (transfers: any[]) => transfers.length // Count the transfers
    },
    {
        path: 'data.polygon.TokenTransfer',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (transfers: any[]) => transfers.length // Count the transfers
    },
    {
        path: 'data.Domains.Domain',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (transfers: any[]) => transfers.length // Count the transfers
    },
    {
        path: 'data.Socials.Social',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (transfers: any[]) => transfers.length // Count the transfers
    },
    {
        path: 'data.delegations',
        defaultValue: [], // Default to an empty array if null or undefined
        transform: (transfers: any[]) => transfers.length // Count the transfers
    },
];
