import { Alert } from '../components/ui';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-8 py-16 lg:px-12 lg:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-12 leading-tight">
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
