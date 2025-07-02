
import type {PageData} from "../components/Pagination.tsx";


export type Reply = {
    id: number;
    description: string;
    created_at: string;
    updated_at: string;
    creator?: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}



export type ReplyPageOut = PageData<Reply>;