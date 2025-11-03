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
import CategoryCard from '@/components/menuCategory/CategoryCard';

const MenuCategoryPage = () => {
    const [openUploadCaregory, setOpenUploadCaregory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        image: '',
        description: '',
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
            <Card className="py-6 flex-row justify-between gap-6 border-card-foreground">
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
            <Card className="space-y-4 py-6 px-4">
                {/* Category Grid */}
                {!data[0] && !loading && (
                    <NoData message="Chưa có danh mục nào" />
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 py-2">
                    {data.map((category, index) => (
                        <CategoryCard
                            key={category._id || index}
                            data={category}
                            onEdit={(item) => {
                                setEditData(item);
                                setOpenEdit(true);
                            }}
                            onDelete={(item) => {
                                setDeleteCategory(item);
                                setOpenConfirmBoxDelete(true);
                            }}
                            onViewImage={(url) => setImageURL(url)}
                        />
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
