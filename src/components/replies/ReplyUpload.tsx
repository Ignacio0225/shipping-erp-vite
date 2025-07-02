import type {Reply} from "../../types/reply.ts";
import privateAxios from "../../api/axios.ts";
import styles from "./Replies.module.css"; // CSS 모듈 import(스타일 클래스 관리)
import React, {useState} from "react";
import axios from "axios";

type ReplyUploadProps = {
    ship_id: number | undefined;
    setRefresh: React.Dispatch<React.SetStateAction<number>>;
    refresh: number;
}

export default function ReplyUpload({ship_id, setRefresh, refresh}: ReplyUploadProps) {

    const [reply, setReply] = useState<Partial<Reply> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [upLoading, setUploading] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        try {
            const res = await privateAxios.post<Reply>(`api/replies/${ship_id}`, reply)
            setRefresh(refresh + 1);
            return res.data;
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
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReply((prev) => ({...(prev ?? {}), description: e.target.value}));
    }


    return (
        <>
            <form className={styles.replyForm} onSubmit={handleSubmit}>
    <textarea
        className={styles.replyFormTextarea}
        value={reply?.description || ""}
        onChange={handleChange}
        placeholder="댓글을 입력하세요"
        rows={3}
    />
                <div className={styles.replyFormActions}>
                    <button type="submit" className={styles.replyFormBtn} disabled={upLoading}>
                        {upLoading ? "등록 중..." : "등록"}
                    </button>
                    {error && <div className={styles.replyFormError}>{error}</div>}
                </div>
            </form>

        </>)
}