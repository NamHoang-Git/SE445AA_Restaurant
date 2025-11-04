import React, { useState } from 'react';
import { IoAddSharp, IoClose } from 'react-icons/io5';
import uploadImage from '@/utils/UploadImage.js';
import Axios from '@/utils/Axios.js';
import SummaryApi from '@/common/SummaryApi.js';
import AxiosToastError from '@/utils/AxiosToastError.js';
import { useSelector } from 'react-redux';
import successAlert from '@/utils/successAlert';
import Loading from '../Loading';

const UploadSubMenuCategoryModel = ({ close, fetchData }) => {
    const [subMenuCategoryData, setSubMenuCategoryData] = useState({
        name: '',
        image: '',
        description: '',
        parentCategory: '',
    });

    const [loading, setLoading] = useState(false);
    const [selectCategoryValue, setSelectCategoryValue] = useState('');

    const allCategory = useSelector((state) => state.product.allCategory);

    const handleOnChange = (e) => {
        const { name, value } = e.target;

        setSubMenuCategoryData((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleUploadSubCategoryImage = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setLoading(true);

        const response = await uploadImage(file);
        const { data: ImageResponse } = response;
        setLoading(false);

        setSubMenuCategoryData((prev) => {
            return {
                ...prev,
                image: ImageResponse.data.url,
            };
        });
    };

    const handleRemoveCategorySelected = () => {
        setSubMenuCategoryData((prev) => ({
            ...prev,
            parentCategory: '',
        }));
        setSelectCategoryValue('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.add_sub_menu_category,
                data: subMenuCategoryData,
            });

            const { data: responseData } = response;

            if (responseData.success) {
                successAlert(responseData.message);
                close();
                fetchData();
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="fixed top-0 bottom-0 left-0 right-0
        bg-neutral-800 z-50 bg-opacity-60 p-4 flex items-center justify-center"
        >
            <div className="bg-white max-w-4xl w-full p-4 rounded">
                <div className="flex items-center justify-between">
                    <h1 className="font-bold">Add Sub Category</h1>
                    <button
                        onClick={close}
                        className="text-neutral-900 w-fit block ml-auto"
                    >
                        <IoClose size={25} />
                    </button>
                </div>
                <form
                    action=""
                    className="mt-6 mb-2 grid gap-6"
                    onSubmit={handleSubmit}
                >
                    <div className="grid gap-2">
                        <label id="name" htmlFor="name">
                            Name (<span className="text-red-500">*</span>)
                        </label>
                        <input
                            type="text"
                            className="bg-blue-50 p-2 border rounded outline-none
                            focus-within:border-primary-200"
                            id="name"
                            placeholder="Enter sub category name!"
                            name="name"
                            value={subMenuCategoryData.name}
                            onChange={handleOnChange}
                        />
                    </div>
                    <div className="grid gap-2">
                        <p>
                            Image (<span className="text-red-500">*</span>)
                        </p>
                        <div className="flex gap-4 items-center flex-col lg:flex-row">
                            <div
                                className="bg-blue-50 p-2 h-36 w-full lg:w-36 border rounded
                                flex items-center justify-center"
                            >
                                {subMenuCategoryData.image ? (
                                    <img
                                        src={subMenuCategoryData.image}
                                        alt="subMenuCategory"
                                        className="w-full h-full object-scale-down"
                                    />
                                ) : (
                                    <p className="text-sm text-neutral-500">
                                        No Image
                                    </p>
                                )}
                            </div>
                            <label htmlFor="uploadSubCategoryImage">
                                <div
                                    className={`${
                                        !subMenuCategoryData.name
                                            ? 'bg-gray-300 text-white cursor-no-drop'
                                            : 'bg-blue-400 text-white hover:bg-blue-600 cursor-pointer'
                                    } px-3 py-1 text-sm rounded-md`}
                                >
                                    {loading ? (
                                        <Loading />
                                    ) : (
                                        <IoAddSharp size={42} />
                                    )}
                                </div>
                                <input
                                    disabled={!subMenuCategoryData.name}
                                    onChange={handleUploadSubCategoryImage}
                                    type="file"
                                    accept="image/*"
                                    id="uploadSubCategoryImage"
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label>
                            Category (<span className="text-red-500">*</span>)
                        </label>

                        {/* Display Value */}
                        {subMenuCategoryData.parentCategory && (
                            <div className="flex gap-4 flex-wrap">
                                <span className="bg-slate-200 shadow-md px-2 mx-1 flex items-center gap-2">
                                    {
                                        allCategory.find(
                                            (cat) =>
                                                cat._id ===
                                                subMenuCategoryData.parentCategory
                                        )?.name
                                    }
                                    <div
                                        onClick={handleRemoveCategorySelected}
                                        className="cursor-pointer hover:text-red-600"
                                    >
                                        <IoClose size={18} />
                                    </div>
                                </span>
                            </div>
                        )}

                        {/* Select Category */}
                        <select
                            className={`${
                                subMenuCategoryData.parentCategory
                                    ? 'mt-1'
                                    : 'mt-0'
                            } bg-blue-50 p-2 border rounded outline-none focus-within:border-primary-200`}
                            value={selectCategoryValue}
                            disabled={!!subMenuCategoryData.parentCategory}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!value) return;

                                setSubMenuCategoryData((prev) => ({
                                    ...prev,
                                    parentCategory: value,
                                }));

                                setSelectCategoryValue('');
                            }}
                        >
                            <option value={''}>Select Category</option>
                            {allCategory.map((parentCategory) => (
                                <option
                                    value={parentCategory?._id}
                                    key={parentCategory._id + 'subMenuCategory'}
                                    disabled={
                                        parentCategory._id ===
                                        subMenuCategoryData.parentCategory
                                    }
                                >
                                    {parentCategory?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        disabled={
                            !subMenuCategoryData.name ||
                            !subMenuCategoryData.image ||
                            !subMenuCategoryData.parentCategory
                        }
                        className={`${
                            subMenuCategoryData.name &&
                            subMenuCategoryData.image &&
                            subMenuCategoryData.parentCategory
                                ? 'bg-green-700 text-white font-semibold hover:bg-green-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-700 font-medium cursor-no-drop'
                        } py-2 rounded-md`}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </section>
    );
};

export default UploadSubMenuCategoryModel;
