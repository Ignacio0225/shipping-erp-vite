
export interface TypeCategory {
    id: number;
    title:string;
    creator?:{
        id:number;
        username:string;
        email:string;
        role:string;

    };
}

export interface RegionCategory {
    id: number;
    title:string;
    creator?:{
        id:number;
        username:string;
        email:string;
        role:string;

    };
}