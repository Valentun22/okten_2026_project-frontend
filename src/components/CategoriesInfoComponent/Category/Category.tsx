import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import css from './Genre.module.css';
import Badge from '@mui/material/Badge';
import {IVenueCategoryInterface} from "../../../interfaces/IVenueCategoryInterface";

interface IProps {
    category: IVenueCategoryInterface;
    onGenreClick: (category: IVenueCategoryInterface) => void;
    isActive: boolean;
    count: number;
}

const Category: FC<IProps> = ({ category, isActive, count }) => {
    const { id, name } = category;
    const navigate = useNavigate();
    const location = useLocation();

    const isCategoriesPage = location.pathname.startsWith('/categories');
    return (
        <div>
            <button className={`${css.genre_badge} ${isActive && isCategoriesPage ? css.active : ''}`}
                    onClick={() => navigate(`/categories/${id}`)}
                    >
                {name}
                <Badge className={css.numbers} badgeContent={count} max={100}  color="primary"></Badge>
            </button>
        </div>
    );
};

export { Category };