import { Alert } from '../components/ui';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-6 py-12 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Search Repositories
        </h1>
        <Alert variant="info" title="Coming Soon">
          Advanced search functionality will be implemented in the next phase.
          For now, you can use the search feature on the main trending page.
        </Alert>
      </div>
    </div>
  );
}
