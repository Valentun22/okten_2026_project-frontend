import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../services/axiosInstance.service';
import css from './UserPublic.module.css';

interface IPublicUser {
    id: string; name?: string; email?: string;
    bio?: string; image?: string; isCritic?: boolean;
    isFollowed?: boolean; createdAt?: string;
}

const UserPublicComponent = () => {
    const { id }         = useParams<{ id: string }>();
    const navigate       = useNavigate();
    const [user,     setUser]     = useState<IPublicUser | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [followed, setFollowed] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const meRaw  = localStorage.getItem('user');
    const meId   = meRaw ? JSON.parse(meRaw)?.id : null;
    const isMe   = meId === id;

    useEffect(() => {
        if (!id) return;
        axiosInstance.get(`localhost:3000/users/${id}`)
            .then(({ data }) => { setUser(data); setFollowed(!!data.isFollowed); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    const handleFollow = async () => {
        if (!user) return;
        setFollowLoading(true);
        try {
            if (followed) { await axiosInstance.delete(`localhost:3000/users/${id}/follow`); setFollowed(false); }
            else           { await axiosInstance.post(`localhost:3000/users/${id}/follow`); setFollowed(true); }
        } catch { /* ignore */ }
        setFollowLoading(false);
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#888', fontSize: '16px' }}>
            Завантаження профілю...
        </div>
    );

    if (!user) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#888', fontSize: '16px' }}>
            Користувача не знайдено
        </div>
    );

    return (
        <div className={css.page}>
            <div className={css.hero}>
                <div className={css.avatarWrap}>
                    {user.image
                        ? <img src={user.image} alt={user.name} className={css.avatar} />
                        : <div className={css.avatarPlaceholder}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                </div>
                <div className={css.heroInfo}>
                    <div className={css.nameRow}>
                        <h1 className={css.name}>{user.name ?? 'Анонім'}</h1>
                        {user.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                    </div>
                    {user.bio && <p className={css.bio}>{user.bio}</p>}
                    {user.createdAt && (
                        <p className={css.since}>
                            На платформі з {new Date(user.createdAt).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                        </p>
                    )}
                    <div className={css.heroBtns}>
                        {!isMe && meId && (
                            <button className={`${css.followBtn} ${followed ? css.followBtnActive : ''}`}
                                    onClick={handleFollow} disabled={followLoading}>
                                {followLoading ? '...' : followed ? '✓ Ви підписані' : '+ Підписатись'}
                            </button>
                        )}
                        {isMe && (
                            <button className={css.editBtn} onClick={() => navigate('/profile')}>
                                ✏️ Редагувати профіль
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { UserPublicComponent };
