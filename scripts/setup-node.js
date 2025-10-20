
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import readline from 'readline';


const REQUIRED_VERSION = '20.19.1';

class NodeSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async runCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        stdio: 'inherit',
        ...options 
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error };
    }
  }

  async runBashCommand(command) {
    return this.runCommand(command, { shell: '/bin/bash' });
  }

  async checkNVM() {
    console.log('🔍 检查 nvm 是否已安装...');
    
    try {
      execSync('command -v nvm', { stdio: 'ignore', shell: '/bin/bash' });
      console.log('✅ nvm 已安装');
      return true;
    } catch {
      console.log('❌ nvm 未安装');
      return false;
    }
  }

  async installNVM() {
    console.log('📥 开始安装 nvm...');
    
    const answer = await this.question('是否自动安装 nvm？(y/N): ');
    
    if (answer.toLowerCase() !== 'y') {
      console.log(`
        📝 请手动安装 nvm:
        
        # 使用 curl
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # 或者使用 wget
        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        安装完成后，请重新打开终端并再次运行此脚本。
      `);
      return false;
    }

    try {
      // 安装 nvm
      await this.runBashCommand('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash');
      console.log('✅ nvm 安装成功');
      return true;
    } catch (error) {
      console.error('❌ nvm 安装失败:', error);
      return false;
    }
  }

  async installNodeVersion() {
    console.log(`🔧 安装 Node.js v${REQUIRED_VERSION}...`);
    
    try {
      // 使用 nvm 安装指定版本
      await this.runBashCommand(`nvm install ${REQUIRED_VERSION}`);
      console.log(`✅ Node.js v${REQUIRED_VERSION} 安装成功`);
      return true;
    } catch (error) {
      console.error(`❌ Node.js v${REQUIRED_VERSION} 安装失败:`, error);
      return false;
    }
  }

  async switchToNodeVersion() {
    console.log(`🔄 切换到 Node.js v${REQUIRED_VERSION}...`);
    
    try {
      // 切换到指定版本
      await this.runBashCommand(`nvm use ${REQUIRED_VERSION}`);
      
      // 设置为默认版本
      await this.runBashCommand(`nvm alias default ${REQUIRED_VERSION}`);
      
      console.log(`✅ 已切换到 Node.js v${REQUIRED_VERSION}`);
      return true;
    } catch (error) {
      console.error(`❌ 切换到 Node.js v${REQUIRED_VERSION} 失败:`, error);
      return false;
    }
  }

  async verifyNodeVersion() {
    try {
      const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
      if (nodeVersion === `v${REQUIRED_VERSION}`) {
        console.log(`✅ 版本验证成功: ${nodeVersion}`);
        return true;
      } else {
        console.log(`❌ 版本验证失败: 当前 ${nodeVersion}, 期望 v${REQUIRED_VERSION}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 无法验证 Node.js 版本:', error);
      return false;
    }
  }

  async setup() {
    console.log(`🎯 目标: 安装并切换到 Node.js v${REQUIRED_VERSION}`);
    
    // 检查 nvm
    const hasNVM = await this.checkNVM();
    
    if (!hasNVM) {
      const installed = await this.installNVM();
      if (!installed) {
        this.rl.close();
        return;
      }
    }
    
    // 安装 Node.js
    const installed = await this.installNodeVersion();
    if (!installed) {
      this.rl.close();
      return;
    }
    
    // 切换到指定版本
    const switched = await this.switchToNodeVersion();
    if (!switched) {
      this.rl.close();
      return;
    }
    
    // 验证版本
    await this.verifyNodeVersion();
    
    // 创建 .nvmrc 文件
    fs.writeFileSync('.nvmrc', REQUIRED_VERSION);
    console.log('📁 已创建 .nvmrc 文件');
    
    console.log(`
🎉 环境设置完成！

当前版本信息:
Node.js: ${execSync('node -v', { encoding: 'utf8' }).trim()}
npm: ${execSync('npm -v', { encoding: 'utf8' }).trim()}

💡 使用提示:
1. 在当前终端已自动切换到 v${REQUIRED_VERSION}
2. 新开终端时，在项目目录运行: nvm use
3. 或配置 shell 自动加载 .nvmrc
    `);
    
    this.rl.close();
  }
}

// 运行安装
new NodeSetup().setup().catch(console.error);