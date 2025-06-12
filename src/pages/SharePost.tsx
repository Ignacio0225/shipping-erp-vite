import axios from 'axios';


import type {Shipment} from '../types/shipment'
import {useEffect, useState} from "react";
import privateAxios from "../api/axios.ts";
import {useParams} from "react-router-dom";



export default function SharePost(){

    const {ship_id} = useParams<{ship_id:string}>()


    const [post, setPost] = useState<Shipment | null>(null);     // 게시글 배열 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState<string | null>(null);     // 에러 상태

    useEffect(() => {
        async function fetchPost(){
            try{
                setLoading(true);
                const res = await privateAxios.get<Shipment>(`api/posts/shipments/${ship_id}`)
                setPost(res.data);
            } catch(error) {
                if(axios.isAxiosError(error)){
                    setError('Login failed:'+(error.response?.data?.detail||error.message));
                }else if(error instanceof Error){
                    setError('Login failed:'+error.message);
                }else {
                    setError('Login failed: 알 수 없는 오류');
                }
            }finally {
                setLoading(false);
            }
        }
        fetchPost();
    },[ship_id]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>게시글</h2>
            {post ? (
                <div>
                    <div>
                        <h2>{post.title}</h2>
                        <p>{post.creator?.username}</p>
                        <p>{post.description}</p>
                    </div>
                </div>
            ):(
                <div>게시글이 없습니다.</div>
            )}
        </div>
    )
}