import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setLoadingCategory } from './store/productSlice';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';
import AxiosToastError from './utils/AxiosToastError';
import fetchUserDetails from './utils/fetchUserDetails';
import { Footer } from './components/footer';
import { Header } from '@/components/Header';
import LiquidEther from './components/animation/LiquidEther';

function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const hiddenCartLinkPaths = ['/checkout', '/cart'];
    const hideLayout = [
        '/login',
        '/register',
        '/registration-success',
        '/forgot-password',
        '/verification-otp',
        '/reset-password',
    ].some((path) => location.pathname.startsWith(path));
    const dashBoardLayout = ['/admin', '/dashboard'].some((path) =>
        location.pathname.startsWith(path)
    );

    useEffect(() => {
        (async () => {
            const res = await fetchUserDetails();
            dispatch(setUserDetails(res?.success ? res.data : null));

            try {
                dispatch(setLoadingCategory(true));
                const catRes = await Axios({ ...SummaryApi.get_menu_category });

                if (catRes.data?.success) {
                    dispatch(
                        setAllCategory(
                            catRes.data.data.sort((a, b) =>
                                a.name.localeCompare(b.name)
                            )
                        )
                    );
                }
            } catch (error) {
                AxiosToastError(error);
            } finally {
                dispatch(setLoadingCategory(false));
            }
        })();
    }, [dispatch]);

    // Update colors based on theme
    const s = getComputedStyle(document.documentElement);
    const colors = [
        s.getPropertyValue('--ether-1').trim(),
        s.getPropertyValue('--ether-2').trim(),
        s.getPropertyValue('--ether-3').trim(),
    ];

    return (
        <GlobalProvider>
            {!hideLayout && !dashBoardLayout && (
                <>
                    <Header />
                    <main className="min-h-[80vh]">
                        <div className="fixed inset-0 z-0 pointer-events-none">
                            <LiquidEther
                                colors={colors}
                                isViscous={false}
                                iterationsViscous={8}
                                iterationsPoisson={8}
                                resolution={0.3}
                                autoDemo={true}
                                autoSpeed={0.4}
                                autoRampDuration={1.2}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <div className="relative">
                            <Outlet />
                        </div>
                    </main>
                    <Footer />
                    {!hiddenCartLinkPaths.includes(location.pathname) && (
                        <CartMobileLink />
                    )}
                </>
            )}

            {hideLayout && (
                <main className="min-h-screen">
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <LiquidEther
                            colors={colors}
                            isViscous={false}
                            iterationsViscous={8}
                            iterationsPoisson={8}
                            resolution={0.3}
                            autoDemo={true}
                            autoSpeed={0.4}
                            autoRampDuration={1.2}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    <div className="relative">
                        <Outlet />
                    </div>
                </main>
            )}

            {dashBoardLayout && (
                <main className="min-h-screen">
                    <Outlet />
                </main>
            )}
            <Toaster />
        </GlobalProvider>
    );
}

export default App;
