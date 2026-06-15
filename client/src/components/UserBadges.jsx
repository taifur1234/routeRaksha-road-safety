function UserBadges({ badges = [] }) {
  if (!badges.length) {
    return (
      <p className="rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-4 py-3 text-sm font-bold text-[#46623d]">
        No badges earned yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.key}
          title={badge.earnedAt ? `Earned ${new Date(badge.earnedAt).toLocaleDateString()}` : ""}
          className="rounded-full border border-[#9cec6d] bg-[#efffe8] px-3 py-1.5 text-xs font-black text-[#173a0b]"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export default UserBadges;
