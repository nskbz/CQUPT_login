// API服务模块
class ApiService {
    // 登录API调用
    async login(userInfo) {
        try {
            // 这里可以替换为实际的远程服务器URL
            const url = 'http://localhost:8081/login';

            // 构建请求参数
            const formData = new FormData();
            formData.append('username', userInfo.username);
            formData.append('password', userInfo.password);
            formData.append('operator', userInfo.operator);
            formData.append('device', userInfo.device);

            // 发送POST请求
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            // 解析响应
            const data = await response.json();

            // 返回响应数据
            return data;
        } catch (error) {
            console.error('登录API调用失败:', error);
            // 失败时返回错误信息
            return {
                success: false,
                message: '网络错误，请稍后重试'
            };
        }
    }
}

export default ApiService;
