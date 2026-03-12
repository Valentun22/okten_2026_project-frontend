export interface IUser {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
    image?: string;
    role?: string | string[];
    isCritic?: boolean;
    bio?: string;
    birthdate?: string;
    city?: string;
    gender?: string;
    instagram?: string;
    interests?: string;
    createdAt?: string;
}

export interface ILoginDto {
    email: string;
    password: string;
    deviceId?: string;
}

export interface IRegisterDto {
    name: string;
    email: string;
    password: string;
    deviceId?: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user?: IUser;
}