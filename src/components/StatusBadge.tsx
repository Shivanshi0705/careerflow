type Props = {
    status: string;
  };
  
  export default function StatusBadge({ status }: Props) {
    const styles: Record<string, string> = {
      Applied: "bg-blue-500/20 text-blue-400",
      Interview: "bg-yellow-500/20 text-yellow-400",
      Offer: "bg-green-500/20 text-green-400",
      Rejected: "bg-red-500/20 text-red-400",
      Saved: "bg-slate-500/20 text-slate-400",
    };
  
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          styles[status] || "bg-slate-500/20 text-slate-400"
        }`}
      >
        {status}
      </span>
    );
  }