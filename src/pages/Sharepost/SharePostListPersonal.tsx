import axios from 'axios';  // axios 라이브러리: HTTP 통신(REST API 요청)용

import styles from './SharePostList.module.css';  // CSS 모듈 import, 클래스명을 객체처럼 사용 가능

import {useEffect, useState} from 'react';  // React 함수형 컴포넌트에서 사용하는 상태, 생명주기 훅 import
import {privateAxios} from '../../api/axios.ts';  // 커스텀 Axios 인스턴스(import, 인증 포함/헤더 설정된 인스턴스)

import type {Shipment, ShipmentPageOut} from "../../types/shipment.ts";  // 게시글(선적) 목록 타입 (배열+페이지네이션)
import {useNavigate, useSearchParams} from "react-router-dom";  // SPA 라우팅(페이지 이동), URL 파라미터 관리
import React from "react";  // React 전체 import(타입/JSX)

import Pagination from '../../components/Pagination.tsx'   // 페이지네이션 컴포넌트
import TypeCategories from "../../components/Categories/TypeCategories.tsx";   // 타입 카테고리(드롭다운)
import RegionCategories from "../../components/Categories/RegionCategories.tsx";
import formatDate from "../../components/formatDate.tsx";


export default function SharePostListPersonal() {

    const nav = useNavigate();   // 페이지 이동(라우팅) 함수

    const [posts, setPosts] = useState<ShipmentPageOut | null>(null);     // 게시글 페이지(목록+페이지네이션 정보)
    const [loading, setLoading] = useState(true); // 로딩 중 여부
    const [error, setError] = useState<string | null>(null);     // 에러 메시지 상태
    const [searchInput, setSearchInput] = useState(''); // 검색 입력 필드 상태
    const [selectedTypeCategoryId, setSelectedTypeCategoryId] = useState<string | "">("");  // 선택한 타입카테고리
    const [selectedRegionCategoryId, setSelectedRegionCategoryId] = useState<string | "">(""); // 선택한 지역카테고리
    const [searchParams, setSearchParams] = useSearchParams(); // URL 쿼리 파라미터 읽기/설정용

    const search = searchParams.get('search') || ''; // URL 쿼리에서 search값 추출(없으면 '')
    const page = parseInt(searchParams.get('page') || '1', 10); // page값 추출(없으면 1, 숫자로 변환)

    const rawTypeCategory = searchParams.get('type_category'); // type_category 값(문자열)
    const type_category = rawTypeCategory ? parseInt(rawTypeCategory, 10) : undefined; // 숫자로 변환(없으면 undefined)

    const rawRegionCategory = searchParams.get('region_category');
    const region_category = rawRegionCategory ? parseInt(rawRegionCategory, 10) : undefined; // 숫자로 변환(없으면 undefined)


    // 파일 경로에서 uuid를 제거하고 실제 파일 이름만 추출
    const getFileName = (path: string) => {
        const fullName = path.split('/').pop() || 'unknown_file'; // 경로에서 파일명 추출(없으면 unknown_file)
        const parts = fullName.split('_'); // uuid_파일명으로 저장되어 있으면, _로 분리
        return parts.length > 1 ? parts.slice(1).join('_') : fullName; // uuid 이후만(원래 파일명)
    }

    // 타입 카테고리 드롭다운이 변경될 때 실행
    const handleTypeCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault(); // (실제 select에선 영향 없음. 폼 submit 방지용)
        setSelectedTypeCategoryId(String(e.target.value)); // 상태값 변경
        setSearchParams({
            ...Object.fromEntries(searchParams.entries()), // 기존 파라미터 유지
            type_category: e.target.value, // type_category 파라미터 변경/추가
            page: '1' // 페이지 1로 초기화(검색조건 바뀌면 1페이지부터 보여줘야함)
        });
    }
    // 지역 카테고리 드롭다운 변경 시 실행
    const handleRegionCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setSelectedRegionCategoryId(String(e.target.value));
        setSearchParams({
            ...Object.fromEntries(searchParams.entries()),
            region_category: e.target.value,
            page: '1'
        });
    }

    // 검색 폼 제출(검색 버튼 클릭/엔터) 시 실행
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // 새로고침 방지
        setSearchParams({search: searchInput, page: '1'}); // 검색어+페이지=1로 세팅(카테고리는 없음)
    }

    // 페이지네이션 버튼 클릭 시 실행(페이지 이동)
    const handlePageChange = (pageNum: number) => {
        setSearchParams({search, page: String(pageNum)}); // 검색어는 유지, 페이지 번호만 바꿔서 URL 반영
    };

    // API 요청 URL 조립 (선택된 값만 파라미터로 붙음)
    let url = `/api/posts/shipments/personal?page=${page}&size=10`;
    if (type_category) {
        url += `&type_category=${type_category}`; // type_category 값이 있으면 파라미터 추가
    }
    if (region_category) {
        url += `&region_category=${region_category}`; // region_category 값이 있으면 파라미터 추가
    }
    if (search) {
        url += `&search=${encodeURIComponent(search)}`; // 검색어가 있으면 파라미터 추가(공백/특수문자 인코딩)
    }

    // 게시글 목록 불러오기 (최초 렌더링/파라미터 변화 시마다 실행)
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);  // 로딩 시작
                const res = await privateAxios.get<ShipmentPageOut>(
                    url
                ); // Axios로 GET요청(API)
                setPosts(res.data);   // 응답 데이터(posts 목록) 상태로 저장
            } catch (error) {
                // 에러 상황별 메시지 처리(axios 에러, 일반 JS에러, 그 외)
                if (axios.isAxiosError(error)) {
                    setError('에러 : ' + (error.response?.data?.detail || error.message));
                } else if (error instanceof Error) {
                    setError('에러 : ' + (error.message));
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            } finally {
                setLoading(false);  // 로딩 종료
            }
        }
        void fetchPosts(); // 비동기 함수 실행 (권장패턴)
    }, [url]); // url이 바뀔 때마다 재실행(의존성)

    // 화면 렌더링 분기(로딩/에러/게시글 목록)
    if (loading) return <div>게시글 로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>개인 게시판</h2>
            <div className={styles.searchAndUpload}>
                <div className={styles.categories}>
                    <TypeCategories value={selectedTypeCategoryId} onChange={handleTypeCategoryChange}/>
                    <RegionCategories value={selectedRegionCategoryId} onChange={handleRegionCategoryChange}/>
                </div>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="제목 또는 내용 검색"
                        className={styles.searchInput}
                    />
                    <button type={'submit'}>검색</button>
                </form>
                <button type={"button"} onClick={() => nav('/posts/upload')}>글쓰기</button>
            </div>
            {posts?.items.length === 0 ? (
                <div>게시글이 없습니다.</div>
            ) : (
                <div>
                    <ul className={styles.postList}>
                        {posts?.items.map(post => (
                            <li key={post.id} className={styles.postCard} onClick={() => nav(`/posts/${post.id}`)}>
                                <h3 className={styles.postTitle}>제목 : {post.title}</h3>
                                <p className={styles.category}>{post.type_category?.title} / {post.region_category?.title}</p>
                                <p className={styles.postUsername}>작성자 : {post.creator?.username}</p>
                                <span className={styles.postDate}>작성일 : {formatDate(post.created_at)}</span>
                                {post.updated_at && (
                                    <span className={styles.postDate}>마지막 수정일 : {formatDate(post.updated_at)}</span>
                                )}
                                <ul>
                                    {post.file_paths?.map((filePath, index) => (
                                        <li key={index} className={styles.postFilePaths}>
                                            첨부파일 {index + 1} : {getFileName(filePath)}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.paginationContainer}>
                        <Pagination<Shipment>
                            currentPage={page}
                            totalPages={posts?.total_pages || 0}
                            maxButtons={10}
                            onPageChange={handlePageChange}
                            data={posts!}
                        />
                    </div>
                    <div className={styles.pageInfo}>
                        <span>{page} / {posts ? Math.ceil(posts.total / 10) : 1}</span>
                        <p>총 게시글 수: {posts?.total}</p>
                        <p>현재 페이지: {posts?.page}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
