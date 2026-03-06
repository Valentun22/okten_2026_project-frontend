export interface IUser {
    id:        string;
    name?:     string;
    email:     string;
    avatar?:   string;
    role?:     string;
    createdAt?: string;
}

export interface ILoginDto     {
    email: string;
    password: string;
    deviceId?: string;
}
export interface IRegisterDto  {
    name: string;
    email: string;
    password: string;
}
export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user?: IUser;
}