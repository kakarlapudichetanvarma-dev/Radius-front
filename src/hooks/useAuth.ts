import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setAuth, logout } from '../store/slices/auth.slice';
import { authService } from '../services/auth.service';
import type {
    RegisterRequest,
    LoginRequest,
    OtpRequest
} from '../types/auth.types';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, accessToken, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    // Register
    const register = async (data: RegisterRequest) => {
        const response = await authService.register(data);
        return response.data;
    };

    // Login — triggers OTP email
    const login = async (data: LoginRequest) => {
        const response = await authService.login(data);
        return response.data;
    };

    // Verify OTP — saves token and user
    const verifyOtp = async (data: OtpRequest) => {
        const response = await authService.verifyOtp(data);
        if (response.data.success) {
            dispatch(setAuth(response.data.data)); // ← saves token to redux + localStorage
        }
        return response.data;
    };

    // Logout
    const logoutUser = () => {
        dispatch(logout());
    };

    // Get profile
    const getProfile = async () => {
        const response = await authService.getProfile();
        return response.data;
    };

    return {
        user,
        accessToken,
        isAuthenticated,
        register,
        login,
        verifyOtp,
        logout: logoutUser,
        getProfile
    };
};