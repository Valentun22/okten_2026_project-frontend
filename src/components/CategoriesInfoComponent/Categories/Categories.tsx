import { useAppDispatch, useAppSelector } from "../../../hooks/useReduxHooks";
import { Category } from "../Category/Category";
import { useEffect } from "react";
import { IVenueCategoryInterface } from "../../../interfaces/IVenueCategoryInterface";
import { categoriesAction } from "../../../redux/slices/categoriesSlice";

const Categories = () => {
    const { categories, activeCategoryId, categoryVenuesCount, total_pages } =
        useAppSelector((state) => state.categories);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(categoriesAction.getAll()).then(() => {
            dispatch(categoriesAction.getCategoryVenuesCount());
        });
    }, [dispatch]);

    const handleGenreClick = (category: IVenueCategoryInterface) => {
        dispatch(categoriesAction.setActiveCategoryId(category.id));
    };

    return (
        <div>
            {categories.map((category) => (
                <Category
                    key={category.id}
                    category={category}
                    onGenreClick={handleGenreClick}
                    isActive={category.id === activeCategoryId}
                    count={(categoryVenuesCount?.[category.id] ?? 0) * (total_pages ?? 0)}
                />
            ))}
        </div>
    );
};

export { Categories };