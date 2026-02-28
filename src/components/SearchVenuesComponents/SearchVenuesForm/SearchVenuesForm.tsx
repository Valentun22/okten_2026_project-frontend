import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";

interface FormData {
    query: string;
}

const SearchVenuesForm = () => {
    const {register, handleSubmit, reset, formState: {errors}} = useForm<FormData>({
        mode: 'all',
    });
    const navigate = useNavigate();
    const handleSearch = (data: FormData) => {
        navigate(`search/${data.query}`);
        reset()
    };

    return (
        <form onSubmit={handleSubmit(handleSearch)}>
            <input
                type="text"
                placeholder="Venues..."
                {...register("query")}
            />
            <button type="submit">Search</button>
            {errors.query && <div>{errors.query?.message}</div>}
        </form>
    );
};
export {SearchVenuesForm};