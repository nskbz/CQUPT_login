import { MyServer, LoginHandler } from "./server.js"
import { fileURLToPath } from 'url';
import * as path from 'path';

function main() {
    const filepath = fileURLToPath(import.meta.url); // 获取文件路径
    const workDir = path.resolve(filepath, "..", "..")
    console.log(`WorkDir: ${workDir}`)
    const publicDir = path.join(workDir, "public")
    const fp = new MyServer(8081, publicDir)
    fp.addHandler("/login", LoginHandler)
    fp.run()
}

main()

