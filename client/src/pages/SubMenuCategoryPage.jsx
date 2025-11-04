import React, { useEffect, useState } from 'react';
import SummaryApi from '@/common/SummaryApi';
import Axios from '@/utils/Axios';
import AxiosToastError from '@/utils/AxiosToastError';
import { LuPencil, LuTrash } from 'react-icons/lu';
import Loading from '@/components/Loading';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import DynamicTable from '@/components/table/dynamic-table';
import GlareHover from '@/components/animation/GlareHover';
import UploadSubMenuCategoryModel from '@/components/subMenuCategory/UploadSubMenuCategory';
import successAlert from '@/utils/successAlert';
import { format } from 'date-fns';
import ViewImage from '@/components/ViewImage';
import ConfirmBox from '@/components/ConfirmBox';
import EditSubMenuCategory from '@/components/subMenuCategory/EditSubMenuCategory';

const SubMenuCategoryPage = () => {
    const [openUploadSubMenuCategory, setOpenUploadSubMenuCategory] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [imageURL, setImageURL] = useState('');

    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({
        _id: '',
        name: '',
        image: '',
    });

    const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
    const [deleteSubMenuCategory, setDeleteSubMenuCategory] = useState({
        _id: '',
    });

    const fetchSubCategory = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_sub_menu_category,
            });

            if (response.data.success) {
                const formattedData = response.data.data.map((item, index) => ({
                    id: index + 1,
                    _id: item._id,
                    name: item.name,
                    date: format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm'),
                    image: item.image || '',
                    category: item.parentCategory?.name || 'N/A',
                }));
                setData(formattedData);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubCategory();
    }, []);

    const handleDeleteSubMenuCategory = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.delete_sub_menu_category,
                data: deleteSubMenuCategory,
            });

            if (response.data.success) {
                successAlert(response.data.message);
                fetchSubCategory();
                setOpenConfirmBoxDelete(false);
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    // Columnas personalizadas para la tabla
    const columns = [
        { key: 'id', label: 'ID', type: 'number', sortable: true },
        { key: 'name', label: 'Tên', type: 'string', sortable: true },
        {
            key: 'date',
            label: 'Ngày tạo',
            type: 'string',
            sortable: true,
        },
        {
            key: 'image',
            label: 'Hình ảnh',
            type: 'string',
            sortable: false,
            format: (value, row) => {
                if (!row) return 'Không có';
                return row.image ? (
                    <img
                        src={row.image}
                        alt={row.name || 'Image'}
                        className="w-12 h-12 object-cover rounded hover:scale-105 cursor-pointer"
                        onClick={() => setImageURL(row.image)}
                    />
                ) : (
                    'Không có'
                );
            },
        },
        { key: 'category', label: 'Danh mục', type: 'string', sortable: false },
        {
            key: 'action',
            label: 'Thao tác',
            type: 'string',
            sortable: false,
            format: (value, row) =>
                row ? (
                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenEdit(true);
                                setEditData(row);
                            }}
                        >
                            <LuPencil size={18} />
                        </button>
                        <button
                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenConfirmBoxDelete(true);
                                setDeleteSubMenuCategory(row);
                            }}
                        >
                            <LuTrash size={18} />
                        </button>
                    </div>
                ) : null,
        },
    ];

    return (
        <section className="container mx-auto grid gap-2 z-10">
            {/* Header */}
            <Card className="py-6 flex-row justify-between gap-6 border-card-foreground">
                <CardHeader>
                    <CardTitle className="text-lg text-highlight font-bold uppercase">
                        Danh mục phụ
                    </CardTitle>
                    <CardDescription>
                        Quản lý thông tin danh mục phụ
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
                            onClick={() => setOpenUploadSubMenuCategory(true)}
                            className="bg-foreground"
                        >
                            Thêm Mới
                        </Button>
                    </GlareHover>
                </CardFooter>
            </Card>
            <Card className="space-y-4 py-6">
                <CardContent>
                    <DynamicTable
                        data={data}
                        columns={columns}
                        pageSize={5}
                        filterable={true}
                        groupable={true}
                    />
                    {loading && <Loading />}
                </CardContent>
            </Card>

            {openUploadSubMenuCategory && (
                <UploadSubMenuCategoryModel
                    close={() => setOpenUploadSubMenuCategory(false)}
                    fetchData={fetchSubCategory}
                />
            )}

            {openEdit && (
                <EditSubMenuCategory
                    close={() => setOpenEdit(false)}
                    fetchData={fetchSubCategory}
                    data={editData}
                />
            )}

            {openConfirmBoxDelete && (
                <ConfirmBox
                    confirm={handleDeleteSubMenuCategory}
                    cancel={() => setOpenConfirmBoxDelete(false)}
                    close={() => setOpenConfirmBoxDelete(false)}
                    title="Xóa danh mục phụ"
                    message="Bạn có chắc chắn muốn xóa danh mục phụ này?"
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

export default SubMenuCategoryPage;
