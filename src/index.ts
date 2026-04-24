import { login, buildLoginRequest } from "./login.js"
import * as mynet from "./net.js"
import { MyServer, LoginHandler } from "./server.js"


async function main() {
    const accout = "3126560"
    const passwd = "Sl18208122026."
    const dt = 1
    const isp = "unicom"

    try {
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
            accout, passwd, dt, isp, ip, mac
        )
        const res = await login(req)
        console.log(res)
    } catch (err) {
        console.log(err)
        return
    }
}

// main()

const fp = new MyServer(8081, "/home/sun/github/CQUPT_login/public")
fp.addHandler("/login", LoginHandler)
fp.run()

