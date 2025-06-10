import axios from 'axios';

import styles from './SharePostList.module.css';

import {useEffect, useState} from 'react';
import {privateAxios} from '../api/axios';  // 경로는 프로젝트 구조에 맞게!


import type {ShipmentPageOut} from "../types/shipment.ts";

export default function SharePostList() {

    const [posts, setPosts] = useState<ShipmentPageOut | null>(null);     // 게시글 배열 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState<string | null>(null);     // 에러 상태
    const [page, setPage] = useState(1);

    // 컴포넌트가 처음 마운트될 때 게시글 목록을 불러오기
    useEffect(() => {
        async function fetchPosts() {
            try {
                setLoading(true);
                const res = await privateAxios.get<ShipmentPageOut>(`/api/posts/shipments?page=${page}&size=10`); // 실제 엔드포인트명으로 수정
                setPosts(res.data);   // 게시글 목록 상태로 저장
            } catch (error) {
                // axios가 제공하는 isAxiosError 함수로 체크
                if (axios.isAxiosError(error)) {
                    setError('Login failed: ' + (error.response?.data?.detail || error.message));
                } else if (error instanceof Error) {
                    setError('Login failed: ' + error.message);
                } else {
                    setError('Login failed: 알 수 없는 오류');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, [page]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles['share-board-container']}>
            <h2 className={styles['share-board-title']}>공유 게시판</h2>
            {posts?.items.length === 0 ? (
                <div>게시글이 없습니다.</div>
            ) : (
                <div>
                    <ul className={styles['share-post-list']}>
                        {posts?.items.map(post => (
                            <li key={post.id} className={styles['share-post-card']}>
                                <h3 className={styles['share-post-title']}>{post.title}</h3>
                                <p className={styles['share-post-username']}>{post.creator?.username}</p>
                                <span className={styles['share-post-date']}>{post.created_at}</span>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                        >
                            이전
                        </button>
                        <span>{page} / {posts ? Math.ceil(posts.total / 10) : 1}</span>
                        <button
                            onClick={() =>
                                setPage(prev =>
                                    posts && prev < Math.ceil(posts.total / 10) ? prev + 1 : prev
                                )
                            }
                            disabled={posts ? page >= Math.ceil(posts.total / 10) : true}
                        >
                            다음
                        </button>
                    </div>
                    <p>총 게시글 수: {posts?.total}</p>
                    <p>현재 페이지: {posts?.page}</p>
                </div>

            )}
        </div>
    );
}
