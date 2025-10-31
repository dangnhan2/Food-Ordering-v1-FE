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

export const DeleteAddress = (id : string) => {
    return axios.delete<IBackendRes<null>>(`/api/Common/address/${id}`);
}