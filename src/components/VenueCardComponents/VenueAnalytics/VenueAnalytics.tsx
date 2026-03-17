import {FC, useEffect, useState} from 'react';
import {axiosInstance} from '../../../services/axiosInstance.service';
import {urls} from '../../../constants/urls';
import css from './VenueAnalytics.module.css';

interface IProps {
    venueId: string;
}

interface ITimePoint {
    bucket: string;
    date?: string;
    count: number;
}

interface ISummary {
    total: number;
    uniqueVisitors?: number;
    avgPerDay?: number;
}

const VenueAnalytics: FC<IProps> = ({venueId}) => {
    const [summary, setSummary] = useState<ISummary | null>(null);
    const [series, setSeries] = useState<ITimePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    const load = async (p: '7d' | '30d' | '90d') => {
        setLoading(true);
        const days = p === '7d' ? 7 : p === '30d' ? 30 : 90;
        const to = new Date();
        const from = new Date(Date.now() - days * 86400000);
        const params = {from: from.toISOString(), to: to.toISOString(), bucket: 'day'};
        try {
            const [sumRes, tsRes] = await Promise.all([
                axiosInstance.get(urls.analytics.viewsSummary(venueId), {params}),
                axiosInstance.get(urls.analytics.viewsTimeseries(venueId), {params}),
            ]);
            setSummary(sumRes.data?.data ?? sumRes.data);
            const ts = tsRes.data?.data ?? tsRes.data;
            setSeries(Array.isArray(ts) ? ts : []);
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        load(period);
    }, [venueId, period]);

    const maxCount = series.length > 0 ? Math.max(...series.map(p => p.count ?? 0), 1) : 1;

    return (
        <section className={css.section}>
            <div className={css.header}>
                <h2 className={css.title}>📊 Аналітика переглядів</h2>
                <div className={css.periodBtns}>
                    {(['7d', '30d', '90d'] as const).map(p => (
                        <button key={p} className={`${css.periodBtn} ${period === p ? css.periodActive : ''}`}
                                onClick={() => setPeriod(p)}>
                            {p === '7d' ? '7 днів' : p === '30d' ? '30 днів' : '90 днів'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={css.skeleton}/>
            ) : (
                <>
                    {summary && (
                        <div className={css.statsRow}>
                            <div className={css.statCard}>
                                <span className={css.statVal}>{summary.total ?? 0}</span>
                                <span className={css.statLabel}>Всього переглядів</span>
                            </div>
                            {summary.uniqueVisitors !== undefined && (
                                <div className={css.statCard}>
                                    <span className={css.statVal}>{summary.uniqueVisitors}</span>
                                    <span className={css.statLabel}>Унікальних відвідувачів</span>
                                </div>
                            )}
                            {summary.avgPerDay !== undefined && (
                                <div className={css.statCard}>
                                    <span className={css.statVal}>{Number(summary.avgPerDay).toFixed(1)}</span>
                                    <span className={css.statLabel}>Середньо на день</span>
                                </div>
                            )}
                        </div>
                    )}

                    {series.length > 0 ? (
                        <div className={css.chart}>
                            {series.map((point, i) => {
                                const dateStr = point.bucket ?? point.date ?? '';
                                const label = dateStr ? new Date(dateStr).getDate() : i + 1;
                                const isSingle = series.length === 1;
                                const pct = isSingle
                                    ? 60
                                    : Math.max(4, Math.round((point.count / maxCount) * 100));
                                return (
                                    <div key={i} className={css.barWrap}
                                         style={isSingle ? {maxWidth: 60, flex: 'none'} : {}}
                                         title={`${dateStr}: ${point.count} переглядів`}>
                                        <span className={css.barCount}>{point.count}</span>
                                        <div className={css.bar} style={{height: `${pct}%`}}/>
                                        <span className={css.barLabel}>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={css.noData}>
                            <span>📈</span>
                            <p>Даних про перегляди ще немає або API не повертає timeseries.</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export {VenueAnalytics};