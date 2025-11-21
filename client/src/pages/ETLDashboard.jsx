import { useEffect, useState } from 'react';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import AxiosToastError from '@/utils/AxiosToastError';
import { RefreshCw } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function ETLDashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, analyticsRes] = await Promise.all([
                Axios({ ...SummaryApi.etl_status }),
                Axios({ ...SummaryApi.etl_analytics }),
            ]);

            if (summaryRes.data?.success) {
                setSummary(summaryRes.data.data);
            }

            if (analyticsRes.data?.success) {
                setAnalytics(analyticsRes.data.data);
            }

            setLastRefresh(new Date());
        } catch (err) {
            AxiosToastError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        if (!autoRefresh) return;

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    if (loading && !summary) {
        return <div className="p-4">Đang tải ETL status…</div>;
    }

    if (!summary) {
        return <div className="p-4 text-red-600">Không có dữ liệu ETL.</div>;
    }

    const { staging, dw, lastRunAt } = summary;

    // Chart data for Best Sellers
    const bestSellersChartData = analytics?.bestSellers
        ? {
              labels: analytics.bestSellers.map((item) => item.name),
              datasets: [
                  {
                      label: 'Số lượng bán',
                      data: analytics.bestSellers.map((item) => item.quantity),
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.6)',
                          'rgba(54, 162, 235, 0.6)',
                          'rgba(255, 206, 86, 0.6)',
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(153, 102, 255, 0.6)',
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                      ],
                      borderWidth: 1,
                  },
              ],
          }
        : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    ETL Dashboard – Tổng quan dữ liệu
                </h1>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>Auto-refresh (5s)</span>
                    </label>

                    <button
                        onClick={fetchData}
                        className="p-2 border rounded hover:bg-gray-100"
                        title="Refresh ngay"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? 'animate-spin' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>
                    Lần chạy ETL gần nhất:{' '}
                    {lastRunAt
                        ? new Date(lastRunAt).toLocaleString()
                        : 'Chưa có'}
                </span>
                <span className="text-xs">
                    • Cập nhật: {lastRefresh.toLocaleTimeString()}
                </span>
            </div>

            {/* Charts Section */}
            {analytics && (
                <div className="grid grid-cols-1 gap-6">
                    {/* Best Sellers Chart */}
                    <div className="border rounded-md p-4">
                        <h2 className="text-lg font-semibold mb-3">
                            Món bán chạy nhất (Top 3)
                        </h2>
                        <div className="h-64">
                            {bestSellersChartData ? (
                                <Bar
                                    data={bestSellersChartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <div className="text-gray-500 text-sm">
                                    Chưa có dữ liệu
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STAGING */}
            <section className="border rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">Staging</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="border rounded p-3">
                        <div className="font-medium">Users</div>
                        <div>{staging?.users ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">Products</div>
                        <div>{staging?.products ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">Orders</div>
                        <div>{staging?.orders ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">WH Imports</div>
                        <div>{staging?.wh_imports ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">WH Exports</div>
                        <div>{staging?.wh_exports ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium text-red-600">Errors</div>
                        <div>{staging?.errors ?? 0}</div>
                    </div>
                </div>
            </section>

            {/* DATA WAREHOUSE */}
            <section className="border rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">Data Warehouse</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="border rounded p-3">
                        <div className="font-medium">dim_customers</div>
                        <div>{dw?.dim_customers ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">dim_menu_items</div>
                        <div>{dw?.dim_menu_items ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">fact_order_items</div>
                        <div>{dw?.fact_order_items ?? 0}</div>
                    </div>
                    <div className="border rounded p-3">
                        <div className="font-medium">
                            fact_inventory_movement
                        </div>
                        <div>{dw?.fact_inventory_movement ?? 0}</div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ETLDashboard;
