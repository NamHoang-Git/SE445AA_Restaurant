import React, { useState, useEffect } from 'react';
import SummaryApi from '@/common/SummaryApi';
import Axios from '@/utils/Axios';
import AxiosToastError from '@/utils/AxiosToastError';
import { format } from 'date-fns';
import { LuPencil, LuTrash } from 'react-icons/lu';
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
import Loading from '@/components/Loading';

const SubMenuCategoryPage = () => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openUploadSubMenuCategory, setOpenUploadSubMenuCategory] =
        useState(false);

    // Fetch submenu categories
    const fetchSubMenuCategories = async () => {
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
                setTableData(formattedData);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (item) => {
        // Implement edit functionality
        console.log('Edit item:', item);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục phụ này?')) {
            try {
                const response = await Axios({
                    ...SummaryApi.delete_sub_menu_category,
                    url: '/api/sub-menu-category/delete-sub-menu-category',
                    data: { _id: id },
                });

                if (response.data.success) {
                    fetchSubMenuCategories(); // Refresh the list
                }
            } catch (error) {
                AxiosToastError(error);
            }
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchSubMenuCategories();
    }, []);

    // Table columns
    const columns = [
        {
            key: 'id',
            label: 'ID',
            type: 'number',
            sortable: true,
            format: (value) => value || '',
        },
        {
            key: 'name',
            label: 'Tên',
            type: 'string',
            sortable: true,
            format: (value) => value || '',
        },
        {
            key: 'date',
            label: 'Ngày tạo',
            type: 'string',
            sortable: true,
            format: (value) => value || '',
        },
        {
            key: 'image',
            label: 'Hình ảnh',
            type: 'string',
            sortable: false,
            format: (value, row) => {
                if (!row) return 'No Image';
                return row.image ? (
                    <img
                        src={row.image}
                        alt={row.name || 'Image'}
                        className="w-12 h-12 object-cover rounded"
                    />
                ) : (
                    'No Image'
                );
            },
        },
        {
            key: 'category',
            label: 'Danh mục',
            type: 'string',
            sortable: true,
            format: (value) => value || 'N/A',
        },
        {
            key: 'action',
            label: 'Thao tác',
            type: 'string',
            sortable: false,
            format: (_, row) =>
                row ? (
                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row);
                            }}
                        >
                            <LuPencil size={18} />
                        </button>
                        <button
                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row._id);
                            }}
                        >
                            <LuTrash size={18} />
                        </button>
                    </div>
                ) : null,
        },
    ];

    if (loading) {
        return <Loading />;
    }

    return (
        <section className="container mx-auto grid gap-2 z-10">
            {/* Header */}
            <Card className="py-6 flex flex-col md:flex-row justify-between gap-6 border-card-foreground">
                <CardHeader>
                    <CardTitle className="text-lg text-highlight font-bold uppercase">
                        Danh mục phụ
                    </CardTitle>
                    <CardDescription>
                        Quản lý thông tin danh mục phụ
                    </CardDescription>
                </CardHeader>

                <CardFooter className="justify-end">
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
                        data={tableData}
                        columns={columns}
                        pageSize={10}
                        filterable={true}
                        searchable={true}
                        searchPlaceholder="Tìm kiếm danh mục phụ..."
                    />
                </CardContent>
            </Card>

            {openUploadSubMenuCategory && (
                <UploadSubMenuCategoryModel
                    close={() => setOpenUploadSubMenuCategory(false)}
                    fetchData={fetchSubMenuCategories}
                />
            )}
        </section>
    );
};

export default SubMenuCategoryPage;
