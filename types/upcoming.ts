export type DividendLite = {
    ticker: string;
    name?: string | null;
    per_share?: number | null;
    currency?: string | null;
    frequency?: number | null;
    ex_dividend_date: string;  // ISO date
    payment_date?: string | null;
    logo_url?: string | null;
    primary_logo_url?: string | null;
    current_price_per_share?: number | null;
    computed_return?: number | null;
};

export type UpcomingGroup = {
    date: string;     // ISO date
    weekday: string;  // e.g., "Monday"
    items: DividendLite[];
};

export type UpcomingResponse = {
    start_date: string;
    end_date: string;
    timezone: string;
    days: number;
    groups: UpcomingGroup[];
};
