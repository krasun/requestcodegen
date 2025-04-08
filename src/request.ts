export class JsonBody {
    public body: object;

    constructor(body: object) {
        this.body = body;
    }
}

export interface RequestOptions {
    url: string;
    query?: Record<string, string | string[]>;
    method?: string;
    headers?: Record<string, string>;
    body?: string | JsonBody;
}
