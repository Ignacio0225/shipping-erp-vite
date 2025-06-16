import axios from 'axios';  // axios는 HTTP 요청을 보낼 때 사용

import styles from './SharePostList.module.css';  // CSS 모듈 import, 클래스명을 객체처럼 사용 가능

import {useEffect, useState} from 'react';  // React 훅들 import
import {privateAxios} from '../../api/axios.ts';  // 경로는 프로젝트 구조에 맞게!

import type {ShipmentPageOut} from "../../types/shipment.ts";  // 타입스크립트에서 사용할 데이터 타입 import
import {Link, useSearchParams} from "react-router-dom";  // 페이지 이동을 위한 Link 컴포넌트
import React from "react";  // 타입 정의나 JSX 사용을 위해 전체 React import

import Pagination from '../../components/Pagination.tsx'


export default function SharePostList() {

    const [posts, setPosts] = useState<ShipmentPageOut | null>(null);     // 게시글 배열 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState<string | null>(null);     // 에러 상태
    const [searchInput, setSearchInput] = useState(''); // input 필드에 입력되는 실시간 텍스트 상태
    const [searchParams, setSearchParams] = useSearchParams(); // 실제로 검색을 수행할 키워드 상태

    const search = searchParams.get('search') || ''; // URL에서 'search' 파라미터를 추출(없으면 '' 빈 문자열)
    const page = parseInt(searchParams.get('page') || '1', 10); // URL에서 'page' 파라미터를 추출 (없으면 1), (10은 10진수로 변환 하라는말)

    // 검색 버튼 혹은 Enter로 폼이 제출될 때 실행
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // 새로고침 방지
        setSearchParams({search: searchInput, page: '1'}); // 검색어를 반영하고 페이지는 항상 1로 만들어줌
    } // 검색 버튼을 누르면 searchInput을 통해 검색 문자열을 반영해주고 페이지는 1로 돌아가서 시작

    const handlePageChange = (pageNum: number) => {
        setSearchParams({search, page: String(pageNum)}); // 검색어는 유지, 페이지만 변경해서 URL에 반영해줌
    }; // search 파라미터는 기존 값을 유지, page 파라미터만 새 값으로 변경

    // 컴포넌트가 처음 마운트되거나, page 또는 search 값이 바뀔 때마다 게시글 목록을 불러오기
    useEffect(() => {
        async function fetchPosts() {
            try {
                setLoading(true);  // 로딩 시작
                const res = await privateAxios.get<ShipmentPageOut>(
                    `/api/posts/shipments?page=${page}&size=10&search=${encodeURIComponent(search)}`
                ); // 실제 엔드포인트명으로 수정
                setPosts(res.data);   // 게시글 목록 상태로 저장
            } catch (error) {
                // axios가 제공하는 isAxiosError 함수로 체크
                if (axios.isAxiosError(error)) { // Axios가 던지는 에러 객체는 일반 Error와는 조금 다르기 때문에 이 조건으로 먼저 확인
                    setError('에러 : ' + (error.response?.data?.detail || error.message)); // detail이 없으면 일반적인 JavaScript 에러 메시지인 error.message를 보여줌
                } else if (error instanceof Error) {
                    setError('에러 : ' + (error.message)); // Axios 에러가 아닌 일반적인 JavaScript 에러일 경우
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            } finally {
                setLoading(false);  // 로딩 종료
            }
        }

        fetchPosts(); // 비동기 함수 실행
    }, [page, search]); // page 또는 search 값이 변경될 때마다 재실행됨

    if (loading) return <div>로딩 중...</div>;  // 로딩 중 UI 표시
    if (error) return <div>{error}</div>;        // 에러 메시지 UI 표시

    return (
        <div className={styles['share-board-container']}>
            <h2 className={styles['share-board-title']}>공유 게시판</h2>
            <button type={"button"}><Link to={'/posts/upload'}>글쓰기</Link></button>
            <form onSubmit={handleSearch}>  {/* 폼 제출 시 handleSearch 실행 */}
                <input
                    type="text"
                    value={searchInput}  // 입력 필드에 searchInput 상태 연결
                    onChange={(e) => setSearchInput(e.target.value)} // 타이핑될 때마다 상태 업데이트
                    // onKeyDown={(e) => { // 추가 동작을 하고 싶을 때 사용,자동완성 열기, 특정 키 눌렀을 때만 제출 방지 등
                    //     if (e.key === 'Enter') {
                    //         e.preventDefault();     // 기본 폼 제출 막고
                    //         setSearch(searchInput); // 원하는 검색 동작 실행
                    //     }
                    // }}
                    placeholder="제목 또는 내용 검색"  // 사용자에게 보여지는 힌트 텍스트
                    className={styles['share-search-input']} // 스타일은 아래 참고
                />
                <button type={'submit'}>검색</button>
                {/* 검색 버튼 클릭 시 폼 제출됨 */}
            </form>
            {posts?.items.length === 0 ? (  // 게시글이 없는 경우
                <div>게시글이 없습니다.</div>
            ) : (
                <div>
                    <ul className={styles['share-post-list']}>
                        {posts?.items.map(post => (
                            <li key={post.id} className={styles['share-post-card']}>
                                <Link to={`/posts/${post.id}`}>  {/* 게시글 클릭 시 상세 페이지로 이동 */}
                                    <h3 className={styles['share-post-title']}>{post.title}</h3>
                                </Link>
                                <p className={styles['share-post-username']}>{post.creator?.username}</p>
                                <span className={styles['share-post-date']}>{post.created_at}</span>
                                <span className={styles['share-post-time']}>{post.file_paths}</span>{/*너무 어려움 나중에 다시*/}
                            </li>
                        ))}
                    </ul>

                    <div className={styles['page-button']}>  {/* 페이지네이션 영역 */}
                        <Pagination //Pagination 컴포넌트에서 계산 하고 불러옴 설명은 Pagination 컴포넌트에 있음
                            currentPage={page}
                            totalPages={posts?.total_pages || 0}
                            maxButtons={10}
                            onPageChange={handlePageChange} // 콜백 함수 함수 자체를 자식에게 줌
                            posts={posts!} //posts는 반드시 존재 한다는 타입스크립트 문법
                        />
                    </div>

                    <div className={styles['page-information']}>
                        <span>{page} / {posts ? Math.ceil(posts.total / 10) : 1}</span> {/* 현재 페이지 / 전체 페이지 */}
                        <p>총 게시글 수: {posts?.total}</p> {/* 전체 게시글 수 표시 */}
                        <p>현재 페이지: {posts?.page}</p>  {/* 현재 페이지 번호 표시 */}
                    </div>
                </div>

            )}
        </div>
    );
}
