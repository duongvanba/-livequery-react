export type Response<T> = {
    data: {
        items: T[];
        order_by: string;
        sort: "asc" | "desc";
        has_more: boolean;
        cursor: string;
        path: string;
        subscription: string | null;
    }
}