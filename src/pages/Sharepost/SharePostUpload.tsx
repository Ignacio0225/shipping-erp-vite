import type {Shipment} from "../../types/shipment";
import React, {useState} from "react";
import {privateMultiAxios} from "../../api/axios.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";


export default function SharePostUploadPage() {

    const nav = useNavigate()
    const [posts, setPosts] = useState<Partial<Shipment> | null>(null);  //shipment type 에서 필요한거만 가져와서 쓰기 위해
    const [error, setError] = useState<string | null>(null);     // 에러 상태
    const [upLoading, setUploading] = useState(false);


    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        try {
            const res = await privateMultiAxios.post<Shipment>('api/posts/shipments/', posts);
            if (res.status !== 200) { //업로드를 하면서 res에는 방금 업로드한 게시글의 정보가 담기게됨 (업로드 하고 함수 이후로 바로 첫번째 실행됨)
                nav(`/posts/${res.data?.id}`); //방금 업로드한 res에서 아이디를 빼와서 그 아이디 게시글로 이동
            } else {
                setError('업로드 실패');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.error);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('알 수 없는 오류');
            }
        } finally {
            setUploading(false);
        }


    }
    if (error) return (<h1>{error}</h1>)

    return (
        <div>
            <h2> 게시글 작성 </h2>
            <form onSubmit={handleUpload}>
                <label htmlFor="title">Title</label>
                <input
                    name="title"
                    type="text"
                    value={posts?.title}
                    // prev(이전값[초기값null]을 가져와서 ...prev(내부객들을 펼침) (prev가 null일 경우 title:null, desc:null 이런식으로) 그중 title:의 값이 타겟
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosts(prev => ({
                        ...prev,
                        title: e.target.value
                    }))}
                    placeholder={'Title'} // 입력 안내문구
                    required={true}
                    minLength={5}
                    maxLength={100}
                />

                <label htmlFor="description">Title</label>
                <textarea
                    name="description"
                    rows={50}
                    value={posts?.description}
                    // prev(이전값[title은 상태가 들어가있고 다른건 안들어가있는값]을 가져와서 ...prev(내부객들을 펼침) (prev가  title:제목, desc:null 이런식으로) 그중 desc:의 값이 타겟
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPosts(prev => ({
                        ...prev,
                        description: e.target.value
                    }))}
                    placeholder={'Description'}
                    required={true}
                    minLength={1}
                    maxLength={1000}
                />
                <button type="submit" disabled={upLoading}>Upload</button>
            </form>

        </div>

    )
}
