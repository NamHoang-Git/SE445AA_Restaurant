import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { valideURLConvert } from '../../utils/valideURLConvert';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { setAllCategory, setLoadingCategory } from '@/store/productSlice';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import toast from 'react-hot-toast';

export function CategoryPanel() {
    const dispatch = useDispatch();
    const loadingCategory = useSelector(
        (state) => state.product.loadingCategory
    );
    const categoryData = useSelector((state) => state.product.allCategory);
    const navigate = useNavigate();
    const containerRef = useRef();

    const firstCategory = categoryData?.[0];

    const fetchCategories = async () => {
        try {
            dispatch(setLoadingCategory(true));
            const response = await Axios({
                ...SummaryApi.get_category,
                method: 'get',
            });

            if (response.data?.success) {
                dispatch(setAllCategory(response.data.data || []));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
            toast.error('Không thể tải danh mục. Vui lòng thử lại sau.');
        } finally {
            dispatch(setLoadingCategory(false));
        }
    };

    useEffect(() => {
        if (categoryData.length === 0) {
            fetchCategories();
        }
    }, []);

    const handleRedirectProductListPage = (id, cat) => {
        const url = `/${valideURLConvert(cat)}-${id}`;
        navigate(url);
    };

    const handleExploreClick = () => {
        handleRedirectProductListPage(firstCategory._id, firstCategory.name);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const buttonNew = (
        <Button
            onClick={() => {
                handleExploreClick();
                scrollToTop();
            }}
            className="rounded-full bg-amber-50 px-6 text-red-800 font-bold hover:bg-lime-300"
        >
            Khám phá ngay
        </Button>
    );

    return (
        <section className="relative isolate overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center py-14 sm:py-20">
                    <div className="mb-5 flex items-center gap-2">
                        <img
                            src={logo}
                            alt="EatEase logo"
                            width={30}
                            height={30}
                        />
                        <p className="text-sm uppercase tracking-[0.25em] text-highlight font-bold">
                            EatEase Restaurant
                        </p>
                    </div>
                    <h1 className="mt-3 text-center text-baseColor text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl uppercase grid gap-2">
                        <span className="block">Ẩm thực</span>
                        <span className="block text-highlight">tinh hoa</span>
                        <span className="block">Hương vị đẳng cấp</span>
                    </h1>
                    <div className="mt-6">{buttonNew}</div>

                    {/* Categories with navigation */}
                    <div className="mt-10 relative w-full">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
                            <button
                                onClick={() => {
                                    if (containerRef.current) {
                                        containerRef.current.scrollBy({
                                            left: -300,
                                            behavior: 'smooth',
                                        });
                                    }
                                }}
                                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                                aria-label="Previous categories"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div
                            ref={containerRef}
                            className="flex overflow-x-auto scrollbar-hide space-x-6 py-4 px-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {loadingCategory ? (
                                <div className="flex space-x-6">
                                    {Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            <div
                                                key={index}
                                                className="flex-shrink-0 w-48 h-48 bg-gray-200 rounded-lg animate-pulse"
                                            ></div>
                                        ))}
                                </div>
                            ) : categoryData.length > 0 ? (
                                categoryData.map((category) => (
                                    <div
                                        key={category._id}
                                        onClick={() =>
                                            handleRedirectProductListPage(
                                                category._id,
                                                category.name
                                            )
                                        }
                                        className="flex-shrink-0 w-48 h-48 bg-white rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform duration-300 hover:scale-105 group"
                                    >
                                        <div className="relative w-full h-32 overflow-hidden">
                                            <img
                                                src={
                                                    category.image ||
                                                    '/placeholder-category.jpg'
                                                }
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        '/placeholder-category.jpg';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-gray-800 line-clamp-1">
                                                {category.name}
                                            </h3>
                                            {category.description && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full py-10 text-center text-gray-500">
                                    Không có danh mục nào được tìm thấy
                                </div>
                            )}
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
                            <button
                                onClick={() => {
                                    if (containerRef.current) {
                                        containerRef.current.scrollBy({
                                            left: 300,
                                            behavior: 'smooth',
                                        });
                                    }
                                }}
                                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                                aria-label="Next categories"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PhoneCard({
    title = '8°',
    sub = 'Clear night. Great for render farm runs.',
    tone = 'calm',
    gradient = 'from-[#0f172a] via-[#14532d] to-[#052e16]',
    imageSrc,
}: {
    title?: string,
    sub?: string,
    tone?: string,
    gradient?: string,
    imageSrc?: string,
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative rounded-[28px] p-[2px] transition-all duration-700 ease-out"
        >
            <div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl bg-black group">
                <img
                    src={imageSrc}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                <div
                    className={`absolute rounded-2xl inset-0 bg-gradient-to-b from-black/75 to-black/5 transition-all duration-500 ${
                        isHovered
                            ? 'border-4 border-lime-200/70 bg-gradient-to-b from-black/5 to-cyan-500/30 transition-opacity duration-500 shadow-[0_0_25px_rgba(132,204,22,0.45)]'
                            : 'border border-transparent'
                    }`}
                />
            </div>
            <div className="absolute inset-0 flex flex-col justify-start p-6">
                <h3 className="text-xl font-bold text-lime-300">{title}</h3>
                <p className="text-sm font-semibold text-white/80">{sub}</p>
            </div>
        </div>
    );
}
