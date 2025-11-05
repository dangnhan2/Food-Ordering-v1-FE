import axios from './interceptor';

export const Login = (email : string, password : string) => {
   return axios.post<IBackendRes<IAuthResponse>>(`/api/Auth/login`, {email, password});
}

export const Register = (email: string, password : string, confirmPassword : string) => {
    return axios.post<IBackendRes<string>>(`/api/Auth/register`, {email, password, confirmPassword});
}

export const VerifyEmail = (email : string, otp : string) => {
    return axios.post<IBackendRes<string>>(`/api/Auth/verify-email`, {email, otp});
}

export const RefreshToken = () => {
    return axios.post<IBackendRes<IAuthResponse>>(`/api/Auth/refresh`);
}

export const Logout = () => {
    return axios.post<IBackendRes<null>>(`/api/Auth/logout`);
}

export const ChangePassword = (id : string | undefined, currentPassword : string, newPassword: string, confirmPassword : string) => {
    return axios.post(`/api/Auth/change-password`, {id, currentPassword, newPassword, confirmPassword});
}

export const ForgetPassword = (email : string) => {
    return axios.post<IBackendRes<null>>(`/api/Auth/forgot-password`, {email});
}

export const ResetPassword = (email : string, newPassword: string, confirmPassword : string) => {
    return axios.post<IBackendRes<null>>(`/api/Auth/reset-password`, {email, newPassword, confirmPassword});
}

export const GetAddresses = (id : string) => {
    return axios.get<IBackendRes<IAddress[]>>(`/api/Common/user/${id}/addresses`);
}

export const AddAddress = (userId : string, address : string) => {
    return axios.post<IBackendRes<null>>(`/api/Common/address`, {userId, address});
}

export const UpdateAddress = (id : string, userId : string, address : string) => {
    return axios.put<IBackendRes<null>>(`/api/Common/address/${id}`, {userId, address});
}

export const DeleteAddress = (id : string) => {
    return axios.delete<IBackendRes<null>>(`/api/Common/address/${id}`);
}

export const UpdateProfile = (id : string | undefined, fullName : string, phoneNumber : string, avatar : File | undefined) => {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phoneNumber", phoneNumber);
    if (avatar) {
        formData.append("avatar", avatar);
    }
    return axios.put<IBackendRes<null>>(`/api/Common/user/account/${id}`, formData);
}

export const GetCategories = () => {
    return axios.get<IBackendRes<ICategory[]>>(`/api/Common/categories`);
}

export const AddCategory = (name : string) => {
    return axios.post<IBackendRes<null>>(`/api/Common/category`, {name});
}

export const UpdateCategory = (id : string, name : string) => {
    return axios.put<IBackendRes<null>>(`/api/Common/category/${id}`, {name});
}

export const DeleteCategory = (id : string) => {
    return axios.delete<IBackendRes<null>>(`/api/Common/category/${id}`);
}

export const GetFoodItems = (query : string | undefined) => {
    return axios.get<IBackendRes<IModelPaginate<IFoodItem>>>(`/api/Common/menus?${query}`);
}

export const GetUserById = (id : string | undefined) => {
    return axios.get<IBackendRes<IUser>>(`/api/Common/user/${id}`);
}

export const GetCartByUser = (id :string) => {
    return axios.get<IBackendRes<ICart>>(`/api/Common/cart?id=${id}`);
}

export const AddToCart = (userId : string, cartItems : ICartItemRequest[]) => {
    return axios.post<IBackendRes<null>>(`/api/Common/cart`, {userId, cartItems});
}

export const GetVouchers = () => {
    return axios.get<IBackendRes<IVoucher[]>>(`/api/Common/user/vouchers`);
}