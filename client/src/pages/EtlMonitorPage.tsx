import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ETLDashboard from './ETLDashboard';
import LogsViewer from './LogsViewer';
import { useState } from 'react';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '@/utils/AxiosToastError';
import { PlayCircle } from 'lucide-react';
import Loading from '@/components/Loading';

export default function EtlMonitorPage() {
    const [isRunning, setIsRunning] = useState(false);

    const handleRunEtl = async () => {
        try {
            setIsRunning(true);
            const response = await Axios({ ...SummaryApi.run_etl });

            if (response.data?.success) {
                toast.success(
                    response.data.message || 'ETL pipeline đã được khởi chạy!'
                );
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">ETL Monitor</h1>

                <Button
                    onClick={handleRunEtl}
                    disabled={isRunning}
                    className="flex items-center gap-2 bg-foreground"
                >
                    {isRunning ? (
                        <>
                            <Loading />
                            <span>Đang chạy...</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle className="h-4 w-4" />
                            <span>Run ETL Now</span>
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <ETLDashboard />
                </TabsContent>

                <TabsContent value="logs">
                    <LogsViewer />
                </TabsContent>
            </Tabs>
        </div>
    );
}
