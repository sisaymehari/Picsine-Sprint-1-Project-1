// --- helper.mjs ---

export function getDayWithSuffix(day) {
    if (day > 3 && day < 21) return `${day}th`; // 11th–13th
        switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
}
}

export function computeRevisions(topic, startDate) {
    const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const addMonths = (date, months) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // handle end-of-month overflow
    if (d.getDate() < day) d.setDate(0);
    return d;
};

const intervals = [
    addDays(startDate, 7),   // 1 week
    addMonths(startDate, 1), // 1 month
    addMonths(startDate, 3), // 3 months
    addMonths(startDate, 6), // 6 months
    addMonths(startDate, 12) // 1 year
];

return intervals.map(d => ({ topic, date: d.toISOString().split("T")[0] }));
}
