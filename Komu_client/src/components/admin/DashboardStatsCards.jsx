export default function DashboardStatsCards({ summary }) {
    const cards = [
        {
            label: "Total Users",
            value: summary?.total_users ?? 0,
            className: "stats-card stats-card--blue",
        },
        {
            label: "Verified",
            value: summary?.verified_users ?? 0,
            className: "stats-card stats-card--green",
        },
        {
            label: "Pending",
            value: summary?.pending_users ?? 0,
            className: "stats-card stats-card--amber",
        },
        {
            label: "Rejected",
            value: summary?.rejected_users ?? 0,
            className: "stats-card stats-card--red",
        },
    ];

    return (
        <div className="stats-grid">
            {cards.map((card) => (
                <div key={card.label} className={card.className}>
                    <span className="stats-card__label">{card.label}</span>
                    <strong className="stats-card__value">{card.value}</strong>
                </div>
            ))}
        </div>
    );
}