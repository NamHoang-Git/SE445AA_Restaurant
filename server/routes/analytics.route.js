// routes/analytics.route.js
import { Router } from 'express';
import {
    getProfitSummaryController,
    getProfitMarginsController,
    getTopProductsController,
    getLowMarginProductsController,
    getROIController,
    getProfitByCategoryController,
    getIntegrationStatusController,
    getQualityMetricsController
} from '../controllers/analytics.controller.js';

const router = Router();

// Profit Analytics
router.get('/profit/summary', getProfitSummaryController);
router.get('/profit/margins', getProfitMarginsController);
router.get('/profit/top-products', getTopProductsController);
router.get('/profit/low-margin', getLowMarginProductsController);
router.get('/profit/roi', getROIController);
router.get('/profit/by-category', getProfitByCategoryController);

// Integration Status
router.get('/integration/status', getIntegrationStatusController);

// Data Quality
router.get('/quality/metrics', getQualityMetricsController);

export default router;
