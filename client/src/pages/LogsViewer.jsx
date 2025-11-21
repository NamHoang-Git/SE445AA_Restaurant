// client/src/pages/LogsViewer.jsx
import { useEffect, useMemo, useState } from 'react';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import AxiosToastError from '@/utils/AxiosToastError';

const SOURCES = [
    { key: 'all', label: 'Tất cả' },
    { key: 'consumer', label: 'Consumer / Queue' },
    { key: 'etl', label: 'ETL Script' },
    { key: 'analytics', label: 'Analytics / Report' },
];

function LogsViewer() {
    const [logs, setLogs] = useState({
        consumer: [],
        etl: [],
        analytics: [],
    });
    const [loading, setLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await Axios({ ...SummaryApi.etl_logs });

            if (res.data?.success) {
                setLogs({
                    consumer: res.data.data.consumer || [],
                    etl: res.data.data.etl || [],
                    analytics: res.data.data.analytics || [],
                });
            } else {
                console.error('Invalid logs response', res.data);
            }
        } catch (err) {
            AxiosToastError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        if (!autoRefresh) return;

        const id = setInterval(fetchLogs, 5000); // 5s refresh
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]);

    const displayedLogs = useMemo(() => {
        if (selectedSource === 'all') {
            return [
                ...logs.consumer.map((l) => ({ source: 'consumer', line: l })),
                ...logs.etl.map((l) => ({ source: 'etl', line: l })),
                ...logs.analytics.map((l) => ({
                    source: 'analytics',
                    line: l,
                })),
            ];
        }

        return (logs[selectedSource] || []).map((l) => ({
            source: selectedSource,
            line: l,
        }));
    }, [logs, selectedSource]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">ETL Logs Viewer</h1>

                <div className="flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>Tự động refresh (5s)</span>
                    </label>
                    <button
                        type="button"
                        onClick={fetchLogs}
                        className="border px-3 py-1 rounded"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter theo nguồn log */}
            <div className="flex gap-2 text-sm flex-wrap">
                {SOURCES.map((s) => (
                    <button
                        key={s.key}
                        type="button"
                        onClick={() => setSelectedSource(s.key)}
                        className={`px-3 py-1 rounded border ${
                            selectedSource === s.key
                                ? 'bg-gray-200'
                                : 'bg-white'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Khu vực hiển thị log */}
            <div className="border rounded-md p-3 bg-black text-green-200 text-xs font-mono h-[420px] overflow-auto">
                {loading && (
                    <div className="mb-2 text-yellow-200">Đang tải log…</div>
                )}

                {displayedLogs.length === 0 && !loading && (
                    <div className="text-gray-400">
                        Chưa có log nào cho nguồn đã chọn.
                    </div>
                )}

                {displayedLogs.map((item, idx) => {
                    // Color coding based on source
                    let sourceColor = 'text-gray-400';
                    let textColor = 'text-green-200';

                    // Check for error patterns
                    const isError =
                        item.line.includes('ERROR') ||
                        item.line.includes('FAILED') ||
                        item.line.includes('ETL-ERROR') ||
                        item.line.includes('CRASH');

                    if (isError) {
                        sourceColor = 'text-red-400';
                        textColor = 'text-red-300';
                    } else if (item.source === 'consumer') {
                        sourceColor = 'text-cyan-400';
                        textColor = 'text-cyan-200';
                    } else if (item.source === 'etl') {
                        sourceColor = 'text-yellow-400';
                        textColor = 'text-yellow-200';
                    } else if (item.source === 'analytics') {
                        sourceColor = 'text-green-400';
                        textColor = 'text-green-200';
                    }

                    return (
                        <div key={idx} className="whitespace-pre-wrap">
                            <span className={sourceColor}>
                                [{item.source}]{' '}
                            </span>
                            <span className={textColor}>{item.line}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LogsViewer;
