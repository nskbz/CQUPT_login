import http from 'http'
import type { DeviceType, ISP } from '../share/types.js'

// result=0 & ret_code=1 : 密码或账户错误
// result=0 & ret_code=2 : 已经登陆
// result=1 : 登陆成功
type LoginResponse = {
    status: number,
    data?: {
        result: number,
        msg: string,
        ret_code?: number
    }
}

interface LoginRequest {
    account: string
    passwd: string
    dt: DeviceType
    isp: ISP
    ip: string
    mac: string
}

export function buildLoginRequest(
    account: string,
    passwd: string,
    dt: DeviceType,
    isp: ISP,
    ip: string,
    mac: string
): LoginRequest {
    const sevenDigitRegex = /^\d{7}$/
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4})$|^([0-9A-Fa-f]{12})$/


    if (!sevenDigitRegex.test(account)) {
        throw new Error("统一认证码应当为7位数字!")
    }
    if (!ipRegex.test(ip)) {
        throw new Error("IP格式有误!")
    }
    if (!macRegex.test(mac)) {
        throw new Error("MAC格式有误!")
    }

    return {
        account: account,
        passwd: passwd,
        dt: dt,
        isp: isp,
        ip: ip,
        mac: mac
    }
}

export function login(params: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
        let url = `http://192.168.200.2:801/eportal/`
            + `?c=Portal&a=login&callback=dr1003&login_method=1`
            + `&user_account=%2C${params.dt}%2C${params.account}%40${params.isp}&user_password=${params.passwd}`
            + `&wlan_user_ip=${params.ip}&wlan_user_mac=${params.mac}`

        const req = http.request(url, (response) => {
            let data = ""
            response.on("data", (chunk) => {
                data += chunk
            })

            response.on("end", () => {
                //解析JSON数据
                const jsonpData = data.trim();
                let parsedData;

                try {
                    const jsonMatch = jsonpData.match(/dr1003\((.*)\)/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedData = JSON.parse(jsonMatch[1]);
                    } else {
                        // 如果不是预期的JSONP格式，尝试直接解析
                        parsedData = JSON.parse(jsonpData);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                    return;
                }

                //处理base64编码
                const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
                const msg: string = parsedData.msg.trim()
                if (base64Regex.test(msg)) {
                    parsedData.msg = Buffer.from(msg, "base64").toString("utf-8")
                }

                resolve({
                    status: response.statusCode || 0,
                    data: parsedData
                });
            })
        })

        req.on("error", reject)

        req.end()
    })
}
