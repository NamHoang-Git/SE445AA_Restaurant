import React, { useState } from 'react';
import { useEffect } from 'react';
import SummaryApi from '../common/SummaryApi';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/successAlert';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlareHover from '@/components/animation/GlareHover';
import { useDispatch } from 'react-redux';
import { setAllCategory } from '@/store/productSlice';
import UploadMenuCategory from '@/components/menuCategory/UploadMenuCategory';
import EditMenuCategory from '@/components/menuCategory/EditMenuCategory';
import ConfirmBox from '@/components/ConfirmBox';
import ViewImage from '@/components/ViewImage';
// import ViewImage from '../components/ViewImage';

const MenuCategoryPage = () => {
    const [openUploadCaregory, setOpenUploadCaregory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        image: '',
    });

    const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState({
        _id: '',
    });
    const [imageURL, setImageURL] = useState('');

    const dispatch = useDispatch();

    const fetchCategory = async () => {
        const accessToken = localStorage.getItem('accesstoken');
        if (!accessToken) return;

        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_category,
            });

            const { data: responseData } = response;

            if (responseData.success) {
                setData(responseData.data);
                dispatch(setAllCategory(responseData.data));
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleDeleteCategory = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.delete_category,
                data: deleteCategory,
            });

            const { data: responseData } = response;

            if (responseData.success) {
                successAlert(responseData.message);
                fetchCategory();
                setOpenConfirmBoxDelete(false);
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    return (
        <section className="container mx-auto grid gap-2 z-10">
            {/* Header */}
            <Card className="py-6 flex-row justify-between gap-6">
                <CardHeader>
                    <CardTitle className="text-lg text-highlight font-bold uppercase">
                        Danh mục
                    </CardTitle>
                    <CardDescription>
                        Quản lý thông tin danh mục
                    </CardDescription>
                </CardHeader>

                <CardFooter>
                    <GlareHover
                        background="transparent"
                        glareOpacity={0.3}
                        glareAngle={-30}
                        glareSize={300}
                        transitionDuration={800}
                        playOnce={false}
                    >
                        <Button
                            onClick={() => setOpenUploadCaregory(true)}
                            className="bg-foreground"
                        >
                            Thêm Mới
                        </Button>
                    </GlareHover>
                </CardFooter>
            </Card>
            <Card className="space-y-4 py-6">
                {/* Category Grid */}
                {!data[0] && !loading && (
                    <NoData message="Chưa có danh mục nào" />
                )}

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-[10px] sm:gap-6 py-2">
                    {data.map((category, index) => (
                        <div
                            key={category._id || index}
                            className="group bg-white rounded-xl shadow-sm shadow-secondary-100 hover:shadow-lg transition-all duration-300
                        border border-gray-100 overflow-hidden cursor-pointer"
                        >
                            <div className="w-full h-32 sm:h-52 overflow-hidden bg-gray-50">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            '/placeholder-category.jpg';
                                    }}
                                    onClick={() => setImageURL(category.image)}
                                />
                            </div>

                            <div className="px-2 py-3 sm:px-3 sm:py-4 flex flex-col gap-3">
                                <h3 className="font-semibold line-clamp-2 text-sm sm:text-base h-6 w-full text-center">
                                    {category.name}
                                </h3>

                                {/* PC & Tablet */}
                                <div className="mt-auto sm:flex hidden gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenEdit(true);
                                            setEditData(category);
                                        }}
                                        className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-600
                                font-semibold rounded p-1 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4 mb-[2px]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenConfirmBoxDelete(true);
                                            setDeleteCategory(category);
                                        }}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600
                                font-semibold rounded p-1 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4 mb-[2px]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                        <span>Xóa</span>
                                    </button>
                                </div>

                                {/* Mobile */}
                                <div className="mt-auto sm:hidden flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenEdit(true);
                                            setEditData(category);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm
                                    bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenConfirmBoxDelete(true);
                                            setDeleteCategory(category);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm
                                    bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && <Loading />}
            </Card>

            {openUploadCaregory && (
                <UploadMenuCategory
                    fetchData={fetchCategory}
                    close={() => setOpenUploadCaregory(false)}
                />
            )}

            {openEdit && (
                <EditMenuCategory
                    fetchData={fetchCategory}
                    data={editData}
                    close={() => setOpenEdit(false)}
                />
            )}

            {openConfirmBoxDelete && (
                <ConfirmBox
                    confirm={handleDeleteCategory}
                    cancel={() => setOpenConfirmBoxDelete(false)}
                    close={() => setOpenConfirmBoxDelete(false)}
                    title="Xóa danh mục"
                    message="Bạn có chắc chắn muốn xóa danh mục này?"
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}

            {imageURL && (
                <ViewImage url={imageURL} close={() => setImageURL('')} />
            )}
        </section>
    );
};

export default MenuCategoryPage;
