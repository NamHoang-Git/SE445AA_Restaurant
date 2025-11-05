
import SubMenuCategoryModel from "../models/subMenuCategory.model.js"

export const addSubMenuCategoryController = async (req, res) => {
    try {
        const { name, image, description, parentCategory } = req.body

        if (!name || !image || !parentCategory) {
            return res.status(400).json({
                message: "Vui lòng nhập các trường bắt buộc",
                error: true,
                success: false
            })
        }

        const addSubMenuCategory = new SubMenuCategoryModel({
            name,
            image,
            description,
            parentCategory
        })

        const saveSubMenuCategory = await addSubMenuCategory.save()

        if (!saveSubMenuCategory) {
            return res.status(500).json({
                message: "Không tạo được",
                error: true,
                success: false
            })
        }

        return res.json({
            message: "Thêm danh mục menu phụ thành công",
            data: saveSubMenuCategory,
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getSubMenuCategoryController = async (req, res) => {
    try {
        const data = await SubMenuCategoryModel.find().sort({ createdAt: -1 }).populate('parentCategory')

        return res.json({
            message: 'Danh mục phụ',
            data: data,
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const updateSubMenuCategoryController = async (req, res) => {
    try {
        const { _id, name, image, description, parentCategory } = req.body

        const check = await SubMenuCategoryModel.findById(_id)

        if (!check) {
            return res.status(400).json({
                message: 'Check your _id',
                error: true,
                success: false
            })
        }

        const update = await SubMenuCategoryModel.findByIdAndUpdate(
            _id,
            { name, image, description, parentCategory },
            { new: true }
        );

        return res.json({
            message: 'Cập nhật danh mục phụ thành công',
            error: false,
            success: true,
            data: update
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const deleteSubMenuCategoryController = async (req, res) => {
    try {
        const { _id } = req.body

        const deleteSubMenuCategory = await SubMenuCategoryModel.findByIdAndDelete(_id)

        return res.json({
            message: 'Xóa danh mục phụ thành công',
            data: deleteSubMenuCategory,
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}