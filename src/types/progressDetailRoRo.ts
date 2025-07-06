//src/type/progressDetailRoRo.ts


import type {User} from "./user.ts";

export type ProgressDetailRoRo = {
    id: string;
    BKNo?: number | null
    LINE?: string[] | null
    VESSEL?: string[] | null
    DOC?: string[] | null
    PARTNER?: string | null
    ETA?: string | null
    ETD?: string | null
    PAYMENT?: string | null

    ATD?: string | null
    SHIPPER?: string | null
    DESTINATION?: string | null
    SMALL?: number | null
    BUY_SMALL?: number | null
    S_SUV?: number | null
    BUY_S_SUV?: number | null
    SUV?: number | null
    BUY_SUV?: number | null
    RV_CARGO?: number | null
    BUY_RV_CARGO?: number | null
    SPECIAL?: number | null
    BUY_SPECIAL?: number | null
    CBM?: number | null
    BUY_CBM?: number | null
    SELL?: number | null
    HC?: number | null
    WFG?: number | null
    SECURITY?: number | null
    CARRIER?: number | null
    PARTNER_FEE?: number | null
    OTHER?: number | null
    RATE?: number | null
    PROFIT_USD?: number | null
    PROFIT_KRW?: number | null
    created_at?: string
    updated_at?: string | null
    creator?: User
    progress_detail_roro_detail?: {
        id: string;
        MODEL?: string | null
        CHASSISNo?: string | null
        EL?: boolean | null
        HBL?: string | null
    } | null

}

