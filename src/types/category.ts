
export interface Category {
    id: number;
    title:string;
    creator?:{
        id:number;
        username:string;
        email:string;
        role:string;

    };
}

