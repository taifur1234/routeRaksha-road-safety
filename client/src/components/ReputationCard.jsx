import UserBadges from "./UserBadges";

function ReputationCard({ reputation, isLoading = false, error = "" }) {
  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
        {error}
      </p>
    );
  }

  if (!reputation) {
    return null;
  }

  const metrics = [
    ["Reputation Score", reputation.reputationPoints],
    ["Trust Level", reputation.trustLevel],
    ["Reports Submitted", reputation.reportsSubmitted],
    ["Approval Rate", `${reputation.approvalRate}%`],
  ];

  return (
    <section className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_45px_rgba(16,47,0,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">Reporter reputation</p>
          <h2 className="mt-2 text-2xl font-black text-[#173a0b]">{reputation.name || "Your profile"}</h2>
        </div>
        <span className="rounded-full border border-[#9cec6d] bg-[#efffe8] px-4 py-2 text-sm font-black text-[#173a0b]">
          {reputation.trustLevel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[#f7faf6] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#78936d]">{label}</p>
            <p className="mt-2 text-xl font-black text-[#173a0b]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-black text-[#173a0b]">Badges</p>
        <UserBadges badges={reputation.badges} />
      </div>
    </section>
  );
}

export default ReputationCard;
