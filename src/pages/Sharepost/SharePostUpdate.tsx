// 게시글 수정 페이지(SharePostUpdate) 컴포넌트

import React, {useEffect, useState} from "react"; // 리액트, useEffect: 마운트 시/상태 변화 시 동작, useState: 상태값 관리용
import {useNavigate, useParams} from "react-router-dom"; // useParams: URL에서 파라미터 추출 / useNavigate: 라우팅용(페이지 이동)
import axios from "axios"; // axios: 비동기 HTTP 요청 및 예외 처리
import styles from './SharePostUpdate.module.css'; // css 모듈(클래스명이 자동으로 유니크하게 매핑됨)
import type {Post} from "../../types/post.ts"; // 게시글 타입(데이터 구조 타입스크립트로)
import {privateAxios, privateMultiAxios} from "../../api/axios"; // 인증이 필요한 axios 인스턴스(파일 포함시엔 privateMultiAxios)
import TypeCategories from "../../components/Categories/TypeCategories.tsx"; // 선적종류 카테고리 셀렉트박스 컴포넌트
import RegionCategories from "../../components/Categories/RegionCategories.tsx"; // 지역 카테고리 셀렉트박스 컴포넌트

// 게시글 수정 컴포넌트 함수 선언(리액트 함수형 컴포넌트)
export default function SharePostUpdate() {
    const {post_id} = useParams<{ post_id: string }>(); // URL의 /posts/:post_id/edit에서 post_id 추출
    const nav = useNavigate(); // 라우팅(페이지 이동)용 함수

    const [post, setPost] = useState<Partial<Post> | null>(null); // 수정 대상 게시글(일부 속성만, 최초 null)
    const [keepFilePaths, setKeepFilePaths] = useState<string[]>([]); // 기존 파일 중 유지할 경로만 저장하는 상태
    const [selectedTypeCategoryId, setSelectedTypeCategoryId] = useState<string | "">(""); // 선택된 타입 카테고리 ID 상태
    const [selectedRegionCategoryId, setSelectedRegionCategoryId] = useState<string | "">(""); // 선택된 지역 카테고리 ID 상태

    const [newFiles, setNewFiles] = useState<File[]>([]); // 새로 첨부할 파일 리스트 상태
    const [error, setError] = useState<string | null>(null); // 에러 메시지(있으면 표시)
    const [loading, setLoading] = useState(true); // 게시글 불러오는 동안 true
    const [updating, setUpdating] = useState(false); // 수정 요청 중이면 true(중복제출 방지용)

    // ⭐ 게시글 정보(기존 값) 불러오기 : 처음 렌더링(마운트)되거나 post_id 바뀔 때마다 실행
    useEffect(() => {
        async function fetchPost() {
            try {
                // 서버에서 게시글 1개 조회(GET)
                const res = await privateAxios.get<Post>(`/api/posts/${post_id}`);
                setPost(res.data); // 게시글 데이터 저장(상태값으로)
                setKeepFilePaths(res.data.file_paths || []); // 기존 파일경로들(없으면 빈 배열)
                // (카테고리 셀렉트박스 기본값 반영)
                setSelectedTypeCategoryId(res.data.type_category?.id?.toString() || "");
                setSelectedRegionCategoryId(res.data.region_category?.id?.toString() || "");
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.detail || error.message); // 서버에러 메시지
                } else {
                    setError("게시글 불러오던중 에러 발생.");
                }
            } finally {
                setLoading(false); // 로딩 종료
            }
        }

        fetchPost(); // 위 함수 즉시 실행
    }, [post_id]); // post_id 바뀔 때마다 재실행(동적 라우팅 대응)

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPost((prev) => ({...(prev ?? {}), title: e.target.value}))
    }
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPost((prev) => ({...(prev ?? {}), description: e.target.value}))
    }


    // ⭐ 카테고리(타입) 셀렉트박스 값 변경 시
    const handleTypeCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTypeCategoryId(String(e.target.value)); // 셀렉트박스에 보일 값 세팅
        setPost(prev => ({...(prev ?? {}), type_category: {id: e.target.value, title: e.target.value}})); // post 상태에도 값 반영
    }
    // ⭐ 카테고리(지역) 셀렉트박스 값 변경 시
    const handleRegionCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegionCategoryId(String(e.target.value));
        setPost(prev => ({...(prev ?? {}), region_category: {id: e.target.value, title: e.target.value}}));
    }

    // ⭐ 새 파일 선택 시 파일 상태에 추가
    const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return; // 아무것도 선택 안했으면 무시
        const filesArray = Array.from(e.target.files); // FileList → 배열로 변환
        setNewFiles(prev => [...prev, ...filesArray]); // 기존 파일+새 파일 모두 상태로 저장
    };

    // ⭐ 새 파일 중 특정 파일 삭제(X 버튼)
    const handleNewFileRemove = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index)); // index에 해당하는 파일만 제거(나머지는 유지)
    };

    // ⭐ 기존 파일 중 특정 파일 삭제(keepFilePaths에서만 제거)
    const handleKeepFileRemove = (index: number) => {
        setKeepFilePaths(prev => prev.filter((_, i) => i !== index)); // 유지 리스트에서만 제거(실제 파일 삭제는 아님, 서버에서 삭제)
    };

    // ⭐ 폼 제출 시(게시글/파일 수정 최종 제출) 호출
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 기본 폼 동작 차단(새로고침 막기)
        if (!post_id) return; // post_id 없는 경우 중단
        setUpdating(true); // 버튼 비활성화 등 상태전환
        setError(null);    // 에러 초기화

        try {
            // multipart/form-data 형식 생성(파일+데이터 동시 전송)
            const formData = new FormData();

            // 텍스트 데이터(제목, 설명)
            if (post?.title) formData.append("title", post?.title);
            if (post?.description) formData.append("description", post?.description);

            // 카테고리(서버에서 숫자로 받으니까 id만)
            if (post?.type_category?.id) formData.append('type_category', post?.type_category.id || '');
            if (post?.region_category?.id) formData.append('region_category', post?.region_category.id || '');

            // 기존 파일 중 남길 파일들 (백엔드에서 유지할 경로로 사용)
            keepFilePaths.forEach(path => formData.append("keep_file_paths", path));
            // 새로 추가한 파일들
            newFiles.forEach(file => formData.append("new_file_paths", file));

            // 파일 및 데이터 전송(수정요청, PUT)
            const res = await privateMultiAxios.put(`/api/posts/posts/${post_id}`, formData);

            setPost(res.data); // 응답으로 받은 최신 게시글 데이터 반영
            nav(`/posts/${post_id}`); // 상세페이지로 이동
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.detail || error.message); // 서버 에러 처리
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setUpdating(false); // 버튼/상태 복구
        }
    };

    // 로딩, 에러, 게시글 미존재 상황별 UI
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!post) return <div>게시글이 없습니다.</div>;

    // 최종 렌더링
    return (
        <div className={styles.postFormWrap}> {/* 게시글 폼 전체 래퍼 */}
            <h2 className={styles.title}>게시글 수정</h2>
            <div>
                {/* 카테고리 셀렉트박스 2개(타입, 지역) */}
                <TypeCategories value={selectedTypeCategoryId} onChange={handleTypeCategoryChange}/>
                <RegionCategories value={selectedRegionCategoryId} onChange={handleRegionCategoryChange}/>
            </div>
            <form onSubmit={handleUpdate} className={styles.form}>
                <label className={styles.label}>Title</label>
                <input
                    type="text"
                    value={post.title} // 제목
                    onChange={handleTitleChange}
                    required
                    className={styles.input}
                />

                <label className={styles.label}>Description</label>
                <textarea
                    rows={20}
                    value={post.description} // 본문
                    onChange={handleDescriptionChange}
                    required
                    className={styles.textarea}
                />

                <label className={styles.label}>기존 파일 목록</label>
                <ul>
                    {keepFilePaths.map((path, index) => (
                        <li key={index}>
                            {path.split('/').pop()} {/* 파일명만 표시 */}
                            <button type="button" onClick={() => handleKeepFileRemove(index)}>삭제</button>
                        </li>
                    ))}
                </ul>

                <label className={styles.label}>새 파일 추가</label>
                <input
                    type="file"
                    multiple
                    onChange={handleNewFileChange}
                    className={styles.fileInput}
                />
                <ul>
                    {newFiles.map((file, index) => (
                        <li key={index}>
                            {file.name}
                            <button type="button" onClick={() => handleNewFileRemove(index)}>X</button>
                        </li>
                    ))}
                </ul>

                <button type="submit" disabled={updating} className={styles.submitBtn}>
                    {updating ? "수정 중..." : "수정 완료"}
                </button>
                <button type="button" onClick={() => nav(-1)} className={styles.submitBtn}>
                    취소
                </button>
            </form>
        </div>
    );
}
