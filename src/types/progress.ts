
//src/type/progress.ts

import type {User} from "./user.ts";
import type {ProgressDetailRoRo} from "./progressDetailRoRo.ts";


export type Progress={
    id: string
    title:string
    created_at: string
    updated_at: string | null
    creator:User
    progress_detail_roro:ProgressDetailRoRo[]| null
    post:number
}

