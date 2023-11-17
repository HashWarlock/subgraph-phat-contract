import "@phala/pink-env";

export type RequestOptions = {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: Uint8Array | string;
    returnTextBody?: boolean;
};

export type HttpResponse = {
    statusCode: number;
    reasonPhrase: string;
    headers: Record<string, string>;
    body: Uint8Array | string;
    error?: string;
};

export class BatchRequestManager {
    private requestList: RequestOptions[] = [];

    addRequest(request: RequestOptions): void {
        this.requestList.push(request);
    }

    removeRequest(index: number): void {
        if (index >= 0 && index < this.requestList.length) {
            this.requestList.splice(index, 1);
        } else {
            throw new Error('Index out of bounds');
        }
    }

    clearRequests(): void {
        this.requestList = [];
    }

    executeBatch(timeout_ms?: number): HttpResponse[] {
        if (this.requestList.length === 0) {
            throw new Error('No requests to execute');
        }
        const responses = pink.batchHttpRequest(this.requestList, timeout_ms);
        this.clearRequests(); // Optionally clear requests after execution
        return responses;
    }

    // Optionally, you can expose the current list of requests (read-only)
    get requests(): ReadonlyArray<RequestOptions> {
        return this.requestList;
    }
}

export function getRequest(url: string, headers?: Record<string, string>, returnTextBody: boolean = true): HttpResponse {
    return pink.httpRequest({
        url,
        method: 'GET',
        headers,
        returnTextBody,
    });
}

export function postRequest(url: string, body: Uint8Array | string, headers?: Record<string, string>, returnTextBody: boolean = true): HttpResponse {
    return pink.httpRequest({
        url,
        method: 'POST',
        headers,
        body,
        returnTextBody,
    });
}

export function putRequest(url: string, body: Uint8Array | string, headers?: Record<string, string>, returnTextBody: boolean = true): HttpResponse {
    return pink.httpRequest({
        url,
        method: 'PUT',
        headers,
        body,
        returnTextBody,
    });
}

export function batchRequest(requests: RequestOptions[], timeout_ms?: number): HttpResponse[] {
    return pink.batchHttpRequest(requests, timeout_ms);
}
