export {};

declare global {
interface IBackendRes<T> {
    message: string;
    isSuccess : boolean;
    statusCode: number | string;
    data?: T | null | undefined;
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

    interface IAuthResponse {
        accessToken : string
        data : IUser
    }
    
    interface IUser{
        email : string
        fullName : string
        id : string
        imageUrl : string
        phoneNumber : string | null
        role : string | null
    }

    interface IAddress{
        id : string
        address : string
    }

}


