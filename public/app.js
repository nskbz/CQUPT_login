// 导入API服务
import ApiService from './api.js';

// 登录功能模块
class LoginService {
    constructor() {
        this.apiService = new ApiService();
    }

    // 保存用户信息到本地存储
    saveUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    // 从本地存储获取用户信息
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // 清除本地存储的用户信息
    clearUserInfo() {
        localStorage.removeItem('userInfo');
    }

    // 调用登录API
    async login(userInfo) {
        // 调用API服务的登录方法
        const result = await this.apiService.login(userInfo);
        return result;
    }
}

// 提示框模块
class Toast {
    static show(message, type = 'info') {
        // 创建提示框元素
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // 添加到文档
        document.body.appendChild(toast);
        
        // 显示提示框
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 3秒后隐藏提示框
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 表单处理模块
class FormHandler {
    constructor() {
        this.loginService = new LoginService();
        this.init();
    }

    init() {
        // 加载保存的用户信息
        this.loadSavedUserInfo();
        
        // 绑定表单提交事件
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    // 加载保存的用户信息
    loadSavedUserInfo() {
        const userInfo = this.loginService.getUserInfo();
        if (userInfo) {
            document.getElementById('username').value = userInfo.username || '';
            document.getElementById('password').value = userInfo.password || '';
            document.getElementById('operator').value = userInfo.operator || '';
            document.getElementById('device').value = userInfo.device || '';
            document.getElementById('remember').checked = userInfo.remember || false;
        }
    }

    // 处理表单提交
    async handleSubmit() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const operator = document.getElementById('operator').value;
        const device = document.getElementById('device').value;
        const remember = document.getElementById('remember').checked;

        const userInfo = {
            username,
            password,
            operator,
            device,
            remember
        };

        // 保存用户信息（如果勾选了记住我）
        if (remember) {
            this.loginService.saveUserInfo(userInfo);
        } else {
            this.loginService.clearUserInfo();
        }

        // 执行登录
        const result = await this.loginService.login(userInfo);
        
        // 显示登录结果
        Toast.show(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            // 登录成功后的处理，例如跳转到其他页面
            console.log('登录成功，用户信息：', userInfo);
        }
    }
}

// 初始化应用
new FormHandler();
