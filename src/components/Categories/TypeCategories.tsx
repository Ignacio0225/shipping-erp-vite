import React, {useEffect, useState} from "react";
import type {Category} from "../../types/category.ts";
import privateAxios from "../../api/axios.ts";
import axios from "axios";



interface CategoryProps {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
}


export default function TypeCategories({onChange,value}:CategoryProps) {
    const [typeCategories, setTypeCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories= async () => {
            try {
                const res = await privateAxios.get<Category[]>(`/api/category/type`)
                setTypeCategories(res.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setTypeCategories([])
                        setError('카테고리를 불러올 수 없습니다.')
                    } else {
                        setError('에러 : ' + (error.response?.data?.detail || error.message));
                    }
                } else if (error instanceof Error) {
                    setError('에러 : ' + (error.message));
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            }
        }

        void fetchCategories();
    }, [])

    if (error) return <div>{error}</div>;


    return (
        <>
        <select
            name="type_category"
            value={value}
            onChange={onChange}
            required
        >
            <option value="">카테고리 선택</option>
            {typeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.title}
                </option>
            ))}
        </select>
            </>
    )
}
