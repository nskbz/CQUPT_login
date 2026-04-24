import os from 'os'
import dns from 'dns/promises'
import * as net from 'net';
import type { AddressInfo } from 'net'

type Iface = {
    ip: string,
    mac: string,
}

export function getIfaces(): Iface[] {
    const networkInterfaces = os.networkInterfaces();

    const addresses: Iface[] = [];
    for (const name of Object.keys(networkInterfaces)) {
        for (const iface of networkInterfaces[name] || []) {
            // 跳过内部（loopback）和非IPv4地址
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({
                    ip: iface.address,
                    mac: iface.mac,
                });
            }
        }
    }

    return addresses
}

export async function checkNetReachable(): Promise<{ success: boolean, msg?: any }> {
    try {
        await dns.lookup('www.baidu.com');
        return { success: true };
    } catch (err) {
        return { success: false, msg: err }
    }
}

export function tcpProbe(port: number, host: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const connection = net.createConnection({ port: port, host: host }, () => {
            const addrInfo = connection.address() as AddressInfo | { address: "" }
            connection.end()
            resolve(addrInfo.address)
        });

        connection.on("error", (err) => {
            reject(err)
        })
    })
}