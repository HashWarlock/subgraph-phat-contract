export enum Error {
    BadTargetAddress = "BadTargetAddress",
    FailedToFetchData = "FailedToFetchData",
    FailedToDecode = "FailedToDecode",
    MalformedRequest = "MalformedRequest",
}

export function errorToCode(error: Error): number {
    switch (error) {
        case Error.BadTargetAddress:
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
