import { ApiService } from './api.js';
import type { UserInfo } from './types.js';

// 登录功能模块
class LoginService {
    private apiService: ApiService;

    constructor() {
        this.apiService = new ApiService();
    }

    saveUserInfo(userInfo: UserInfo): void {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    getUserInfo(): UserInfo | null {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    clearUserInfo(): void {
        localStorage.removeItem('userInfo');
    }

    async login(userInfo: UserInfo): Promise<{ success: boolean; message: string }> {
        const result = await this.apiService.login(userInfo);
        if (result.data) { console.log(result.data) }
        return { success: result.success, message: result.msg }
    }
}

// 提示框模块
class Toast {
    static show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

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
    private loginService: LoginService;

    constructor() {
        this.loginService = new LoginService();
        this.init();
    }

    init(): void {
        this.loadSavedUserInfo();

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    loadSavedUserInfo(): void {
        const userInfo = this.loginService.getUserInfo();
        if (userInfo) {
            const usernameEl = document.getElementById('username') as HTMLInputElement;
            const passwordEl = document.getElementById('password') as HTMLInputElement;
            const operatorEl = document.getElementById('operator') as HTMLSelectElement;
            const deviceEl = document.getElementById('device') as HTMLSelectElement;
            const rememberEl = document.getElementById('remember') as HTMLInputElement;

            if (usernameEl) usernameEl.value = userInfo.username || '';
            if (passwordEl) passwordEl.value = userInfo.password || '';
            if (operatorEl) operatorEl.value = userInfo.operator || '';
            if (deviceEl) deviceEl.value = userInfo.device || '';
            if (rememberEl) rememberEl.checked = userInfo.remember || false;
        }
    }

    async handleSubmit(): Promise<void> {
        const usernameEl = document.getElementById('username') as HTMLInputElement;
        const passwordEl = document.getElementById('password') as HTMLInputElement;
        const operatorEl = document.getElementById('operator') as HTMLSelectElement;
        const deviceEl = document.getElementById('device') as HTMLSelectElement;
        const rememberEl = document.getElementById('remember') as HTMLInputElement;

        const username = usernameEl?.value || '';
        const password = passwordEl?.value || '';
        const operator = operatorEl?.value || '';
        const device = deviceEl?.value || '';
        const remember = rememberEl?.checked || false;

        const userInfo: UserInfo = {
            username,
            password,
            operator,
            device,
            remember,
        }

        if (remember) {
            this.loginService.saveUserInfo(userInfo);
        } else {
            this.loginService.clearUserInfo();
        }

        const result = await this.loginService.login(userInfo);

        Toast.show(result.message, result.success ? 'success' : 'error');
    }
}

// 初始化应用
new FormHandler();
