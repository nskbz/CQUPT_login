// API服务模块
export class ApiService {
    async login(userInfo) {
        try {
            const url = 'http://localhost:8081/login';
            const loginRequest = {
                account: userInfo.username,
                passwd: userInfo.password,
                device: this.parseDevice(userInfo.device),
                isp: userInfo.operator,
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { "content-type": "application/json" },
                body: JSON.stringify(loginRequest)
            });
            const loginResponse = await response.json();
            const res = { success: loginResponse.code > 0 ? false : true, msg: "可以冲浪了" };
            if (loginResponse.code == 1) {
                res.msg = "账户还是密码有问题";
            }
            else if (loginResponse.code == 2) {
                res.msg = "运营商对头不";
            }
            return res;
        }
        catch (error) {
            console.error('登录API调用失败:', error);
            return {
                success: false,
                msg: '网络错误，请稍后重试'
            };
        }
    }
    parseDevice(device) {
        switch (device) {
            case "mobile":
                return 1;
            default:
                return 0;
        }
    }
}
