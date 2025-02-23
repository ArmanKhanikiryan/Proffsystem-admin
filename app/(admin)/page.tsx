import Panel from '@/components/admin/Panel';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { fetchElements } from '@/lib/api';

export default async function AdminPage() {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['elements'],
        queryFn: fetchElements,
    });
    const dehydratedState = dehydrate(queryClient);

    return <Panel dehydratedState={dehydratedState} />;
}
