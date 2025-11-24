import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import VerifyEmail from '@/pages/VerifyEmail';
import ForgotPassword from '@/pages/ForgotPassword';
import OtpVerification from '@/pages/OtpVerification';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminDashboard from '@/layouts/AdminDashboard';
import Profile from '@/pages/Profile';
import EtlMonitorPage from '@/pages/EtlMonitorPage';
import EmployeeManagementPage from '@/pages/EmployeeManagementPage';
import CheckInOutPage from '@/pages/CheckInOutPage';
import MyPerformancePage from '@/pages/MyPerformancePage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Navigate to="/login" replace />,
            },
            {
                path: 'login',
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'dashboard',
                        element: <Profile />,
                    },
                    {
                        path: 'users',
                        element: <Profile />,
                    },
                    {
                        path: 'reports',
                        element: <EtlMonitorPage />,
                    },
                    {
                        path: 'employees',
                        element: <EmployeeManagementPage />,
                    },
                    {
                        path: 'check-in-out',
                        element: <CheckInOutPage />,
                    },
                    {
                        path: 'my-performance',
                        element: <MyPerformancePage />,
                    },
                ],
            },
            {
                path: 'register',
                element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                ),
            },
            {
                path: 'registration-success',
                element: (
                    <PublicRoute>
                        <RegistrationSuccess />
                    </PublicRoute>
                ),
            },
            {
                path: 'verify-email',
                element: (
                    <PublicRoute>
                        <VerifyEmail />
                    </PublicRoute>
                ),
            },
            {
                path: 'forgot-password',
                element: (
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                ),
            },
            {
                path: 'verification-otp',
                element: (
                    <PublicRoute>
                        <OtpVerification />
                    </PublicRoute>
                ),
            },
            {
                path: 'reset-password',
                element: <ResetPassword />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'profile',
                        element: <Profile />,
                    },
                ],
            },
        ],
    },
]);

export default router;
