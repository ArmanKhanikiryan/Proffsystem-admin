import Panel from '@/components/admin/Panel';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import {fetchElements, fetchOrders} from '@/lib/api';

export default async function AdminPage() {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['elements'],
            queryFn: fetchElements,
        }),
        queryClient.prefetchQuery({
            queryKey: ['orders'],
            queryFn: fetchOrders,
        }),
    ]);
    const dehydratedState = dehydrate(queryClient);

    return <Panel dehydratedState={dehydratedState} />;
}
