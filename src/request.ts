export interface RequestOptions {
    url: string;
    query?: Record<string, string | string[]>;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}
