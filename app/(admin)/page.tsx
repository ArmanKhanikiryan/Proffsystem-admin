import Panel from '@/components/admin/Panel';
import { dehydrate, QueryClient } from '@tanstack/react-query';

export default async function AdminPage() {
    const queryClient = new QueryClient();

    const dehydratedState = dehydrate(queryClient);

    return <Panel dehydratedState={dehydratedState} />;
}
