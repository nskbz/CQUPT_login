import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { LoginCode, type LoginRequest, type LoginResponse } from '../share/types.js';
import { buildLoginRequest, login } from './login.js';
import * as mynet from "./net.js"

export type Method = "GET" | "POST"

export interface Handler {
    method: Method//该Handler支持的方法类型
    handle: (req: http.IncomingMessage, res: http.ServerResponse) => void
}

export class MyServer {
    private path: string//对外暴露的相对路径
    private public: string//实际存储的路径,绝对路径
    private server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

    private port: number
    private types: Map<string, string>
    private handlers: Map<string, Handler>

    constructor(port: number, staticPath: string, path?: string) {
        this.public = staticPath
        this.path = path ? path : ""//默认没路径 ''
        this.port = port

        this.types = new Map<string, string>()
        this.addMimeType(".html", "text/html")
        this.addMimeType(".css", "text/css")
        this.addMimeType(".js", "text/javascript")
        this.addMimeType(".ico", "image/ico")

        this.handlers = new Map<string, Handler>()
        this.addHandler("", { method: "GET", handle: this.fileProviderHandlerWrapper("index.html") })
        this.addHandler("/", { method: "GET", handle: this.fileProviderHandlerWrapper("index.html") })
        this.addHandler("/favicon.ico", { method: "GET", handle: this.fileProviderHandlerWrapper("favicon.ico") })

        this.server = this.createServer()
    }

    private createServer(): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {
        return http.createServer((req, res) => {
            // 1. 处理请求
            const url = req.url as string
            const handler = this.handlers.get(url)
            if (handler != undefined && handler.method === req.method) {
                handler.handle(req, res)
                return
            }


            // 2. 处理文件
            // 获取本地文件路径
            const { localPath, mimeType } = this.getLocalFileInfo(url)
            if (localPath == "") {
                res.writeHead(403, { "content-type": "text/html" }).end("<h2>403!</h2>")
                console.log(`ERR(${url}): ${mimeType}`)
                return
            } else if (mimeType == "") {
                res.writeHead(404, { "content-type": "text/html" }).end("<h2>404 not found!</h2>")
                console.log(`ERR(${url}): ${localPath}`)
                return
            }

            // 检查文件是否存在
            fs.access(localPath, fs.constants.F_OK, (err) => {
                if (err) {
                    res.writeHead(404, { "content-type": "text/html" }).end("<h2>404 not found!</h2>")
                    console.log(`ERR(${url}): ${err}`)
                    return
                }

                // 读取文件内容
                fs.readFile(localPath, (err, content) => {
                    if (err) {
                        res.writeHead(500).end("internal error happened!")
                        console.log(`ERR(${url}): ${err}`)
                        return;
                    }

                    // 成功返回文件内容
                    res.writeHead(200, { "content-type": mimeType }).end(content, 'utf-8');
                    console.log(`OK(${url}): handled!`)
                });
            })
        })
    }

    private getLocalFileInfo(url: string): { localPath: string, mimeType: string } {
        const extname = path.extname(url).toLowerCase();
        const mime = this.types.get(extname)

        if (mime == undefined) {
            return { localPath: "", mimeType: `don't support type => ${extname}` }
        }

        let prefix = ""
        if (this.path !== "") {
            prefix = path.sep.concat(this.path)// '/{this.path}'
        }

        // url去除{this.path}虚拟路径
        if (url.startsWith(prefix, 0)) {
            url = url.slice(prefix.length)
            return {
                localPath: path.join(this.public, url),
                mimeType: mime
            }
        }

        return { localPath: `unknown url => ${url}`, mimeType: "" }
    }

    // 添加文件服务支持的文件类型
    addMimeType(suffix: string, mime: string) {
        this.types.set(suffix, mime)
    }

    addHandler(url: string, handler: Handler) {
        this.handlers.set(url, handler)
    }

    run(): void {
        this.server.on("close", () => {
            console.log("Server has exited!")
        })
        this.server.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}/`);
        });
        process.on('SIGINT', () => {
            this.server.close()
        })
        process.on('SIGTERM', () => {
            this.server.close()
        })
    }

    fileProviderHandlerWrapper(filename: string) {
        return (req: http.IncomingMessage, res: http.ServerResponse) => {
            const url = req.url as string
            const filepath = path.join(this.public, filename)
            const extname = path.extname(filename).toLowerCase();
            const mime = this.types.get(extname)

            // 检查文件是否存在
            fs.access(filepath, fs.constants.F_OK, (err) => {
                if (err) {
                    res.writeHead(404, { "content-type": "text/html" }).end("<h2>404 not found!</h2>")
                    console.log(`ERR(${url}): ${err}`)
                    return
                }

                // 读取文件内容
                fs.readFile(filepath, (err, content) => {
                    if (err) {
                        res.writeHead(500).end("internal error happened!")
                        console.log(`ERR(${url}): ${err}`)
                        return;
                    }

                    // 成功返回文件内容
                    res.writeHead(200, { "content-type": mime }).end(content, 'utf-8');
                    console.log(`OK(${url}): handled!`)
                });
            })
        }
    }
}

export const LoginHandler: Handler = {
    method: "POST",
    handle: (req, res) => {
        const url = req.url as string
        if (req.headers['content-type'] != "application/json") {
            res.writeHead(403).end("only support mimetype(application/json)")
            console.log(`ERR(${url}): only support mimetype(application/json)`)
            return
        }

        let data = ""
        req.on("data", (chunk) => {
            data += chunk
        })

        req.on("end", async () => {
            try {
                const loginReq: LoginRequest = JSON.parse(data)
                //探测服务器是否正常工作
                const probeIp = await mynet.tcpProbe(801, "192.168.200.2")
                console.log(`has probed WLAN IP : ${probeIp}`)

                //找出WLAN IP对应MAC地址
                const ifaces = mynet.getIfaces()
                let ip: string = ""
                let mac: string = ""
                for (const i of ifaces) {
                    if (i.ip == probeIp) {
                        ip = i.ip
                        mac = i.mac
                        console.log(`use IP->MAC : ${ip} -> ${mac}`)
                        break
                    }
                }
                const req = buildLoginRequest(
                    loginReq.account,
                    loginReq.passwd,
                    loginReq.device,
                    loginReq.isp,
                    ip,
                    mac
                )
                const result = await login(req)
                const loginRes: LoginResponse = {
                    code: LoginCode.SUCCESS,
                    msg: "成功"
                }
                if (result.data?.result == 0 && result.data.ret_code == 1) {
                    loginRes.code = LoginCode.ERR_PASSWD_OR_ACCOUNT
                    if (result.data.msg == "unbind isp uid") {
                        loginRes.code = LoginCode.ERR_FAILED_ISP_BIND
                    }
                    loginRes.msg = "失败"
                }

                res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(loginRes))
                console.log(`OK(${url}): handled!`)
            } catch (err) {
                res.writeHead(500).end("internal error happened!")
                console.log(`ERR(${url}): ${err}`)
            }
        })
    }
}