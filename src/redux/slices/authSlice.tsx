import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ILoginDto, IRegisterDto } from '../../interfaces/IUserInterface';
import { authService } from '../../services/auth.service';
import { tokenStorage } from '../../services/tokenStorage';

interface IUser { id: string; name?: string; email?: string; image?: string; bio?: string; isCritic?: boolean; }

interface IAuthState {
    user:    IUser | null;
    isAuth:  boolean;
    loading: boolean;
    error:   string | null;
}

const initialState: IAuthState = {
    user:    null,
    isAuth:  !!tokenStorage.getAccess(),
    loading: false,
    error:   null,
};

/* helpers */
const saveTokens = (data: any) => {
    if (data?.accessToken)  tokenStorage.setAccess(data.accessToken);
    if (data?.refreshToken) tokenStorage.setRefresh(data.refreshToken);
};

const login = createAsyncThunk<any, ILoginDto, { rejectValue: string }>(
    'auth/login',
    async (dto, { rejectWithValue }) => {
        try { return await authService.login(dto); }
        catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Невірний email або пароль');
        }
    }
);

const register = createAsyncThunk<any, IRegisterDto, { rejectValue: string }>(
    'auth/register',
    async (dto, { rejectWithValue }) => {
        try { return await authService.register(dto); }
        catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Помилка реєстрації');
        }
    }
);

const logout = createAsyncThunk('auth/logout', async () => { authService.logout(); });

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) { state.user = action.payload; },
        clearError(state)      { state.error = null; },
    },
    extraReducers: builder => builder
        .addCase(login.pending,    state => { state.loading = true;  state.error = null; })
        .addCase(login.fulfilled,  (state, { payload }) => {
            saveTokens(payload);
            state.loading = false;
            state.isAuth  = true;
            state.user    = payload?.user ?? null;
        })
        .addCase(login.rejected,   (state, { payload }) => { state.loading = false; state.error = payload ?? 'Помилка'; })

        .addCase(register.pending,   state => { state.loading = true; state.error = null; })
        .addCase(register.fulfilled, (state, { payload }) => {
            saveTokens(payload);
            state.loading = false;
            state.isAuth  = true;
            state.user    = payload?.user ?? null;
        })
        .addCase(register.rejected,  (state, { payload }) => { state.loading = false; state.error = payload ?? 'Помилка'; })

        .addCase(logout.fulfilled, state => { state.isAuth = false; state.user = null; }),
});

const { reducer: authReducer, actions } = authSlice;
const authActions = { ...actions, login, register, logout };
export { authReducer, authActions };