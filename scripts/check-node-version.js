// scripts/check-node-version.js
import semver from 'semver';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const { engines } = packageJson;

const currentVersion = process.version;
const requiredVersion = engines.node;

if (!semver.satisfies(currentVersion, requiredVersion)) {
  console.error(`
    ⚠️  Node.js 版本不兼容
    📋 当前版本: ${currentVersion}
    📦 要求版本: ${requiredVersion}
    
    🔧 请使用以下命令安装正确的 Node.js 版本:
    
    # 使用 nvm 安装指定版本
    nvm install ${requiredVersion}
    nvm use ${requiredVersion}
    
    # 或者使用 nvm 自动根据 .nvmrc 文件切换
    nvm use
  `);
  process.exit(1);
}

console.log('✅ Node.js 版本检查通过');