import {useNavigate, useParams} from "react-router-dom";

import type {Progress} from '../../types/progress.ts'
import privateAxios from "../../api/axios.ts";
import axios from "axios";
import {useEffect, useState} from "react";

export default function Progress() {

    const nav = useNavigate()
    const [progress, setProgress] = useState<Progress | null>(null);     // 게시글 상세 정보를 저장하는 상태 (초기값 null)
    const [loading, setLoading] = useState(true); // 데이터 로딩 여부
    const [error, setError] = useState<string | null>(null);     // 에러 메시지 상태
    const {post_id} = useParams<{ post_id: string }>()


    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await privateAxios.get<Progress>(`api/progress/${post_id}`)
                setProgress(res.data)
            } catch (error) {
                if (axios.isAxiosError(error)) { // axios 에러(네트워크, 404 등)
                    if (error.response?.status === 404) {
                        setProgress(null); // 게시글이 없을 때 post를 null로 설정
                        setError('해당 Progress 를 찾을 수 없습니다.'); // 사용자에게 안내
                    } else {
                        // 기타 에러(권한, 서버 오류 등)
                        setError('에러 :' + (error.response?.data?.detail || error.message));
                    }
                } else if (error instanceof Error) {
                    setError('에러 :' + (error.message)); // JS 일반 에러
                } else {
                    setError('에러 : 알 수 없는 오류'); // 완전 예상 밖 케이스
                }
            }finally {
                setLoading(false); // 로딩 끝
            }
        }
        void fetchProgress();
    }, [post_id]);

    if (loading) return <div>Loading....</div>;
    if (error) return <div>{error}</div>;
    return (
        <>
            <h3>{progress?.title}</h3>
        <ul>
            {progress?.progress_detail_roro?.map(item => (
                <li key={item.id} onClick={()=>nav(`roro/${item.id}`)}>
                    {item.SHIPPER}
                </li>
            ))}
        </ul>
        </>
    )


}