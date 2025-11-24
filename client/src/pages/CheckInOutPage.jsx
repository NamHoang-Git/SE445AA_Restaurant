import React, { useState, useEffect } from 'react';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import AxiosToastError from '@/utils/AxiosToastError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CheckInOutPage = () => {
    const [myShifts, setMyShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [todayShift, setTodayShift] = useState(null);

    // Fetch my shifts
    const fetchMyShifts = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const startDate = new Date(today.setDate(today.getDate() - 7))
                .toISOString()
                .split('T')[0];
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            const response = await Axios({
                ...SummaryApi.get_my_shifts,
                url: `${SummaryApi.get_my_shifts.url}?startDate=${startDate}&endDate=${endDate}`,
            });

            if (response.data.success) {
                setMyShifts(response.data.data);

                // Find today's shift
                const todayStr = new Date().toISOString().split('T')[0];
                const shift = response.data.data.find(
                    (s) =>
                        new Date(s.date).toISOString().split('T')[0] ===
                        todayStr
                );
                setTodayShift(shift || null);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyShifts();
    }, []);

    // Handle check-in
    const handleCheckIn = async () => {
        if (!todayShift) {
            toast.error('Không tìm thấy ca làm việc hôm nay');
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.check_in,
                data: { shiftId: todayShift._id },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchMyShifts();
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    // Handle check-out
    const handleCheckOut = async () => {
        if (!todayShift) {
            toast.error('Không tìm thấy ca làm việc hôm nay');
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.check_out,
                data: { shiftId: todayShift._id },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchMyShifts();
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    // Get shift type label
    const getShiftTypeLabel = (type) => {
        const labels = {
            morning: 'Ca sáng',
            afternoon: 'Ca chiều',
            evening: 'Ca tối',
        };
        return labels[type] || type;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const badges = {
            scheduled: {
                label: 'Đã lên lịch',
                color: 'bg-blue-500',
                icon: Calendar,
            },
            completed: {
                label: 'Hoàn thành',
                color: 'bg-green-500',
                icon: CheckCircle2,
            },
            late: {
                label: 'Đi muộn',
                color: 'bg-yellow-500',
                icon: AlertCircle,
            },
            absent: { label: 'Vắng mặt', color: 'bg-red-500', icon: XCircle },
        };
        return badges[status] || badges.scheduled;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Today's Shift Card */}
            <Card className="mb-6 border-2 border-highlight">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Clock className="w-6 h-6 text-highlight" />
                        Ca làm việc hôm nay
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Đang tải...</p>
                    ) : todayShift ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Ca làm việc
                                    </p>
                                    <p className="font-semibold">
                                        {getShiftTypeLabel(
                                            todayShift.shiftType
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Giờ làm
                                    </p>
                                    <p className="font-semibold">
                                        {todayShift.startTime} -{' '}
                                        {todayShift.endTime}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Check-in
                                    </p>
                                    <p className="font-semibold">
                                        {todayShift.checkInTime
                                            ? new Date(
                                                  todayShift.checkInTime
                                              ).toLocaleTimeString('vi-VN')
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Check-out
                                    </p>
                                    <p className="font-semibold">
                                        {todayShift.checkOutTime
                                            ? new Date(
                                                  todayShift.checkOutTime
                                              ).toLocaleTimeString('vi-VN')
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">
                                    Trạng thái:
                                </p>
                                <Badge
                                    className={`${
                                        getStatusBadge(todayShift.status).color
                                    } text-white`}
                                >
                                    {getStatusBadge(todayShift.status).label}
                                </Badge>
                            </div>

                            <div className="flex gap-3">
                                {!todayShift.checkInTime && (
                                    <Button
                                        onClick={handleCheckIn}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Check-in
                                    </Button>
                                )}
                                {todayShift.checkInTime &&
                                    !todayShift.checkOutTime && (
                                        <Button
                                            onClick={handleCheckOut}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Check-out
                                        </Button>
                                    )}
                                {todayShift.checkOutTime && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold">
                                            Đã hoàn thành ca làm việc
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">
                                Bạn không có ca làm việc hôm nay
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Shift History */}
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử ca làm việc</CardTitle>
                </CardHeader>
                <CardContent>
                    {myShifts.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                            Chưa có lịch sử ca làm việc
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {myShifts.map((shift) => {
                                const StatusIcon = getStatusBadge(
                                    shift.status
                                ).icon;
                                return (
                                    <div
                                        key={shift._id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <StatusIcon
                                                className={`w-5 h-5 ${
                                                    shift.status === 'completed'
                                                        ? 'text-green-500'
                                                        : shift.status ===
                                                          'late'
                                                        ? 'text-yellow-500'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                            <div>
                                                <p className="font-semibold">
                                                    {new Date(
                                                        shift.date
                                                    ).toLocaleDateString(
                                                        'vi-VN'
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {getShiftTypeLabel(
                                                        shift.shiftType
                                                    )}{' '}
                                                    ({shift.startTime} -{' '}
                                                    {shift.endTime})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                className={`${
                                                    getStatusBadge(shift.status)
                                                        .color
                                                } text-white`}
                                            >
                                                {
                                                    getStatusBadge(shift.status)
                                                        .label
                                                }
                                            </Badge>
                                            {shift.actualHours > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {shift.actualHours} giờ
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckInOutPage;
