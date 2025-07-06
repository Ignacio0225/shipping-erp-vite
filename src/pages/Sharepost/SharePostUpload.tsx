import type {Post} from "../../types/post.ts";
import React, {useState} from "react";
import {privateMultiAxios} from "../../api/axios.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import styles from './SharePostUpload.module.css'
import TypeCategories from "../../components/Categories/TypeCategories.tsx";
import RegionCategories from "../../components/Categories/RegionCategories.tsx";


export default function SharePostUploadPage() {

    const nav = useNavigate()
    const [posts, setPosts] = useState<Partial<Post> | null>(null);  //post type 에서 필요한거만 가져와서 쓰기 위해
    const [files, setFiles] = useState<File[]>([]); // 파일 업로드는 따로 상태 관리 타입은 FileList 여러개(리스트로) 받아오기 위함
    const [error, setError] = useState<string | null>(null);     // 에러 상태
    const [selectedTypeCategoryId, setSelectedTypeCategoryId] = useState<string | "">("");
    const [selectedRegionCategoryId, setSelectedRegionCategoryId] = useState<string | "">("");


    const [upLoading, setUploading] = useState(false);

    // console.log(posts)

    const goBack = () => {
        nav(-1)
    }

    // 파일 선택 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return; // null 체크 필수

        const filesArray = Array.from(e.target.files); // 여기서 null 아님 확실하니 에러 없음

        setFiles(prev => [...(prev ?? []), ...filesArray]);
    };

    // 특정 파일 제거 함수
    const handleFileRemove = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };


    const handleTitleChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
        setPosts((prev) => ({...(prev ?? {}), title: e.target.value}))
    }
    const handleDescriptionChange =(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        setPosts((prev) => ({...(prev ?? {}), description: e.target.value}))
    }


    const handleTypeCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTypeCategoryId(String(e.target.value));
        setPosts((prev) => ({...(prev ?? {}), type_category:{id:e.target.value,title:e.target.value}}));
    }

    const handleRegionCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegionCategoryId(String(e.target.value));
        setPosts((prev) => ({...(prev ?? {}), region_category:{id:e.target.value,title:e.target.value}}));
    }


    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 기본 폼 제출 이벤트 막기
        setUploading(true); // 업로드 시작 표시
        setError(null);     // 이전 에러 초기화


        try {
            const formData = new FormData(); // multipart/form-data 전송용 폼데이터 생성

            // posts 상태에 title이 있으면 formData에 추가, if posts.tilte이 있으면 formData에 title 키에 , 벨류로 posts?.title을 추가 없으면 '' 빈 문자열(if 로 걸렀기때문에 무조건 있긴함)
            if (posts?.title) formData.append("title", posts?.title || '');
            // description이 있으면 추가
            if (posts?.description) formData.append("description", posts?.description || '');

            if (posts?.type_category?.id) formData.append("type_category", posts?.type_category?.id|| '');

            if (posts?.region_category?.id) formData.append("region_category", posts?.region_category?.id || '');

            // 파일이 선택된 경우
            if (files) {
                // files.length 만큼 반복 (선택된 파일 개수)
                for (let i = 0; i < files.length; i++) {
                    // formData에 'files'라는 키로 각 파일 추가 (멀티파트 업로드 시 파일 배열로 서버에 전달됨)
                    formData.append("files", files[i]); // "files" 키는 꼭 백엔드 타입과 동일하게
                }
            }
            // // 2. FormData 안의 모든 값 콘솔에 찍기
            // for (const [key, value] of formData.entries()) {
            //     // key: string, value: FormDataEntryValue (string | File)
            //     if (value instanceof File) {
            //         // value가 파일이면 파일 이름만 출력
            //         console.log(`${key}: [File] ${value.name}`);
            //     } else {
            //         // value가 문자열이면 그대로 출력
            //         console.log(`${key}: ${value}`);
            //     }
            // }

            // privateMultiAxios 인스턴스를 통해 POST 요청
            // 서버 엔드포인트에 formData 전송, Content-Type은 multipart/form-data로 자동 설정됨
            const res = await privateMultiAxios.post<Post>('api/posts/', formData);

            // 응답 상태가 200 또는 201일 때 성공 처리
            if (res.status === 200 || res.status === 201) {
                // 업로드 성공 시, 방금 생성된 게시글 상세 페이지로 이동
                nav(`/posts/${res.data.id}`);
            } else {
                // 상태 코드가 성공 코드가 아니면 에러 메시지 표시
                setError('업로드 실패');
            }
        } catch (error) {
            // 에러 처리 (axios 에러인지 일반 에러인지 구분)
            if (axios.isAxiosError(error)) {
                // axios 에러일 경우, 서버에서 전달된 에러 메시지 있으면 사용, 없으면 기본 메시지
                setError(error.response?.data?.detail || error.message);
            } else if (error instanceof Error) {
                // 일반 JS 에러일 경우 메시지 표시
                setError(error.message);
            } else {
                // 알 수 없는 에러 처리
                setError("알 수 없는 오류");
            }
        } finally {
            setUploading(false); // 업로드 완료 표시 (성공/실패 상관없이)
        }
    };
    if (error) return (<h1>{error}</h1>)

    return (
        <div className={styles.postFormWrap}>
            <h2 className={styles.title}>게시글 작성</h2>
            <form onSubmit={handleUpload} className={styles.form}>
                <label htmlFor="title" className={styles.label}>Title</label>
                <div>
                    <TypeCategories value={selectedTypeCategoryId} onChange={handleTypeCategoryChange}/>
                    <RegionCategories value={selectedRegionCategoryId} onChange={handleRegionCategoryChange}/>
                </div>
                <input
                    name="title"
                    type="text"
                    value={posts?.title}
                    onChange={handleTitleChange}
                    placeholder="Title"
                    required
                    minLength={5}
                    maxLength={100}
                    className={styles.input}
                />
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea
                    name="description"
                    rows={20}
                    value={posts?.description}
                    onChange={handleDescriptionChange}
                    placeholder="Description"
                    required
                    minLength={1}
                    maxLength={1000}
                    className={styles.textarea}
                />

                <label htmlFor="file" className={styles.label}>Upload File</label>
                <input
                    name="files"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />
                <ul>
                    {files.map((file, index) => (
                        <li key={index}>
                            {file?.name}
                            <button type="button" onClick={() => handleFileRemove(index)}>X</button>
                        </li>
                    ))}
                </ul>

                <button type="submit" disabled={upLoading} className={styles.submitBtn}>
                    {upLoading ? "Uploading..." : "업로드"}
                </button>
                <button type={'button'} onClick={goBack} className={styles.submitBtn}>
                    취소
                </button>
            </form>
        </div>


    )
}
