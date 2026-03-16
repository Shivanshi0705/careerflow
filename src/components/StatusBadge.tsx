type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    Saved: "border border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
    Applied: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
    OA: "border border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
    Interview: "border border-violet-500/20 bg-violet-500/10 text-violet-300",
    "Final Interview":
      "border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
    Offer: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    Rejected: "border border-rose-500/20 bg-rose-500/10 text-rose-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "border border-zinc-500/20 bg-zinc-500/10 text-zinc-300"
      }`}
    >
      {status}
    </span>
  );
}