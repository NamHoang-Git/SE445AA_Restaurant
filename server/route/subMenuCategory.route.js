import { Router } from "express";
import auth from './../middleware/auth.js';
import {
    addSubMenuCategoryController,
    getSubMenuCategoryController,
    updateSubMenuCategoryController,
    deleteSubMenuCategoryController,
} from "../controllers/subMenuCategory.controller.js";

const subMenuCategoryRouter = Router()

subMenuCategoryRouter.post('/add-sub-menu-category', auth, addSubMenuCategoryController)
subMenuCategoryRouter.get('/get-sub-menu-category', getSubMenuCategoryController)
subMenuCategoryRouter.put('/update-sub-menu-category', auth, updateSubMenuCategoryController)
subMenuCategoryRouter.delete('/delete-sub-menu-category', auth, deleteSubMenuCategoryController)

export default subMenuCategoryRouter