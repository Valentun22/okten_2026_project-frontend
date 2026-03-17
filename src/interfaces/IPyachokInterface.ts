export enum PyachokGenderEnum {
    ANY = 'any',
    MALE = 'male',
    FEMALE = 'female',
}

export enum PyachokPayerEnum {
    ANY = 'any',
    ME = 'me',
    SPLIT = 'split',
    OTHER = 'other',
}

export enum PyachokStatusEnum {
    OPEN = 'open',
    CLOSED = 'closed',
}

export interface ICreatePyachokDto {
    date: string;
    time: string;
    purpose?: string;
    peopleCount?: number;
    genderPreference?: PyachokGenderEnum;
    payer?: PyachokPayerEnum;
    message?: string;
    expectedBudget?: number;
}

export interface IPyachokItem {
    id: string;
    date: string;
    time: string;
    purpose?: string;
    peopleCount?: number;
    genderPreference?: string;
    payer?: string;
    message?: string;
    expectedBudget?: number;
    status: PyachokStatusEnum;
    createdAt: string;
    user?: {
        id: string;
        name?: string;
        image?: string;
        avatar?: string;
    };
    venue?: {
        id: string;
        name: string;
        city?: string;
    };
}

export interface IPyachokListResponse {
    items?: IPyachokItem[];
    data?: IPyachokItem[];
    total: number;
    page: number;
    limit: number;
}

export interface IPyachokListQuery {
    status?: PyachokStatusEnum;
    date?: string;
    page?: number;
    limit?: number;
}