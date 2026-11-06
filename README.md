# AIWorker Demo Application (`aiworker-demo-app`)

> 本仓库是由 **AIWorker (Pi Agent 协同研发平台)** 自动创建与管理的真实 GitHub 演示工程。
> `@ahtor wangrc`

## 仓库用途：验证 AIWorker 全流程自动化能力

1. **版本分支自动创建**：在 AIWorker 平台创建版本（如 `v1.0.0`、`v1.1.0`）时，AI Agent 自动基于 `main` 创建并推送 `release/v1.0.0`、`release/v1.1.0` 分支到本 GitHub 仓库。
2. **需求 `@AI` 方案共创与问题确认**：在平台创建需求并 `@AI`，AI 结合本仓库代码结构生成《需求实现方案》并记录待确认问题。
3. **需求分支自动创建与编码提交**：用户确认方案后，AI 自动从 `release/*` 分支切出 `feat/{version}-{reqCode}` 分支，编写代码、提交 Commit（含 `@author wangrc%` 署名）并推送至本 GitHub 仓库。
4. **本机验证与公网端口映射**：AI 启动本机服务并生成公网预览链接供用户验收。
5. **自动合并版本分支与部署 Skill**：验收通过后，AI 自动将 `feat/*` 分支合并回 `release/*` 分支并推送到 GitHub，随后触发部署 Skill。
