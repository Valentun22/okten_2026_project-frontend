import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {ILoginDto, IRegisterDto} from '../../interfaces/IUserInterface';
import {authService} from '../../services/auth.service';
import {tokenStorage} from '../../services/tokenStorage';

interface IUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    bio?: string;
    isCritic?: boolean;
    role?: string | string[];
}

interface IAuthState {
    user: IUser | null;
    isAuth: boolean;
    loading: boolean;
    error: string | null;
}

const restoreUser = (): IUser | null => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const initialState: IAuthState = {
    user: restoreUser(),
    isAuth: !!tokenStorage.getAccess(),
    loading: false,
    error: null,
};

const saveTokens = (data: any) => {
    const t = data?.tokens ?? data;
    if (t?.accessToken) tokenStorage.setAccess(t.accessToken);
    if (t?.refreshToken) tokenStorage.setRefresh(t.refreshToken);
};

const saveUser = (user: IUser | null) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
};

const login = createAsyncThunk<any, ILoginDto, { rejectValue: string }>(
    'auth/login',
    async (dto, {rejectWithValue}) => {
        try {
            return await authService.login(dto);
        } catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Невірний email або пароль');
        }
    }
);

const register = createAsyncThunk<any, IRegisterDto, { rejectValue: string }>(
    'auth/register',
    async (dto, {rejectWithValue}) => {
        try {
            return await authService.register(dto);
        } catch (e) {
            const err = e as AxiosError<any>;
            const msg = err.response?.data?.message;
            return rejectWithValue(Array.isArray(msg) ? msg[0] : msg ?? 'Помилка реєстрації');
        }
    }
);

const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
    saveUser(null);
});

const oauthLogin = createAsyncThunk<any, { provider: string; token: string }, { rejectValue: string }>(
    'auth/oauthLogin',
    async (dto, {rejectWithValue}) => {
        try {
            return await authService.oauthLogin(dto);
        } catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Помилка OAuth входу');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            saveUser(action.payload);
        },
        clearError(state) {
            state.error = null;
        },
        forceLogout(state) {
            state.isAuth = false;
            state.user = null;
            tokenStorage.clear();
            localStorage.removeItem('user');
        },
    },
    extraReducers: builder => builder
        .addCase(login.pending, state => {
            state.loading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, {payload}) => {
            saveTokens(payload);
            state.loading = false;
            state.isAuth = true;
            state.user = payload?.user ?? null;
            saveUser(payload?.user ?? null);
        })
        .addCase(login.rejected, (state, {payload}) => {
            state.loading = false;
            state.error = payload ?? 'Помилка';
        })

        .addCase(register.pending, state => {
            state.loading = true;
            state.error = null;
        })
        .addCase(register.fulfilled, (state) => {
            state.loading = false;
        })
        .addCase(register.rejected, (state, {payload}) => {
            state.loading = false;
            state.error = payload ?? 'Помилка';
        })

        .addCase(logout.fulfilled, state => {
            state.isAuth = false;
            state.user = null;
        })

        .addCase(oauthLogin.pending, state => {
            state.loading = true;
            state.error = null;
        })
        .addCase(oauthLogin.fulfilled, (state, {payload}) => {
            saveTokens(payload);
            state.loading = false;
            state.isAuth = true;
            state.user = payload?.user ?? null;
            saveUser(payload?.user ?? null);
        })
        .addCase(oauthLogin.rejected, (state, {payload}) => {
            state.loading = false;
            state.error = payload ?? 'Помилка OAuth';
        }),
});

const {reducer: authReducer, actions} = authSlice;
const authActions = {...actions, login, register, logout, oauthLogin};
export {authReducer, authActions};