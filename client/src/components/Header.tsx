import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Menu } from 'lucide-react';
import logo from '../assets/logo.png';
import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    MouseEvent,
    KeyboardEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import defaultAvatar from '../assets/defaultAvatar.png';
import { RootState } from '@/store/store';
import UserMenu from './UserMenu';

// Define type for the user object
interface User {
    _id?: string;
    name: string;
    avatar?: string;
    role?: string;
}

// Define type for the cart item
interface CartItem {
    // Add cart item properties here based on your application's structure
    [key: string]: any;
}

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state?.user) as User | null;
    const [openUserMenu, setOpenUserMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the menu
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!menuRef.current) return;
            const target = event.target as Node;
            const isClickInside = menuRef.current.contains(target);
            const isToggleButton = (event.target as HTMLElement).closest(
                'button[aria-haspopup="true"]'
            );
            if (!isClickInside && !isToggleButton) {
                setOpenUserMenu(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenUserMenu(false);
            }
        };

        // Add type assertions for the event listeners
        document.addEventListener(
            'mousedown',
            handleClick as unknown as EventListener,
            true
        );
        document.addEventListener(
            'keydown',
            handleEscape as unknown as EventListener
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClick as unknown as EventListener,
                true
            );
            document.removeEventListener(
                'keydown',
                handleEscape as unknown as EventListener
            );
        };
    }, []);

    // Toggle user menu
    const toggleUserMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenUserMenu((prev) => !prev);
    }, []);

    // Close menu
    const closeMenu = useCallback(() => {
        setOpenUserMenu(false);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const redirectToLoginPage = () => {
        navigate('/login');
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <header className="sticky top-0 z-50 p-4 text-amber-50 font-semibold">
                <div className="container mx-auto">
                    <div className="flex h-16 items-center justify-between px-6 liquid-glass-header rounded-full">
                        {/* Brand Logo */}
                        <Link
                            to="/"
                            onClick={scrollToTop}
                            className="flex items-center gap-1.5"
                        >
                            <img
                                src={logo}
                                alt="EatEase logo"
                                width={25}
                                height={25}
                            />
                            <span className="font-semibold tracking-wide">
                                EatEase
                            </span>
                        </Link>
                        {/* User */}
                        <div className="hidden md:flex items-center justify-end gap-5">
                            {user?._id ? (
                                <div className="relative" ref={menuRef}>
                                    <div className="relative">
                                        <button
                                            onClick={toggleUserMenu}
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-white rounded-lg hover:bg-white/10 transition-colors"
                                            aria-expanded={openUserMenu}
                                            aria-haspopup="true"
                                            aria-label="User menu"
                                            type="button"
                                        >
                                            <div className="relative p-0.5 overflow-hidden rounded-full border bg-amber-50/50">
                                                <img
                                                    src={
                                                        user.avatar ||
                                                        defaultAvatar
                                                    }
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    width={32}
                                                    height={32}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start flex-1 min-w-0">
                                                <span
                                                    title={user.name}
                                                    className="text-sm font-bold text-white truncate max-w-16 lg:max-w-20 xl:max-w-max"
                                                >
                                                    {user.name}
                                                </span>
                                                {user.role === 'ADMIN' && (
                                                    <span className="text-xs text-orange-100">
                                                        Quản trị viên
                                                    </span>
                                                )}
                                            </div>
                                            {openUserMenu ? (
                                                <FaCaretUp
                                                    className="flex-shrink-0 ml-2"
                                                    size={15}
                                                />
                                            ) : (
                                                <FaCaretDown
                                                    className="flex-shrink-0 ml-2"
                                                    size={15}
                                                />
                                            )}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {openUserMenu && (
                                            <motion.div
                                                className="absolute right-0 top-full mt-2 z-50 w-64"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{
                                                    duration: 0.15,
                                                    ease: 'easeOut',
                                                }}
                                            >
                                                <UserMenu
                                                    close={closeMenu}
                                                    menuTriggerRef={
                                                        menuRef as React.RefObject<HTMLDivElement>
                                                    }
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={redirectToLoginPage}
                                    className="underline text-sm hover:text-amber-200 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                            )}
                        </div>
                        {/* Mobile Nav */}
                        <div className="md:hidden">
                            <Sheet
                                open={isMobileMenuOpen}
                                onOpenChange={setIsMobileMenuOpen}
                            >
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-gray-700 bg-gray-800 text-white hover:bg-gray-600 hover:text-lime-300"
                                    >
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="liquid-glass text-white border-gray-800 p-0 w-72 flex flex-col"
                                >
                                    <div className="flex items-center gap-1.5 px-4 py-4 border-b border-gray-800">
                                        <Link
                                            to="/"
                                            onClick={scrollToTop}
                                            className="flex items-center gap-1.5"
                                        >
                                            <img
                                                src={logo}
                                                alt="EatEase logo"
                                                width={25}
                                                height={25}
                                                className="h-5 w-5"
                                            />
                                            <span className="font-semibold tracking-wide text-white">
                                                EatEase
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="mt-auto border-t border-gray-800 p-4">
                                        <div className="flex items-center justify-center w-full gap-5">
                                            {user?._id ? (
                                                <div
                                                    className="relative w-full"
                                                    ref={menuRef}
                                                >
                                                    <div className="relative">
                                                        <button
                                                            onClick={
                                                                toggleUserMenu
                                                            }
                                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-white rounded-lg hover:bg-white/10 transition-colors"
                                                            aria-expanded={
                                                                openUserMenu
                                                            }
                                                            aria-haspopup="true"
                                                            aria-label="User menu"
                                                            type="button"
                                                        >
                                                            <div className="relative p-0.5 overflow-hidden rounded-full liquid-glass">
                                                                <img
                                                                    src={
                                                                        user.avatar ||
                                                                        defaultAvatar
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                    width={32}
                                                                    height={32}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col items-start flex-1 min-w-0">
                                                                <span
                                                                    title={
                                                                        user.name
                                                                    }
                                                                    className="text-sm font-medium text-white"
                                                                >
                                                                    {user.name}
                                                                </span>
                                                                {user.role ===
                                                                    'ADMIN' && (
                                                                    <span className="text-xs text-purple-400">
                                                                        Quản trị
                                                                        viên
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {openUserMenu ? (
                                                                <FaCaretDown
                                                                    className="flex-shrink-0 ml-2"
                                                                    size={15}
                                                                />
                                                            ) : (
                                                                <FaCaretUp
                                                                    className="flex-shrink-0 ml-2"
                                                                    size={15}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <AnimatePresence>
                                                        {openUserMenu && (
                                                            <motion.div
                                                                className="absolute right-0 bottom-full mb-2 z-50 w-64"
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: -10,
                                                                }}
                                                                transition={{
                                                                    duration: 0.15,
                                                                    ease: 'easeOut',
                                                                }}
                                                            >
                                                                <UserMenu
                                                                    close={
                                                                        closeMenu
                                                                    }
                                                                    menuTriggerRef={
                                                                        menuRef
                                                                    }
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={
                                                        redirectToLoginPage
                                                    }
                                                    className="w-full text-center py-2 px-4 bg-lime-400 text-gray-800 rounded-lg hover:bg-lime-300 transition-colors font-medium"
                                                >
                                                    Đăng nhập
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
