import axios from 'axios'; // axios(비동기 HTTP 요청 라이브러리) 불러오기
import styles from "./SharePost.module.css"; // CSS 모듈 import(로컬 스타일링)

import {useEffect, useState} from "react"; // React 내장 훅 불러오기
import {Navigate, useNavigate, useParams} from "react-router-dom"; // React Router에서 라우팅 관련 훅 불러오기

import privateAxios from "../../api/axios.ts"; // 인증 토큰이 붙는 axios 인스턴스 import
import type {Shipment} from '../../types/shipment.ts'; // Shipment 타입 정의 불러오기 (게시글 데이터 타입)

import SharePostFileDownload from './SharePostFileDownload.tsx'; // 파일 다운로드 컴포넌트 import
import Replies from "../../components/replies/Replies.tsx"; // 댓글 목록 컴포넌트 import
import {useCurrentUser} from "../../User/currentUser.tsx"; // 현재 로그인한 유저 정보 가져오는 커스텀 훅 import
import formatDate from "../../components/formatDate.tsx";
import SharePostDelete from "./SharePostDelete.tsx";
import ReplyUpload from "../../components/replies/ReplyUpload.tsx";


// 게시글 상세 페이지 컴포넌트
export default function SharePost() {

    const [refresh, setRefresh] = useState(0);// 업로드 성공 후 setRefresh(refresh + 1), Replies의 useEffect에 [ship_id, refresh] 의존성 추가


    const {user} = useCurrentUser(); // 현재 로그인한 사용자 정보, {user: 유저정보, ...} 구조로 반환

    const nav = useNavigate(); // 페이지 이동 함수. nav('/경로') 식으로 사용

    const {ship_id} = useParams<{ ship_id: string }>() // URL 파라미터에서 ship_id(게시글 id) 추출

    const [post, setPost] = useState<Shipment | null>(null);     // 게시글 상세 정보를 저장하는 상태 (초기값 null)
    const [loading, setLoading] = useState(true); // 데이터 로딩 여부
    const [error, setError] = useState<string | null>(null);     // 에러 메시지 상태


    // 게시글 상세 조회(처음 mount시/ship_id 변경 시마다)
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true); // 데이터 불러오기 시작
                // GET 요청(해당 게시글 정보 가져오기)
                const res = await privateAxios.get<Shipment>(`api/posts/shipments/${ship_id}`)
                setPost(res.data); // 받아온 데이터 상태에 저장
            } catch (error) {
                if (axios.isAxiosError(error)) { // axios 에러(네트워크, 404 등)
                    if (error.response?.status === 404) {
                        setPost(null); // 게시글이 없을 때 post를 null로 설정
                        setError('해당 게시글을 찾을 수 없습니다.'); // 사용자에게 안내
                    } else {
                        // 기타 에러(권한, 서버 오류 등)
                        setError('에러 :' + (error.response?.data?.detail || error.message));
                    }
                } else if (error instanceof Error) {
                    setError('에러 :' + (error.message)); // JS 일반 에러
                } else {
                    setError('에러 : 알 수 없는 오류'); // 완전 예상 밖 케이스
                }
            } finally {
                setLoading(false); // 로딩 끝
            }
        }

        void fetchPost(); // 비동기 함수 실행

    }, [ship_id,refresh]); // ship_id(게시글 id)가 바뀔 때마다 실행


    // 1. 로딩 중이면 로딩 메시지 표시
    if (loading) {
        return <div>로딩 중...</div>
    }
    // 2. post 데이터가 null이고, 로딩이 끝난 뒤라면 404 페이지로 이동 (예: 게시글이 없거나 삭제됨)
    if (post === null && !loading) {
        return <Navigate to={'/404'} replace={true}/>;
    }
    // 3. error가 있으면 에러 메시지 표시
    if (error) return <div>{error}</div>;

    // 4. 데이터가 모두 준비된 경우 렌더링
    return (
        <div className={styles.container}>
            {post ? (
                <div>
                    <div>
                        <div className={styles.textContainer}>
                            <h2 className={styles.postTitle}>제목 : {post?.title}</h2>
                            <h3>작성자 : {post?.creator?.username}</h3>
                            <p>작성일 : {formatDate(post?.created_at)}</p>
                            {/* updated_at이 존재하면 마지막 수정일도 표시 */}
                            {post?.updated_at && (<p>마지막 수정일 : {formatDate(post?.updated_at)}</p>)}
                            <p>타입 : {post?.type_category?.title}</p>
                            <p>지역 : {post?.region_category?.title}</p>
                            <p>내용 : </p>
                            <p>{post?.description}</p>
                        </div>
                        {/* 게시글 관리 버튼 영역 */}
                        <div className={styles.btnContainer}>
                            {/* 현재 유저가 게시글 작성자인 경우에만 "수정" 버튼 보여줌 */}
                            {post?.creator?.id === user?.id && (
                                <button type={'button'} onClick={() => nav(`/posts/${post.id}/update`)}> 수정</button>)}
                            {/* 현재 유저가 게시글 작성자인 경우에만 "삭제" 버튼 보여줌 */}
                            {post?.creator?.id === user?.id && (<SharePostDelete ship_id={post.id}/>)}
                            {/* 항상 표시되는 "목록" 버튼 */}
                            <button type={'button'} onClick={() => nav('/posts/')}>목록</button>
                        </div>
                        {/* 파일 다운로드 영역(있으면 표시) */}
                        <SharePostFileDownload ship_id={post?.id} filePaths={post?.file_paths}/>
                    </div>
                    {/* 댓글 영역(Reply 컴포넌트로 분리, ship_id를 props로 전달해도 됨) */}
                    <div>
                        <ReplyUpload ship_id={post?.id} setRefresh={setRefresh} refresh={refresh}/>
                        <Replies ship_id={post?.id} setRefresh={setRefresh} refresh={refresh}/>
                    </div>
                </div>
            ) : (
                <div>게시글이 없습니다.</div>
            )}
        </div>
    )
}
