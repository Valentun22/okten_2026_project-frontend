import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { IAuthResponse, ILoginDto, IRegisterDto, IUser } from '../../interfaces/IUserInterface';
import { authService } from '../../services/auth.service';
import { tokenStorage } from '../../services/tokenStorage';

interface IAuthState {
    user:      IUser | null;
    isAuth:    boolean;
    loading:   boolean;
    error:     string | null;
}

const initialState: IAuthState = {
    user:    null,
    isAuth:  !!tokenStorage.getAccess(),
    loading: false,
    error:   null,
};

const login = createAsyncThunk<IAuthResponse, ILoginDto, { rejectValue: string }>(
    'auth/login',
    async (dto, { rejectWithValue }) => {
        try { return await authService.login(dto); }
        catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Невірний email або пароль');
        }
    }
);

const register = createAsyncThunk<IAuthResponse, IRegisterDto, { rejectValue: string }>(
    'auth/register',
    async (dto, { rejectWithValue }) => {
        try { return await authService.register(dto); }
        catch (e) {
            const err = e as AxiosError<any>;
            return rejectWithValue(err.response?.data?.message ?? 'Помилка реєстрації');
        }
    }
);

const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) { state.user = action.payload; state.isAuth = true; },
    },
    extraReducers: builder => builder
        .addCase(login.pending,    state => { state.loading = true;  state.error = null; })
        .addCase(login.fulfilled,  (state, { payload }) => {
            state.loading = false; state.isAuth = true;
            if ((payload as any).user) state.user = (payload as any).user;
        })
        .addCase(login.rejected,   (state, { payload }) => { state.loading = false; state.error = payload ?? 'Помилка'; })
        .addCase(register.pending,   state => { state.loading = true; state.error = null; })
        .addCase(register.fulfilled, (state, { payload }) => {
            state.loading = false; state.isAuth = true;
            if ((payload as any).user) state.user = (payload as any).user;
        })
        .addCase(register.rejected,  (state, { payload }) => { state.loading = false; state.error = payload ?? 'Помилка'; })
        .addCase(logout.fulfilled,   state => { state.isAuth = false; state.user = null; }),
});

const { reducer: authReducer, actions } = authSlice;
const authActions = { ...actions, login, register, logout };
export { authReducer, authActions };