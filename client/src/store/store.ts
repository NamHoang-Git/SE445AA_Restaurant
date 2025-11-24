import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './userSlice';

// Define the shape of your state
export interface UserState {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    mobile: string;
    verity_email: string;
    last_login_date: string;
    status: string;
    address_details: any[]; // Replace 'any' with actual address type
    shopping_cart: any[]; // Replace 'any' with actual cart item type
    orderHistory: any[]; // Replace 'any' with actual order type
    role: string;
    rewardsPoint: number;
}

// Define the root state type
export interface RootState {
    user: UserState;
}

// Create the store with type annotations
export const store = configureStore({
    reducer: {
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

// Export types for use throughout your app
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

// Export typed hooks for use in your components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export the store as default
export default store;
