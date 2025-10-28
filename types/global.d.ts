export {};

declare global {
interface IBackendRes<T> {
    message: string | string[];
    isSuccess : boolean;
    statusCode: number | string;
    data?: T;
}

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            // pages: number;
            total: number;
            results: T[]
        },       
    }

}
