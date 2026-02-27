import {useEffect} from "react";
import {useSearchParams} from "react-router-dom";

const usePageQuery = () => {
    const [query, setQuery] = useSearchParams();
    const pageParam = query.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;

    useEffect(() => {
        if (!pageParam) {
            setQuery({page: '1'});
        }
    }, [pageParam, setQuery]);
    const setPage = (newPage: string) => {
        setQuery({page: newPage});
    };
    const prevPage = () => {
        if (page && page > 1) {
            setPage((page - 1).toString());
        }
    };
    const nextPage = () => {
        setPage((page + 1).toString());
    };

    return {
        page,
        prevPage,
        nextPage,
        setPage
    };
};

export {usePageQuery};