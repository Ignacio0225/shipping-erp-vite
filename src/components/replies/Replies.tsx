import React, {useEffect, useState} from "react"; // React 내장 hooks: 상태관리(useState), side effect 처리(useEffect), 함수 캐싱(useCallback)
import {useSearchParams} from "react-router-dom"; // 라우터 훅: URL 파라미터(useParams), 쿼리스트링 파싱/설정(useSearchParams)

import type {Reply, ReplyPageOut} from "../../types/reply.ts"; // 댓글 데이터 타입, 페이지네이션 응답 타입 import
import privateAxios from "../../api/axios.ts"; // 인증 포함된 axios 인스턴스 import
import axios from "axios"; // 일반 axios import (isAxiosError 등 사용)
import Pagination from "../Pagination.tsx"; // 페이지네이션 컴포넌트 import
import styles from "./Replies.module.css"; // CSS 모듈 import(스타일 클래스 관리)
import {useCurrentUser} from "../../User/currentUser.tsx";// 현재 로그인 유저 불러오는 커스텀 훅
import formatDate from "../formatDate.tsx"; // formatDate 를 정의해놓음

type RepliesProps = {
    ship_id?: number | undefined;
    setRefresh: React.Dispatch<React.SetStateAction<number>>;
    refresh: number;
}

// 댓글 목록, 수정 기능 포함한 컴포넌트
export default function Replies({ship_id, setRefresh, refresh}: RepliesProps) {
    const {user} = useCurrentUser(); // 현재 로그인된 유저 정보 { id, username, ... }

    // const {ship_id} = useParams<{ ship_id: string }>(); // URL 파라미터에서 게시글 id 추출 (선적 게시글의 id)

    const [loading, setLoading] = useState(true); // 댓글 목록 로딩 중 여부
    const [replies, setReplies] = useState<ReplyPageOut | null>(null); // 댓글 리스트+페이지 정보 상태
    const [error, setError] = useState<string | null>(null); // 에러 메시지 상태

    const [updateReplyId, setUpdateReplyId] = useState<number | null>(null); // 수정 중인 댓글 id
    const [updateReplyText, setUpdateReplyText] = useState<string>(""); // 수정 입력값(텍스트)

    const [searchParams, setSearchParams] = useSearchParams(); // 쿼리 파라미터 읽기/쓰기(페이지네이션 등)

    const page = parseInt(searchParams.get('page') || '1', 10); // page 쿼리에서 숫자 변환, 없으면 1


    // 페이지 이동 시 실행. (부모에게서 받은 Pagination 콜백)
    const handlePageChange = (pageNum: number) => {
        setSearchParams({page: String(pageNum)}); // URL 쿼리에 page=pageNum 추가/갱신
    }

    // 댓글 "수정" 버튼 클릭 시 실행
    const startEdit = (reply: Reply) => {
        setUpdateReplyId(reply.id); // 수정 대상 댓글 id 상태에 저장
        setUpdateReplyText(reply.description); // 댓글 기존 내용 입력값 상태로 복사(수정 input에 보여주기 위함)
    };

    // 댓글 목록 GET 요청 URL 조립 (선적 id+페이지)
    const postUrl = `/api/replies/${ship_id}?page=${page}&size=10`;

    // 댓글 목록 불러오는 함수 (페이지, ship_id 등 변화시마다 새로 만듦)
    // useCallback: 의존성(postUrl)이 변할 때만 새 함수로 다시 생성, 불필요한 재랜더 방지
    // 리플 업로드나 업데이트 됐을시에도 새로고침이 자동으로 되게 하기 위해 사용됨
    // const fetchReplies = useCallback(async () => {
    //     try {
    //         setLoading(true); // 로딩 시작
    //         const res = await privateAxios.get<ReplyPageOut>(postUrl); // 비동기 GET 요청
    //         setReplies(res.data); // 데이터 상태에 저장(댓글, 페이지정보 등)
    //     } catch (error) {
    //         // axios 에러/일반 에러 모두 처리
    //         if (axios.isAxiosError(error)) {
    //             setError('에러 : ' + (error.response?.data?.detail || error.message));
    //         } else if (error instanceof Error) {
    //             setError('에러 : ' + (error.message));
    //         } else {
    //             setError('에러 : 알 수 없는 오류');
    //         }
    //     } finally {
    //         setLoading(false) // 로딩 종료
    //     }
    // }, [postUrl]); // postUrl이 변할 때만 새로 생성

    // 댓글 목록 mount 시/페이지 등 바뀔 때마다 새로 불러옴
    useEffect(() => {
        setLoading(true); // 로딩 시작
        const fetchReplies = async () => {

            try {
                setLoading(true); // 로딩 시작
                const res = await privateAxios.get<ReplyPageOut>(postUrl); // 비동기 GET 요청
                setReplies(res.data); // 데이터 상태에 저장(댓글, 페이지정보 등)
            } catch (error) {
                // axios 에러/일반 에러 모두 처리
                if (axios.isAxiosError(error)) {
                    setError('에러 : ' + (error.response?.data?.detail || error.message));
                } else if (error instanceof Error) {
                    setError('에러 : ' + (error.message));
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            } finally {
                setLoading(false) // 로딩 종료
            }
        }
        void fetchReplies();
    }, [postUrl, refresh]); // fetchReplies 함수가 변하면 재실행

    // 댓글 수정 "저장" submit 이벤트 핸들러
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, reply_id: number) => {
        e.preventDefault(); // 기본 폼 submit(새로고침) 방지
        try {
            // PUT 요청으로 서버에 수정 요청
            await privateAxios.put(`/api/replies/${reply_id}`, {
                description: updateReplyText, // 수정된 내용 전송
            });
            setUpdateReplyId(null); // 수정모드 해제
            setUpdateReplyText(""); // 입력값 초기화
            setRefresh(refresh + 1);
            // void fetchReplies(); // 새로고침(업데이트된 댓글 반영)
        } catch (error) {
            // 에러 상황별 메시지 처리
            if (axios.isAxiosError(error)) {
                setError('에러 : ' + (error.response?.data?.detail || error.message));
            } else if (error instanceof Error) {
                setError('에러 : ' + (error.message));
            } else {
                setError('에러 : 알 수 없는 오류');
            }
        } finally {
            setLoading(false); // 수정이 끝났으므로 로딩 false
            // console.log('user:', user); // (디버그용)
        }
    };

    const handleDelete = async (reply_id: number) => {
        const ok = window.confirm('정말 삭제하시겠습니까?');
        if (!ok) return;
        try {
            await privateAxios.delete(`/api/replies/${reply_id}`)
            setRefresh(refresh + 1);
        } catch (error) {
            // 에러 상황별 메시지 처리
            if (axios.isAxiosError(error)) {
                setError('에러 : ' + (error.response?.data?.detail || error.message));
            } else if (error instanceof Error) {
                setError('에러 : ' + (error.message));
            } else {
                setError('에러 : 알 수 없는 오류');
            }
        }
    }

    // --- 렌더링 구간 ---
    // 1. 로딩 중일 때
    if (loading) return <div>댓글 로딩 중...</div>;
    // 2. 에러 발생 시
    if (error) return <div>{error}</div>;

    // 3. 정상 데이터 표시
    return (
        <>
            {/* 댓글이 0개면 안내 메시지 */}
            {replies?.items?.length === 0 ? (
                <div>댓글이 없습니다.</div>
            ) : (
                <div className={styles.repliesContainer}>
                    <ul className={styles.replyList}>
                        {replies?.items.map(reply => (
                            <li key={reply.id} className={styles.replyItem}>
                                <div className={styles.replyHeader}>
                                    <span className={styles.replyUsername}>{reply.creator?.username}</span>
                                </div>
                                {/* 수정모드이면 textarea+버튼, 아니면 내용/수정버튼 */}
                                {updateReplyId === reply.id ? (
                                    // 수정 중이면 폼 렌더
                                    <form onSubmit={(e) => handleUpdate(e, reply.id)}>
                                <textarea
                                    className={styles.replyInput}
                                    value={updateReplyText}
                                    onChange={(e) => setUpdateReplyText(e.target.value)}
                                />
                                        <div className={styles.replyActions}>
                                            <button type="submit" className={styles.replySaveBtn}>저장</button>

                                            {/* setUpdateReplyId(null)을 호출하면 수정 대상 댓글 id 상태를 해제.*/}
                                            {/* 조건부 렌더링({updateReplyId === reply.id ? ...)이 false가 되어 폼이 감춰짐(취소 동작)*/}
                                            <button type="button" className={styles.replyCancelBtn}
                                                    onClick={() => setUpdateReplyId(null)}>취소
                                            </button>

                                        </div>
                                    </form>
                                ) : (
                                    // 수정모드 아닐 때: 본인 댓글만 수정버튼 보임
                                    <>
                                        <div className={styles.replyText}>{reply.description}</div>
                                        {reply.creator?.id === user?.id && (
                                            <div className={styles.replyActions}>
                                                <button className={styles.replyEditBtn}
                                                        onClick={() => startEdit(reply)}>수정
                                                </button>
                                                <button className={styles.replyDeleteBtn}
                                                        onClick={() => handleDelete(reply.id)}>
                                                    삭제
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className={styles.replyDate}>
                                    {/* 날짜 정보: 수정일이 있으면 함께 표시 */}
                                    {reply.updated_at
                                        ? <>작성일: {formatDate(reply.created_at)} / 마지막
                                            수정일: {formatDate(reply.updated_at)}</>
                                        : <>작성일: {formatDate(reply.created_at)}</>
                                    }
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.paginationContainer}>
                        <Pagination<Reply>
                            currentPage={page} // 현재 페이지 번호(1-base)
                            totalPages={replies?.total_pages || 0} // 전체 페이지 수
                            maxButtons={10} // 최대 버튼 수
                            onPageChange={handlePageChange}  // 클릭 시 쿼리스트링 변경
                            data={replies!} // 댓글 페이지네이션 응답 전체 전달
                        />
                    </div>
                </div>
            )}
        </>

    );
}
