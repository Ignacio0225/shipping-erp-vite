import axios from 'axios';


import type {Shipment} from '../../types/shipment.ts'
import {useEffect, useState} from "react";
import privateAxios from "../../api/axios.ts";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import styles from "./SharePost.module.css";

import SharePostFileDownload from './SharePostFileDownload.tsx';



export default function SharePost() {

    const nav = useNavigate();

    const {ship_id} = useParams<{ ship_id: string }>()

    const [post, setPost] = useState<Shipment | null>(null);     // 게시글 배열 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState<string | null>(null);     // 에러 상태


    const handleDelete = async () => {
        const ok = window.confirm('정말 삭제하시겠습니까?'); // 알림창
        if (!ok) {
            // 사용자가 취소를 눌렀을 경우
            return;
        }
        try {
            await privateAxios.delete<Shipment>(`api/posts/shipments/${ship_id}`)
            nav('/posts', {replace: true});
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.detail || error.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                // 알 수 없는 에러 처리
                setError("알 수 없는 오류");
            }
        }
    }


    useEffect(() => {
        async function fetchPost() {
            try {
                setLoading(true);
                const res = await privateAxios.get<Shipment>(`api/posts/shipments/${ship_id}`)
                setPost(res.data);
            } catch (error) {
                if (axios.isAxiosError(error)) { // Axios가 던지는 에러 객체는 일반 Error와는 조금 다르기 때문에 이 조건으로 먼저 확인
                    if (error.response?.status === 404) {
                        setPost(null);
                        setError('해당 게시글을 찾을 수 없습니다.');
                    } else {
                        setError('에러 :' + (error.response?.data?.detail || error.message)); //detail이 없으면 일반적인 JavaScript 에러 메시지인 error.message를 보여줌
                    }
                } else if (error instanceof Error) {
                    setError('에러 :' + (error.message)); // Axios 에러가 아닌 일반적인 JavaScript 에러일 경우
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            } finally {
                setLoading(false);
            }
        }

        void fetchPost();

    }, [ship_id]);

    if (loading) {
        return <div>로딩 중...</div>
    }
    if (post === null && !loading) {
        return <Navigate to={'/404'} replace={true}/>;
    }
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.container}>
            {post ? (
                <div>
                    <div>
                        <div className={styles.textContainer}>
                            <h2 className={styles.postTitle} >제목 : {post.title}</h2>
                            <h3>작성자 : {post.creator?.username}</h3>
                            <p>내용 : </p>
                            <p>{post.description}</p>
                        </div>
                        <div className={styles.btnContainer}>
                            <button type={'button'} onClick={() => nav(`/posts/${post.id}/update`)}> 수정</button>
                            <button type={'button'} onClick={() => handleDelete()}>삭제</button>
                            <button type={'button'} onClick={() => nav(-1)}>목록</button>
                        </div>
                        <SharePostFileDownload ship_id={post.id} filePaths={post.file_paths}/>
                    </div>
                </div>
            ) : (
                <div>게시글이 없습니다.</div>
            )}
        </div>
    )
}