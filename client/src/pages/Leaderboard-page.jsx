import { useEffect, useMemo, useState } from "react";
import UserBadges from "../components/UserBadges";
import UserAvatar from "../components/UserAvatar";
import { getLeaderboard } from "../utils/reputationApi";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    medal: (
      <>
        <path d="m7.5 2 4.5 7 4.5-7" />
        <path d="M8.5 2h7" />
        <circle cx="12" cy="15" r="6" />
        <path d="m10.5 15 1 1 2.5-3" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M12 19h3.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H12" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12.5 11 14l4-4" />
      </>
    ),
    star: (
      <>
        <path d="m12 2 3 6.1 6.7 1-4.8 4.7 1.1 6.6-6-3.1-6 3.1 1.1-6.6-4.8-4.7 6.7-1z" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
        <path d="M17 6h3a2 2 0 0 1-2 4h-1" />
        <path d="M7 6H4a2 2 0 0 0 2 4h1" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}

function getRankTheme(rank) {
  if (rank === 1) {
    return {
      accent: "from-[#f3b544] to-[#ffd98a]",
      border: "border-[#f3b544]",
      icon: "text-[#8a5a00]",
      label: "Champion",
      shadow: "shadow-[0_28px_70px_rgba(243,181,68,0.24)]",
    };
  }

  if (rank === 2) {
    return {
      accent: "from-[#dce8e5] to-white",
      border: "border-[#d9e3e1]",
      icon: "text-[#637083]",
      label: "Navigator",
      shadow: "shadow-[0_24px_60px_rgba(99,112,131,0.16)]",
    };
  }

  return {
    accent: "from-[#f6b58b] to-[#ffe0c7]",
    border: "border-[#f6b58b]",
    icon: "text-[#9b4b15]",
    label: "Sentinel",
    shadow: "shadow-[0_24px_60px_rgba(246,181,139,0.18)]",
  };
}

function PodiumCard({ rank, user }) {
  const theme = getRankTheme(rank);
  const approvalRate = Number(user.approvalRate || 0);

  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-white p-5 ${theme.border} ${theme.shadow} ${
        rank === 1 ? "lg:-mt-8 lg:min-h-[22rem]" : "lg:min-h-[19rem]"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${theme.accent} opacity-85`} />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-full border border-white/70 bg-white/70 backdrop-blur">
            <Icon name={rank === 1 ? "trophy" : "medal"} className={`size-6 ${theme.icon}`} strokeWidth={2.4} />
          </span>
          <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-black text-[#173a0b]">
            #{rank} {theme.label}
          </span>
        </div>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <UserAvatar
              user={user}
              className="size-16"
              fallbackClassName="border-4 border-white shadow-[0_16px_35px_rgba(16,24,32,0.18)]"
              imageClassName="border-4 border-white shadow-[0_16px_35px_rgba(16,24,32,0.18)]"
              textClassName="text-xl"
            />
            <h2 className="mt-4 truncate text-2xl font-black text-[#173a0b]">{user.name}</h2>
            <p className="mt-1 text-sm font-bold text-[#46623d]">{user.trustLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-[#173a0b]">{user.reputationPoints}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#78936d]">points</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Approved", user.approvedReports],
            ["Submitted", user.reportsSubmitted],
            ["Rate", `${approvalRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#f7faf6] p-3 text-center">
              <p className="text-lg font-black text-[#173a0b]">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#78936d]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eaf2ef]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#18a999] to-[#7ce7b2]"
            style={{ width: `${Math.min(100, Math.max(0, approvalRate))}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function RankRow({ rank, user }) {
  const approvalRate = Number(user.approvalRate || 0);
  const isTopRank = rank <= 3;

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-lg border border-[#d8e5d3] bg-white p-4 shadow-[0_12px_32px_rgba(16,24,32,0.06)] transition hover:-translate-y-0.5 hover:border-[#18a999]/40 hover:shadow-[0_20px_55px_rgba(16,24,32,0.1)]">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-black ${
              isTopRank ? "bg-[#101820] text-white" : "bg-[#f7faf6] text-[#173a0b]"
            }`}
          >
            #{rank}
          </span>
          <UserAvatar
            user={user}
            className="size-11 shrink-0"
            fallbackClassName="shadow-sm"
            imageClassName="shadow-sm"
            textClassName="text-sm"
          />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-[#173a0b]">{user.name}</h2>
            <p className="mt-1 truncate text-sm font-bold text-[#46623d]">{user.trustLevel}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-3 py-1 text-xs font-black text-[#46623d]">
          Rank
        </span>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-3 gap-2">
        {[
          ["Points", user.reputationPoints],
          ["Approved", user.approvedReports],
          ["Submitted", user.reportsSubmitted],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-center">
            <p className="text-base font-black text-[#173a0b]">{value}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#78936d]">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#d8e5d3] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#78936d]">
            Approval
          </p>
          <p className="text-xs font-black text-[#173a0b]">{approvalRate}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eaf2ef]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#18a999] to-[#7ce7b2]"
            style={{ width: `${Math.min(100, Math.max(0, approvalRate))}%` }}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-[#d8e5d3] pt-4">
        <UserBadges badges={user.badges} />
      </div>
    </article>
  );
}

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("reputationPoints");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getLeaderboard({ page: 1, limit: 10, search, sortBy })
      .then((data) => {
        if (isMounted) {
          setUsers(data.users || []);
          setPagination(data.pagination || null);
          setError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Could not load leaderboard.");
          setUsers([]);
          setPagination(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [search, sortBy]);

  const startRank = 0;
  const topUsers = users.slice(0, 3);
  const summary = useMemo(() => {
    const totals = users.reduce(
      (acc, user) => ({
        approved: acc.approved + Number(user.approvedReports || 0),
        points: acc.points + Number(user.reputationPoints || 0),
        submitted: acc.submitted + Number(user.reportsSubmitted || 0),
      }),
      { approved: 0, points: 0, submitted: 0 },
    );
    const averageApproval = users.length
      ? Math.round(users.reduce((sum, user) => sum + Number(user.approvalRate || 0), 0) / users.length)
      : 0;

    return { ...totals, averageApproval };
  }, [users]);

  return (
    <main className="motion-page min-h-[calc(100vh-4.75rem)] overflow-x-hidden bg-[#fbfcfa] px-4 py-10 text-[#173a0b] sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl min-w-0">
        <section className="relative overflow-hidden rounded-lg bg-[#101820] p-6 text-white shadow-[0_30px_90px_rgba(16,24,32,0.22)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 rr-grid opacity-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(124,231,178,0.24),transparent_25rem),linear-gradient(135deg,rgba(16,24,32,0.98),rgba(15,61,52,0.88))]" />

          <div className="relative grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#baf7da]">
                <Icon name="trophy" className="size-4" strokeWidth={2.4} />
                Community leaderboard
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl">
                Safety contributors who make routes smarter.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#dce8e5]">
                Rank reporters by reputation, approved blackspot reports, and trust signals that improve RouteRaksha for everyone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Points tracked", summary.points],
                ["Approved reports", summary.approved],
                ["Average approval", `${summary.averageApproval}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-8 w-[calc(100%-1rem)] max-w-6xl rounded-lg border border-[#d8e5d3] bg-white/92 p-3 shadow-[0_24px_70px_rgba(16,24,32,0.12)] backdrop-blur sm:w-full sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#78936d]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search reporters by name"
                className="min-h-12 w-full rounded-full border border-[#cddcc7] bg-white pl-11 pr-4 text-sm font-bold outline-none"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                }}
                className="min-h-12 rounded-full border border-[#cddcc7] bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="reputationPoints">Sort by reputation</option>
                <option value="approvedReports">Sort by approved reports</option>
                <option value="reportsSubmitted">Sort by submitted reports</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSortBy("reputationPoints");
                }}
                className="min-h-12 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-5 text-sm font-black text-[#173a0b]"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        {!isLoading && topUsers.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#18a999]">
                  Hall of safety
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#173a0b]">
                  Top contributors
                </h2>
              </div>
              <p className="text-sm font-bold text-[#46623d]">
                Showing top {Math.min(10, pagination?.total || users.length)} contributors
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 lg:items-end">
              {topUsers.map((user, index) => (
                <PodiumCard key={user.userId} rank={startRank + index + 1} user={user} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-[#173a0b]">Contributor rankings</h2>
            <span className="rounded-full border border-[#d8e5d3] bg-white px-4 py-2 text-xs font-black text-[#46623d]">
              Top {users.length} of {pagination?.total || users.length} reporters
            </span>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {!isLoading &&
              users.map((user, index) => {
                const rank = startRank + index + 1;
                return <RankRow key={user.userId} rank={rank} user={user} />;
              })}

            {!isLoading && !users.length && (
              <div className="rounded-lg border border-[#d8e5d3] bg-white p-8 text-center shadow-[0_18px_55px_rgba(16,24,32,0.08)]">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#101820] text-white">
                  <Icon name="shield" className="size-7" />
                </span>
                <h2 className="mt-5 text-2xl font-black text-[#173a0b]">No contributors found</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[#46623d]">
                  Try another search, or submit approved blackspot reports to start building the safety leaderboard.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default LeaderboardPage;
