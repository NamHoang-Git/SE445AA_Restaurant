// client/src/pages/AnalyticsTab.jsx
import { useState, useEffect } from 'react';
import Axios from '@/utils/Axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import Loading from '@/components/Loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsTab() {
    const [loading, setLoading] = useState(true);
    const [profitSummary, setProfitSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [integrationStatus, setIntegrationStatus] = useState(null);
    const [qualityMetrics, setQualityMetrics] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch all analytics data
            const [summaryRes, productsRes, statusRes, qualityRes] =
                await Promise.all([
                    Axios({
                        url: '/api/analytics/profit/summary',
                        method: 'get',
                    }),
                    Axios({
                        url: '/api/analytics/profit/top-products',
                        method: 'get',
                        params: { limit: 5 },
                    }),
                    Axios({
                        url: '/api/analytics/integration/status',
                        method: 'get',
                    }),
                    Axios({
                        url: '/api/analytics/quality/metrics',
                        method: 'get',
                    }),
                ]);

            if (summaryRes.data?.success) {
                setProfitSummary(summaryRes.data.data);
            }

            if (productsRes.data?.success) {
                setTopProducts(productsRes.data.data);
            }

            if (statusRes.data?.success) {
                setIntegrationStatus(statusRes.data.data);
            }

            if (qualityRes.data?.success) {
                setQualityMetrics(qualityRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loading />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="py-6">
                    <CardHeader className="pb-2">
                        <CardDescription>Sản phẩm đã phân tích</CardDescription>
                        <CardTitle className="text-3xl">
                            {profitSummary?.products_analyzed || 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Có dữ liệu chi phí kho
                        </p>
                    </CardContent>
                </Card>

                <Card className="py-6">
                    <CardHeader className="pb-2">
                        <CardDescription>Tỷ suất lợi nhuận</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {profitSummary?.overall_profit_margin?.toFixed(1) ||
                                0}
                            %
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Trung bình tất cả sản phẩm
                        </p>
                    </CardContent>
                </Card>

                <Card className="py-6">
                    <CardHeader className="pb-2">
                        <CardDescription>Chất lượng dữ liệu</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                            {qualityMetrics?.quality_score?.toFixed(1) || 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {qualityMetrics?.status || 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="py-6">
                    <CardHeader className="pb-2">
                        <CardDescription>Tỷ lệ tích hợp</CardDescription>
                        <CardTitle className="text-3xl text-purple-600">
                            {integrationStatus?.merge_success_rate?.toFixed(
                                1
                            ) || 0}
                            %
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Sản phẩm có dữ liệu kho
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Margin Chart */}
                <Card className="py-6">
                    <CardHeader>
                        <CardTitle>
                            Top 5 Sản phẩm theo Tỷ suất Lợi nhuận
                        </CardTitle>
                        <CardDescription>
                            Sản phẩm có tỷ suất lợi nhuận cao nhất
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="profit_margin_percent"
                                    fill="#8884d8"
                                    name="Tỷ suất lợi nhuận %"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Integration Status Pie Chart */}
                <Card className="py-6">
                    <CardHeader>
                        <CardTitle>Trạng thái Tích hợp Dữ liệu</CardTitle>
                        <CardDescription>
                            Sản phẩm có/không có dữ liệu kho
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'Có dữ liệu kho',
                                            value:
                                                integrationStatus?.products_with_warehouse_data ||
                                                0,
                                        },
                                        {
                                            name: 'Không có dữ liệu kho',
                                            value:
                                                (integrationStatus?.total_products ||
                                                    0) -
                                                (integrationStatus?.products_with_warehouse_data ||
                                                    0),
                                        },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(
                                            0
                                        )}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[0, 1].map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Data Quality Details */}
            <Card className="py-6">
                <CardHeader>
                    <CardTitle>Chỉ số Chất lượng Dữ liệu</CardTitle>
                    <CardDescription>
                        Thống kê chất lượng dữ liệu ETL pipeline
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Tổng số bản ghi
                            </p>
                            <p className="text-2xl font-bold">
                                {qualityMetrics?.total_records_processed || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Lỗi</p>
                            <p className="text-2xl font-bold text-red-600">
                                {qualityMetrics?.total_errors || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Tỷ lệ lỗi
                            </p>
                            <p className="text-2xl font-bold">
                                {qualityMetrics?.error_rate?.toFixed(2) || 0}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Bản ghi đã làm sạch
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {qualityMetrics?.cleaned_records || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Integration Details */}
            <Card className="py-6">
                <CardHeader>
                    <CardTitle>Thống kê Tích hợp</CardTitle>
                    <CardDescription>
                        Số lượng bản ghi trong kho dữ liệu
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Khách hàng
                            </p>
                            <p className="text-2xl font-bold">
                                {integrationStatus?.dw_counts?.customers || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Món ăn
                            </p>
                            <p className="text-2xl font-bold">
                                {integrationStatus?.dw_counts?.menu_items || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Đơn hàng
                            </p>
                            <p className="text-2xl font-bold">
                                {integrationStatus?.dw_counts?.order_items || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
