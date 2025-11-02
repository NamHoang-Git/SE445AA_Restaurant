import '@/index.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SettingsProvider } from '@/contexts/settings-context';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LiquidEther from '@/components/animation/LiquidEther';
import { ThemeProvider } from '@/components/adminDashboard/theme-provider';
import { Sidebar } from '@/components/adminDashboard/sidebar';
import { TopNav } from '@/components/adminDashboard/top-nav';

export default function AdminDashboard() {
    // Update colors based on theme
    const [colors, setColors] = useState<string[]>([]);

    const updateColors = () => {
        const s = getComputedStyle(document.documentElement);
        setColors([
            s.getPropertyValue('--ether-1').trim(),
            s.getPropertyValue('--ether-2').trim(),
            s.getPropertyValue('--ether-3').trim(),
        ]);
    };

    useEffect(() => {
        updateColors();
        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
                <TooltipProvider delayDuration={0}>
                    <div className="min-h-screen flex">
                        <Sidebar />
                        <div className="flex-1 overflow-auto">
                            <TopNav />
                            <div className="container mx-auto p-6 max-w-7xl">
                                <main className="w-full relative">
                                    <div className="fixed inset-0 z-0 pointer-events-none">
                                        <LiquidEther
                                            colors={colors}
                                            isViscous={false}
                                            iterationsViscous={8}
                                            iterationsPoisson={8}
                                            resolution={0.2}
                                            autoDemo={true}
                                            autoSpeed={0.2}
                                            autoRampDuration={1}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        />
                                    </div>
                                    <div className='relative'>
                                        <Outlet />
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}
