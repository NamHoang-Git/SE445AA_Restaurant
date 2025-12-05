// pages/WarehouseImports.jsx - Warehouse imports management page
import { useState, useEffect } from 'react';
import Axios from '@/utils/Axios';
import warehouseAPI from '@/common/warehouse_api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function WarehouseImports() {
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingImport, setEditingImport] = useState(null);
    const [formData, setFormData] = useState({
        product_id: '',
        product_name_raw: '',
        quantity: '',
        unit_cost: '',
        supplier: '',
        warehouse_location: 'WH-MAIN',
        notes: '',
    });

    useEffect(() => {
        fetchImports();
    }, []);

    const fetchImports = async () => {
        try {
            setLoading(true);
            const response = await Axios(warehouseAPI.getImports);
            if (response.data.success) {
                setImports(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch imports');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const apiConfig = editingImport
                ? warehouseAPI.updateImport(editingImport._id)
                : warehouseAPI.createImport;

            const response = await Axios({
                ...apiConfig,
                data: formData,
            });

            if (response.data.success) {
                toast.success(
                    editingImport ? 'Import updated!' : 'Import created!'
                );
                fetchImports();
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (importItem) => {
        setEditingImport(importItem);
        setFormData({
            product_id: importItem.product_id,
            product_name_raw: importItem.product_name_raw,
            quantity: importItem.quantity,
            unit_cost: importItem.unit_cost,
            supplier: importItem.supplier || '',
            warehouse_location: importItem.warehouse_location || 'WH-MAIN',
            notes: importItem.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this import?')) return;

        try {
            const response = await Axios(warehouseAPI.deleteImport(id));
            if (response.data.success) {
                toast.success('Import deleted!');
                fetchImports();
            }
        } catch (error) {
            toast.error('Failed to delete import');
        }
    };

    const resetForm = () => {
        setFormData({
            product_id: '',
            product_name_raw: '',
            quantity: '',
            unit_cost: '',
            supplier: '',
            warehouse_location: 'WH-MAIN',
            notes: '',
        });
        setEditingImport(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                Loading...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Warehouse Imports
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage warehouse import records
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    New Import
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingImport ? 'Edit Import' : 'New Import'}
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Product ID *
                            </label>
                            <input
                                type="text"
                                value={formData.product_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        product_id: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                required
                                placeholder="e.g., RICE01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.product_name_raw}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        product_name_raw: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                required
                                placeholder="e.g., Rice New"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        quantity: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                required
                                min="0"
                                placeholder="e.g., 200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Unit Cost (VND) *
                            </label>
                            <input
                                type="number"
                                value={formData.unit_cost}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unit_cost: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                required
                                min="0"
                                placeholder="e.g., 35000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Supplier
                            </label>
                            <input
                                type="text"
                                value={formData.supplier}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        supplier: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                placeholder="e.g., Rice Supplier A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Warehouse Location
                            </label>
                            <select
                                value={formData.warehouse_location}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        warehouse_location: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="WH-MAIN">WH-MAIN</option>
                                <option value="WH-DRINK">WH-DRINK</option>
                                <option value="WH-FRESH">WH-FRESH</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                                rows="2"
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div className="col-span-2 flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                {editingImport ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Product ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Unit Cost
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Total Cost
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Supplier
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {imports.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No imports found. Click "New Import" to add
                                    one.
                                </td>
                            </tr>
                        ) : (
                            imports.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {item.product_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {item.product_name_raw}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {item.unit_cost.toLocaleString()} VND
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">
                                        {item.total_cost.toLocaleString()} VND
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {item.supplier || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(
                                            item.import_date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item._id)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
