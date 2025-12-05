// common/warehouse_api.js - Warehouse API endpoints
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const warehouseAPI = {
    // Get all imports
    getImports: {
        url: `${backendUrl}/api/warehouse/imports`,
        method: 'GET'
    },

    // Get single import
    getImport: (id) => ({
        url: `${backendUrl}/api/warehouse/imports/${id}`,
        method: 'GET'
    }),

    // Create import
    createImport: {
        url: `${backendUrl}/api/warehouse/imports`,
        method: 'POST'
    },

    // Update import
    updateImport: (id) => ({
        url: `${backendUrl}/api/warehouse/imports/${id}`,
        method: 'PUT'
    }),

    // Delete import
    deleteImport: (id) => ({
        url: `${backendUrl}/api/warehouse/imports/${id}`,
        method: 'DELETE'
    }),

    // Get summary
    getSummary: {
        url: `${backendUrl}/api/warehouse/summary`,
        method: 'GET'
    }
};

export default warehouseAPI;
