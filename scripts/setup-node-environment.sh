#!/bin/bash
# setup-node-environment.sh

set -e

# 配置变量
REQUIRED_NODE_VERSION="20.19.1"
NVM_VERSION="v0.39.0"
SHELL_PROFILE="${HOME}/.bashrc"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查当前 Node.js 版本
check_current_node_version() {
    if command -v node > /dev/null 2>&1; then
        CURRENT_NODE_VERSION=$(node -v)
        log_info "当前 Node.js 版本: $CURRENT_NODE_VERSION"
        
        if [ "$CURRENT_NODE_VERSION" = "v$REQUIRED_NODE_VERSION" ]; then
            log_success "Node.js 版本已经是所需的 v$REQUIRED_NODE_VERSION"
            return 0
        else
            log_warning "当前 Node.js 版本 ($CURRENT_NODE_VERSION) 与所需版本 (v$REQUIRED_NODE_VERSION) 不匹配"
            return 1
        fi
    else
        log_warning "未检测到 Node.js 安装"
        return 1
    fi
}

# 检查 nvm 是否已安装
check_nvm_installed() {
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        if command -v nvm > /dev/null 2>&1; then
            log_success "nvm 已安装"
            return 0
        fi
    fi
    return 1
}

# 安装 nvm
install_nvm() {
    log_info "开始安装 nvm..."
    
    # 检测 curl 或 wget
    if command -v curl > /dev/null 2>&1; then
        log_info "使用 curl 安装 nvm..."
        curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
    elif command -v wget > /dev/null 2>&1; then
        log_info "使用 wget 安装 nvm..."
        wget -qO- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
    else
        log_error "未找到 curl 或 wget，请先安装其中之一"
        exit 1
    fi

    # 加载 nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

    # 验证安装
    if command -v nvm > /dev/null 2>&1; then
        log_success "nvm 安装完成"
    else
        log_error "nvm 安装失败，请手动安装:"
        log_info "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh | bash"
        exit 1
    fi
}

# 配置 shell 环境
setup_shell_profile() {
    local profile_content='
# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
'

    # 检查是否已配置
    if grep -q "NVM_DIR" "$SHELL_PROFILE" 2>/dev/null; then
        log_info "nvm 配置已存在于 $SHELL_PROFILE"
    else
        log_info "将 nvm 配置添加到 $SHELL_PROFILE"
        echo "$profile_content" >> "$SHELL_PROFILE"
        log_success "nvm 配置已添加到 $SHELL_PROFILE"
    fi

    # 重新加载配置
    source "$SHELL_PROFILE"
}

# 使用 nvm 安装指定版本的 Node.js
install_node_with_nvm() {
    log_info "正在安装 Node.js v$REQUIRED_NODE_VERSION..."
    
    # 确保 nvm 已加载
    source "$HOME/.nvm/nvm.sh"
    
    # 安装指定版本
    if nvm install "$REQUIRED_NODE_VERSION"; then
        log_success "Node.js v$REQUIRED_NODE_VERSION 安装成功"
    else
        log_error "Node.js v$REQUIRED_NODE_VERSION 安装失败"
        log_info "尝试安装相近的版本..."
        nvm install --lts
        return 1
    fi

    # 设置为默认版本
    if nvm alias default "$REQUIRED_NODE_VERSION"; then
        log_success "已设置 Node.js v$REQUIRED_NODE_VERSION 为默认版本"
    fi

    return 0
}

# 切换到指定 Node.js 版本
switch_to_node_version() {
    log_info "正在切换到 Node.js v$REQUIRED_NODE_VERSION..."
    
    # 确保 nvm 已加载
    source "$HOME/.nvm/nvm.sh"
    
    # 切换到指定版本
    if nvm use "$REQUIRED_NODE_VERSION"; then
        log_success "已切换到 Node.js v$REQUIRED_NODE_VERSION"
        return 0
    else
        log_error "切换到 Node.js v$REQUIRED_NODE_VERSION 失败"
        return 1
    fi
}

# 验证当前使用的 Node.js 版本
verify_node_version() {
    source "$HOME/.nvm/nvm.sh"
    CURRENT_NODE_VERSION=$(node -v)
    
    if [ "$CURRENT_NODE_VERSION" = "v$REQUIRED_NODE_VERSION" ]; then
        log_success "✅ 验证通过: 当前 Node.js 版本为 v$REQUIRED_NODE_VERSION"
        return 0
    else
        log_error "❌ 版本验证失败: 当前版本为 $CURRENT_NODE_VERSION，期望版本为 v$REQUIRED_NODE_VERSION"
        log_warning "请手动执行: nvm use $REQUIRED_NODE_VERSION"
        return 1
    fi
}

# 创建 .nvmrc 文件
create_nvmrc() {
    echo "$REQUIRED_NODE_VERSION" > .nvmrc
    log_success "已创建 .nvmrc 文件，指定版本为 $REQUIRED_NODE_VERSION"
}

# 显示使用说明
show_usage_instructions() {
    log_info "
📋 使用说明:

1. 在当前终端立即使用指定版本:
   nvm use $REQUIRED_NODE_VERSION

2. 在项目目录中自动使用正确版本:
   nvm use

3. 设置终端启动时自动使用 .nvmrc 版本:
   在您的 shell 配置文件中添加:
   - 对于 bash: 在 ~/.bashrc 中添加: 
     [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
     [ -f .nvmrc ] && nvm use

   - 对于 zsh: 在 ~/.zshrc 中添加:
     [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
     [ -f .nvmrc ] && nvm use

4. 验证当前版本:
   node -v
   "
}

# 主函数
main() {
    log_info "开始设置 Node.js 开发环境..."
    log_info "目标版本: Node.js v$REQUIRED_NODE_VERSION"
    
    # 检查是否已是所需版本
    if check_current_node_version; then
        log_success "无需更改，Node.js 版本已符合要求"
        create_nvmrc
        exit 0
    fi
    
    # 检查并安装 nvm
    if ! check_nvm_installed; then
        log_warning "nvm 未安装，开始安装..."
        install_nvm
        setup_shell_profile
    else
        log_success "nvm 已安装"
    fi
    
    # 安装 Node.js
    if install_node_with_nvm; then
        # 切换到指定版本
        if switch_to_node_version; then
            # 验证版本
            verify_node_version
            create_nvmrc
            show_usage_instructions
            
            log_success "🎉 Node.js 环境设置完成！"
            log_info "当前 Node.js 版本: $(node -v)"
            log_info "当前 npm 版本: $(npm -v)"
            log_success "立即启动项目: $(npm run dev)"
        else
            log_error "无法切换到指定 Node.js 版本"
            exit 1
        fi
    else
        log_error "Node.js 环境设置失败"
        exit 1
    fi
}

# 执行主函数
main "$@"