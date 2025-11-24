import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import AxiosToastError from '@/utils/AxiosToastError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Search, Filter } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import toast from 'react-hot-toast';

const EmployeeManagementPage = () => {
    const user = useSelector((state) => state.user);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Fetch all employees
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_all_employees,
            });

            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter employees
    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
        const matchesStatus =
            statusFilter === 'all' || emp.employeeStatus === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Handle delete employee
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.delete_employee,
                url: `${SummaryApi.delete_employee.url}/${id}`,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchEmployees();
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    // Handle edit employee
    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setShowEditModal(true);
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        const colors = {
            ADMIN: 'bg-red-500',
            MANAGER: 'bg-blue-500',
            WAITER: 'bg-green-500',
            CHEF: 'bg-orange-500',
            CASHIER: 'bg-purple-500',
        };
        return colors[role] || 'bg-gray-500';
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        const colors = {
            active: 'bg-green-500',
            inactive: 'bg-gray-500',
            on_leave: 'bg-yellow-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-highlight" />
                            <CardTitle className="text-2xl">
                                Quản lý Nhân viên
                            </CardTitle>
                        </div>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-highlight hover:bg-highlight/90"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Thêm nhân viên
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Lọc theo vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả vai trò
                                </SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MANAGER">Manager</SelectItem>
                                <SelectItem value="WAITER">Waiter</SelectItem>
                                <SelectItem value="CHEF">Chef</SelectItem>
                                <SelectItem value="CASHIER">Cashier</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả trạng thái
                                </SelectItem>
                                <SelectItem value="active">
                                    Đang làm việc
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Đã nghỉ việc
                                </SelectItem>
                                <SelectItem value="on_leave">
                                    Nghỉ phép
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Employee Table */}
                    {loading ? (
                        <div className="text-center py-8">
                            <p>Đang tải...</p>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Không tìm thấy nhân viên nào
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Chức vụ</TableHead>
                                        <TableHead>Ngày vào làm</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">
                                            Hành động
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow key={employee._id}>
                                            <TableCell className="font-medium">
                                                {employee.name}
                                            </TableCell>
                                            <TableCell>
                                                {employee.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getRoleBadgeColor(
                                                        employee.role
                                                    )} text-white`}
                                                >
                                                    {employee.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {employee.position || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {employee.hireDate
                                                    ? new Date(
                                                          employee.hireDate
                                                      ).toLocaleDateString(
                                                          'vi-VN'
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getStatusBadgeColor(
                                                        employee.employeeStatus
                                                    )} text-white`}
                                                >
                                                    {employee.employeeStatus ===
                                                    'active'
                                                        ? 'Đang làm'
                                                        : employee.employeeStatus ===
                                                          'inactive'
                                                        ? 'Đã nghỉ'
                                                        : 'Nghỉ phép'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(employee)
                                                        }
                                                    >
                                                        Sửa
                                                    </Button>
                                                    {user?.role === 'ADMIN' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    employee._id
                                                                )
                                                            }
                                                        >
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="mt-4 text-sm text-gray-600">
                        Hiển thị {filteredEmployees.length} / {employees.length}{' '}
                        nhân viên
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {showAddModal && (
                <AddEmployeeModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchEmployees();
                    }}
                />
            )}

            {showEditModal && selectedEmployee && (
                <EditEmployeeModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                        fetchEmployees();
                    }}
                />
            )}
        </div>
    );
};

export default EmployeeManagementPage;
