import { UnsubscribePage } from '../../../components/ui/UnsubscribePage';

interface UnsubscribePageProps {
  params: {
    token: string;
  };
}

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

export default function UnsubscribeTokenPage({ params }: UnsubscribePageProps) {
  return <UnsubscribePage token={params.token} />;
}

// eslint-disable-next-line no-unused-vars
export async function generateMetadata({
  params: _params,
}: UnsubscribePageProps) {
  return {
    title: 'Unsubscribe - GitHub Trending Summarizer',
    description: 'Unsubscribe from the GitHub Trending Summarizer newsletter',
  };
}
