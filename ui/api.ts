import { LoginCode, type DeviceType, type ISP, type LoginRequest, type LoginResponse } from '../share/types.js'
import type { UserInfo } from './types.js';

// API响应接口
interface ApiResponse {
    success: boolean;
    msg: string;
    data?: any;
}

// API服务模块
export class ApiService {
    async login(userInfo: UserInfo): Promise<ApiResponse> {
        try {
            const url = 'http://localhost:8081/login';

            const loginRequest: LoginRequest = {
                account: userInfo.username,
                passwd: userInfo.password,
                device: this.parseDevice(userInfo.device),
                isp: userInfo.operator as ISP,
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: { "content-type": "application/json" },
                body: JSON.stringify(loginRequest)
            });

            const loginResponse: LoginResponse = await response.json()
            const res = { success: loginResponse.code > 0 ? false : true, msg: "可以冲浪了" }
            if (loginResponse.code == LoginCode.ERR_PASSWD_OR_ACCOUNT) {
                res.msg = "账户还是密码有问题"
            } else if (loginResponse.code == LoginCode.ERR_FAILED_ISP_BIND) {
                res.msg = "运营商不对头"
            }
            return res
        } catch (error) {
            console.error('登录API调用失败:', error);
            return {
                success: false,
                msg: '网络错误，请稍后重试'
            };
        }
    }

    parseDevice(device: string): DeviceType {
        switch (device) {
            case "mobile":
                return 1
            default:
                return 0
        }
    }

}

