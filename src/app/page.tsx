export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to CareerFlow</h1>

      <p className="text-slate-600">
        Track your internship applications, manage recruiter contacts, and stay
        organized during recruiting season.
      </p>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Applications</h2>
          <p className="text-sm text-slate-500">
            Track internships you've applied to.
          </p>
        </div>

        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Contacts</h2>
          <p className="text-sm text-slate-500">
            Manage recruiter and networking contacts.
          </p>
        </div>

        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Dashboard</h2>
          <p className="text-sm text-slate-500">
            View application stats and progress.
          </p>
        </div>
      </div>
    </div>
  );
}