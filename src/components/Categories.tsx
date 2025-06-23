import {useEffect, useState} from "react";
import type {TypeCategory} from "../types/category.ts";
import privateAxios from "../api/axios.ts";
import axios from "axios";




export function TypeCategories() {
    const [typeCategories, setTypeCategories] = useState<TypeCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
    // const [regionCategories, setRegionCategories] = useState<Partial<Shipment>|null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await privateAxios.get<TypeCategory[]>(`/api/category/type/`)
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
        <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            required
        >
            <option value="">카테고리 선택</option>
            {typeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.title}
                </option>
            ))}
        </select>
    )
}
