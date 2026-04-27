
export type DeviceType = 0 | 1

export type ISP = "cmcc" | "telecom" | "unicom"

export interface LoginRequest {
    account: string
    passwd: string
    isp: ISP
    device: DeviceType
}

// 0 => success ; 
// 1 => passwd or account error ;
// 2 => failed to bind the isp ;
export enum LoginCode {
    SUCCESS,
    ERR_PASSWD_OR_ACCOUNT,
    ERR_FAILED_ISP_BIND
}

export interface LoginResponse {
    code: LoginCode
    msg: string
    data?: any
}