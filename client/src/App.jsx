import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { Footer } from './components/footer';
import { Header } from '@/components/Header';
import LiquidEther from './components/animation/LiquidEther';

function App() {
    const location = useLocation();
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

    // Update colors based on theme
    const s = getComputedStyle(document.documentElement);
    const colors = [
        s.getPropertyValue('--ether-1').trim(),
        s.getPropertyValue('--ether-2').trim(),
        s.getPropertyValue('--ether-3').trim(),
    ];

    return (
        <>
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
                                autoSpeed={0.2}
                                autoRampDuration={0.8}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <div className="relative">
                            <Outlet />
                        </div>
                    </main>
                    <Footer />
                </>
            )}

            {hideLayout && (
                <main className="min-h-screen">
                    <Outlet />
                </main>
            )}

            {dashBoardLayout && (
                <main className="min-h-screen">
                    <Outlet />
                </main>
            )}
            <Toaster />
        </>
    );
}

export default App;
