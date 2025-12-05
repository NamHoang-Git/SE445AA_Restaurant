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
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Products Analyzed</CardDescription>
                        <CardTitle className="text-3xl">
                            {profitSummary?.products_analyzed || 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            With warehouse cost data
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Profit Margin</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {profitSummary?.overall_profit_margin?.toFixed(1) ||
                                0}
                            %
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Average across all products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Data Quality</CardDescription>
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

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Integration Rate</CardDescription>
                        <CardTitle className="text-3xl text-purple-600">
                            {integrationStatus?.merge_success_rate?.toFixed(
                                1
                            ) || 0}
                            %
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Products with warehouse data
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Margin Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Products by Profit Margin</CardTitle>
                        <CardDescription>
                            Products with highest profit margins
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
                                    name="Profit Margin %"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Integration Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Integration Status</CardTitle>
                        <CardDescription>
                            Products with vs without warehouse data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'With Warehouse Data',
                                            value:
                                                integrationStatus?.products_with_warehouse_data ||
                                                0,
                                        },
                                        {
                                            name: 'Without Warehouse Data',
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
            <Card>
                <CardHeader>
                    <CardTitle>Data Quality Metrics</CardTitle>
                    <CardDescription>
                        ETL pipeline data quality statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Records
                            </p>
                            <p className="text-2xl font-bold">
                                {qualityMetrics?.total_records_processed || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Errors
                            </p>
                            <p className="text-2xl font-bold text-red-600">
                                {qualityMetrics?.total_errors || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Error Rate
                            </p>
                            <p className="text-2xl font-bold">
                                {qualityMetrics?.error_rate?.toFixed(2) || 0}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Cleaned Records
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {qualityMetrics?.cleaned_records || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Integration Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Integration Statistics</CardTitle>
                    <CardDescription>
                        Data warehouse record counts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Customers
                            </p>
                            <p className="text-2xl font-bold">
                                {integrationStatus?.dw_counts?.customers || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Menu Items
                            </p>
                            <p className="text-2xl font-bold">
                                {integrationStatus?.dw_counts?.menu_items || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Order Items
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
