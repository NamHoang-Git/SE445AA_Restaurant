import React, { useState, useEffect } from 'react';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import AxiosToastError from '@/utils/AxiosToastError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const MyPerformancePage = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Fetch performance
    const fetchPerformance = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_my_performance,
                url: `${SummaryApi.get_my_performance.url}?month=${selectedMonth}&year=${selectedYear}`,
            });

            if (response.data.success) {
                setPerformance(response.data.data);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    // Generate month options
    const months = [
        { value: 1, label: 'Tháng 1' },
        { value: 2, label: 'Tháng 2' },
        { value: 3, label: 'Tháng 3' },
        { value: 4, label: 'Tháng 4' },
        { value: 5, label: 'Tháng 5' },
        { value: 6, label: 'Tháng 6' },
        { value: 7, label: 'Tháng 7' },
        { value: 8, label: 'Tháng 8' },
        { value: 9, label: 'Tháng 9' },
        { value: 10, label: 'Tháng 10' },
        { value: 11, label: 'Tháng 11' },
        { value: 12, label: 'Tháng 12' },
    ];

    const StatCard = ({ icon: IconComponent, title, value, color }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">{title}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <IconComponent className={`w-10 h-10 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-highlight" />
                            Hiệu suất làm việc của tôi
                        </CardTitle>
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(parseInt(e.target.value))
                                }
                                className="border rounded px-3 py-2"
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(parseInt(e.target.value))
                                }
                                className="border rounded px-3 py-2"
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {loading ? (
                <div className="text-center py-8">
                    <p>Đang tải...</p>
                </div>
            ) : performance ? (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Clock}
                            title="Tổng giờ làm"
                            value={`${performance.totalHours || 0}h`}
                            color="text-blue-600"
                        />
                        <StatCard
                            icon={Users}
                            title="Số ca làm việc"
                            value={`${performance.completedShifts || 0}/${
                                performance.totalShifts || 0
                            }`}
                            color="text-green-600"
                        />
                        <StatCard
                            icon={TrendingUp}
                            title="Đơn hàng xử lý"
                            value={performance.ordersProcessed || 0}
                            color="text-purple-600"
                        />
                        <StatCard
                            icon={BarChart3}
                            title="Món ăn nấu"
                            value={performance.dishesCooked || 0}
                            color="text-orange-600"
                        />
                    </div>

                    {/* Attendance Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết chuyên cần</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Đi muộn
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-yellow-500 text-white">
                                            {performance.lateCheckIns || 0} lần
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Vắng mặt
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-500 text-white">
                                            {performance.absences || 0} lần
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Tỷ lệ hoàn thành
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500 text-white">
                                            {performance.totalShifts > 0
                                                ? Math.round(
                                                      (performance.completedShifts /
                                                          performance.totalShifts) *
                                                          100
                                                  )
                                                : 0}
                                            %
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Note */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <p className="text-sm text-blue-800">
                                <strong>Ghi chú:</strong> Dữ liệu hiệu suất được
                                cập nhật tự động sau mỗi ca làm việc. Hãy duy
                                trì chuyên cần tốt để đạt hiệu suất cao nhất!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                            Chưa có dữ liệu hiệu suất cho tháng này
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MyPerformancePage;
