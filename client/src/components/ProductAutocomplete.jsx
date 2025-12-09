// components/ProductAutocomplete.jsx - Autocomplete component for product selection
import { useState, useEffect, useRef } from 'react';
import Axios from '@/utils/Axios';
import { Search, X } from 'lucide-react';

export default function ProductAutocomplete({ value, onChange, onSelect }) {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch products from CS445K
    useEffect(() => {
        fetchProducts();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                method: 'GET',
                url: '/api/products',
            });

            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on search term
    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle product selection from dropdown
    const handleSelectProduct = (product) => {
        setSearchTerm(product.name);
        setShowDropdown(false);

        // Callback to parent with full product data
        if (onSelect) {
            onSelect({
                product_id: product._id,
                product_name: product.name,
                price: product.price,
            });
        }
    };

    // Handle manual input
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);

        // Callback to parent with manual input
        if (onChange) {
            onChange(value);
        }
    };

    // Clear search
    const handleClear = () => {
        setSearchTerm('');
        setShowDropdown(false);
        if (onChange) {
            onChange('');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-1">Sản phẩm *</label>

            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>

                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Tìm kiếm hoặc nhập tên sản phẩm..."
                    className="w-full border rounded px-3 py-2 pl-10 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            Đang tải...
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => handleSelectProduct(product)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                            >
                                <div className="font-medium text-gray-900">
                                    {product.name}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex justify-between">
                                    <span>
                                        ID: {product._id.substring(0, 8)}...
                                    </span>
                                    <span className="font-semibold text-blue-600">
                                        {product.price?.toLocaleString()} VND
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-gray-500 mt-1">
                💡 Chọn từ danh sách hoặc nhập thủ công. Tên sẽ tự động đồng bộ
                khi chạy ETL.
            </p>
        </div>
    );
}
