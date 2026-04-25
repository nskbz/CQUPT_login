
export type DeviceType = 0 | 1

export type ISP = "cmcc" | "telecom" | "unicom"

export interface LoginRequest {
    account: string
    passwd: string
    isp: ISP
    device: DeviceType
}

export interface LoginResponse {
    // 0 => success ; 
    // 1 => passwd or account error ;
    // 2 => failed to bind the isp ;
    code: 0 | 1 | 2
    msg: string
    data?: any
}