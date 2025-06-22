// 게시글 수정 페이지 컴포넌트 (React)
import React, {useEffect, useState} from "react"; // useEffect: 컴포넌트가 처음 렌더링될 때 실행됨 / useState: 상태 저장용
import {useNavigate, useParams} from "react-router-dom"; // useParams: URL 파라미터 추출 / useNavigate: 페이지 이동용
import axios from "axios"; // axios: HTTP 요청 및 에러 처리용
import styles from './SharePostUpdate.module.css'; // CSS 모듈 불러오기 (.module.css는 클래스명이 자동으로 유니크하게 매핑됨)
import type {Shipment} from "../../types/shipment"; // 게시글 타입 불러오기 (id, title, description, file_paths 등)
import {privateAxios, privateMultiAxios} from "../../api/axios"; // privateAxios: 일반 요청 / privateMultiAxios: 파일 포함 multipart/form-data 요청

// 이 함수가 실행되면 게시글 수정 화면이 그려짐
export default function SharePostUpdate() {

    const {ship_id} = useParams<{ ship_id: string }>(); // URL에서 게시글 ID 추출. 예: /posts/1/edit이면 ship_id는 "1"

    const nav = useNavigate(); // 페이지 이동을 위한 훅

    const [post, setPost] = useState<Partial<Shipment> | null>(null); // 게시글 내용을 저장할 상태 (title, description 등 일부 필드만)
    const [keepFilePaths, setKeepFilePaths] = useState<string[]>([]); // 기존 파일 중 "남길 파일 경로" 리스트
    const [newFiles, setNewFiles] = useState<File[]>([]); // 새로 업로드할 파일 리스트
    const [error, setError] = useState<string | null>(null); // 에러 메시지 저장
    const [loading, setLoading] = useState(true); // 게시글 데이터 불러오는 중인지 여부
    const [updating, setUpdating] = useState(false); // 수정 중인지 여부 (중복 요청 방지용)

    // ✅ 컴포넌트 마운트 시 기존 게시글 정보 불러오기
    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await privateAxios.get<Shipment>(`/api/posts/shipments/${ship_id}`); // 서버에서 게시글 데이터 받아오기
                setPost(res.data); // 게시글 내용을 상태에 저장
                setKeepFilePaths(res.data.file_paths || []); // 기존 파일 경로를 keepFilePaths 상태로 저장
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.detail || error.message); // axios 에러 응답 처리
                } else {
                    setError("게시글 불러오던중 에러 발생."); // 일반 오류 처리
                }
            } finally {
                setLoading(false); // 로딩 상태 false로 변경 (성공하든 실패하든)
            }
        }
        fetchPost(); // 위 비동기 함수 실행
    }, [ship_id]); // ship_id가 바뀔 때마다 재실행됨

    // ✅ 새 파일 추가할 때 실행되는 함수 (input[type=file] onChange에 연결됨)
    const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return; // 선택된 파일이 없으면 중단
        const filesArray = Array.from(e.target.files); // FileList 객체를 일반 배열로 변환
        setNewFiles(prev => [...prev, ...filesArray]); // 기존 파일 목록에 새 파일들을 추가해서 상태 업데이트
    };

    // ✅ 새로 추가한 파일 중 하나를 제거할 때 호출됨 (X 버튼)
    const handleNewFileRemove = (index: number) => {
        // index번째 요소만 제외하고 나머지를 유지하는 새 배열 생성 → 상태 갱신
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        // (_)는 요소 자체 (우리는 그걸 쓰지 않음), i는 현재 인덱스
        // i !== index: 내가 클릭한 index만 제거됨
    };

    // ✅ 기존 파일 중에서 남기지 않을 파일을 제거할 때 호출됨 (삭제 버튼)
    const handleKeepFileRemove = (index: number) => {
        setKeepFilePaths(prev => prev.filter((_, i) => i !== index)); // 방식은 위와 동일
    };

    // ✅ 폼 제출 시 서버로 PUT 요청을 보내는 함수
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        if (!ship_id) return; // ship_id 없으면 중단
        setUpdating(true); // 수정 중 상태 true로 설정
        setError(null); // 에러 초기화

        try {
            const formData = new FormData(); // multipart/form-data 객체 생성 (파일 포함 가능)

            if (post?.title) formData.append("title", post.title); // 제목 추가
            if (post?.description) formData.append("description", post.description); // 설명 추가
            keepFilePaths.forEach(path => formData.append("keep_file_paths", path)); // 유지할 기존 파일 경로들 추가
            newFiles.forEach(file => formData.append("new_file_paths", file)); // 새로 추가한 파일들도 추가

            // 서버에 PUT 요청 보내기 (파일 포함하므로 privateMultiAxios 사용)
            const res = await privateMultiAxios.put(`/api/posts/shipments/${ship_id}`, formData);

            setPost(res.data); // 응답으로 돌아온 게시글 데이터로 상태 갱신
            nav(`/posts/${ship_id}`); // 수정 완료 후 게시글 상세 페이지로 이동
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.detail || error.message); // 서버 에러 응답 표시
            } else {
                setError("알 수 없는 오류가 발생했습니다."); // 기타 예외 처리
            }
        } finally {
            setUpdating(false); // 수정 완료 상태 해제
        }
    };

    // ✅ 조건에 따라 다른 UI 렌더링
    if (loading) return <div>로딩 중...</div>; // 로딩 상태일 때 메시지 표시
    if (error) return <div>{error}</div>; // 에러가 있을 경우 메시지 표시
    if (!post) return <div>게시글이 없습니다.</div>; // post가 null일 때 처리

    // ✅ 기본 화면 렌더링
    return (
        <div className={styles.postFormWrap}> {/* 폼 전체를 감싸는 div */}
            <h2 className={styles.title}>게시글 수정</h2> {/* 제목 */}

            <form onSubmit={handleUpdate} className={styles.form}> {/* 폼 시작 */}
                <label className={styles.label}>Title</label>
                <input
                    type="text"
                    value={post.title} // 입력창에 현재 title 표시
                    onChange={(e) => setPost(prev => ({...(prev ?? {}), title: e.target.value}))} // 입력값 변경 시 상태 업데이트
                    required
                    className={styles.input}
                />

                <label className={styles.label}>Description</label>
                <textarea
                    rows={20}
                    value={post.description} // 현재 description 표시
                    onChange={(e) => setPost(prev => ({...(prev ?? {}), description: e.target.value}))} // 상태 업데이트
                    required
                    className={styles.textarea}
                />

                <label className={styles.label}>기존 파일 목록</label>
                <ul>
                    {keepFilePaths.map((path, index) => (
                        <li key={index}>
                            {path.split('/').pop()} {/* 경로에서 파일명만 추출 */}
                            <button type="button" onClick={() => handleKeepFileRemove(index)}>삭제</button> {/* 해당 파일 제거 */}
                        </li>
                    ))}
                </ul>

                <label className={styles.label}>새 파일 추가</label>
                <input
                    type="file"
                    multiple
                    onChange={handleNewFileChange} // 파일 추가 시 상태에 반영
                    className={styles.fileInput}
                />
                <ul>
                    {newFiles.map((file, index) => (
                        <li key={index}>
                            {file.name} {/* 파일 이름 표시 */}
                            <button type="button" onClick={() => handleNewFileRemove(index)}>X</button> {/* 제거 버튼 */}
                        </li>
                    ))}
                </ul>

                <button type="submit" disabled={updating} className={styles.submitBtn}>
                    {updating ? "수정 중..." : "수정 완료"} {/* 버튼 내용 변경 */}
                </button>

                <button type="button" onClick={() => nav(-1)} className={styles.submitBtn}> {/* 취소 버튼 */}
                    취소
                </button>
            </form>
        </div>
    );
}
