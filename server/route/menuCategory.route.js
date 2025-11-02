import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    addCategoryController, deleteCategoryController, getCategoryController,
    updateCategoryController
} from "../controllers/menuCategory.controller.js";

const menuCategoryRouter = Router()

menuCategoryRouter.post('/add-category', auth, addCategoryController)
menuCategoryRouter.get('/get-category', getCategoryController)
menuCategoryRouter.put('/update-category', auth, updateCategoryController)
menuCategoryRouter.delete('/delete-category', auth, deleteCategoryController)

export default menuCategoryRouter