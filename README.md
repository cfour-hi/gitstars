![Gitstars](docs/brand.png)

<div align="center">

[简体中文](./README.md) / [English](./README-EN.md)

一个用于整理、搜索和浏览 GitHub Stars 的仓库管理器。

</div>

## Gitstars 是什么

随着 Starred Repositories 不断增加，仅靠 GitHub 自带的列表很难快速找回某个项目。Gitstars 会同步你的公开 Stars，并按照 Topics 和编程语言进行整理，让搜索、筛选和回顾收藏仓库更简单。

Gitstars 还提供按编程语言分类的 GitHub 仓库排行榜，帮助你发现值得关注的开源项目。

## 功能

- **Your Stars**：同步并浏览当前 GitHub 账号的 Starred Repositories。
- **分类筛选**：根据 Topics 和主要编程语言自动归类。
- **快速搜索**：按开发者、仓库名称和描述查找项目。
- **灵活排序**：支持按 Star 时间或 Star 数量排序。
- **Gitstars Ranking**：查看不同编程语言的热门仓库 Top 100。
- **README 预览**：无需离开 Gitstars 即可阅读仓库 README。
- **仓库直达**：快速打开 GitHub 仓库或项目网站。
- **中英文界面**：可在页面中切换简体中文与英文。

## 界面预览

### Your Stars

按 Topics 和 Language 整理、搜索你的 Stars：

![Your Stars](docs/example-your-stars.png)

### Gitstars Ranking

按编程语言查看 GitHub 热门仓库：

![Gitstars Ranking](docs/example-github-ranking.png)

### Topics 与 Language

Topics 是仓库作者维护的主题标签，适合描述项目用途和技术领域：

![Topics](docs/example-topics.png)

Language 是 GitHub 根据仓库文件统计出的主要编程语言：

![Languages](docs/example-languages.png)

## Docker 本地部署

Docker 部署默认启用 HTTPS，推荐使用 [mkcert](https://github.com/FiloSottile/mkcert) 生成本机信任的开发证书。

### 环境要求

- Docker 与 Docker Compose
- mkcert
- GitHub OAuth App

### 1. 创建 GitHub OAuth App

打开 [GitHub Developer Settings](https://github.com/settings/developers)，新建一个 OAuth App，并填写：

| 配置项                     | 本地默认值               |
| -------------------------- | ------------------------ |
| Homepage URL               | `https://localhost:8080` |
| Authorization callback URL | `https://localhost:8080` |

回调地址必须与浏览器实际访问地址的**协议、主机和端口完全一致**。如果通过 `GITSTARS_PORT` 修改了 Docker 对外端口，GitHub OAuth App 的回调地址也必须使用相同端口。

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env`，填入 OAuth App 的 Client ID 和 Client Secret：

```dotenv
VITE_GITSTARS_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

GITSTARS_PORT=8080
GITSTARS_CERT_DIR=./.certs

# 容器运行用户（见下一步）
GITSTARS_UID=your_host_uid
GITSTARS_GID=your_host_gid
```

`GITSTARS_UID` 和 `GITSTARS_GID` 决定容器以哪个用户运行。开发私钥的权限为 `0600`，因此容器必须以当前宿主机用户运行才能读取它。用下面的命令取得数值，并把 `.env` 中的占位值改为对应输出：

```bash
id -u
id -g
```

### 3. 生成本地 HTTPS 证书

```bash
./scripts/setup-local-https.sh
```

脚本会通过 mkcert 安装本地开发 CA，并在 `.certs` 目录生成：

```text
.certs/localhost.pem
.certs/localhost-key.pem
```

证书覆盖 `localhost`、`127.0.0.1` 和 `::1`。`.certs` 已被 Git 和 Docker 构建上下文忽略，证书仅以只读方式挂载到运行容器中。

脚本会把 `localhost.pem` 设为 `0644`、`localhost-key.pem` 设为 `0600`，也就是只有当前用户能读取私钥。如果 `.env` 里的 `GITSTARS_UID`/`GITSTARS_GID` 与当前用户不一致，脚本会打印警告，并列出需要补进 `.env` 的确切值。

### 4. 构建并启动

```bash
docker compose up -d --build
```

启动完成后访问：

- Gitstars：[https://localhost:8080](https://localhost:8080)
- 健康检查：[https://localhost:8080/healthz](https://localhost:8080/healthz)

查看运行状态和日志：

```bash
docker compose ps
docker compose logs -f gitstars
```

停止服务：

```bash
docker compose down
```

## 环境变量

| 变量                      | 是否必填 | 默认值     | 说明                                                                           |
| ------------------------- | -------- | ---------- | ------------------------------------------------------------------------------ |
| `VITE_GITSTARS_CLIENT_ID` | 是       | —          | GitHub OAuth App Client ID；构建时写入前端静态资源                             |
| `GITHUB_CLIENT_SECRET`    | 是       | —          | GitHub OAuth App Client Secret；仅在容器运行时注入                             |
| `GITSTARS_PORT`           | 否       | `8080`     | 映射到宿主机的 HTTPS 端口                                                      |
| `GITSTARS_CERT_DIR`       | 否       | `./.certs` | 包含 `localhost.pem` 和 `localhost-key.pem` 的证书目录                         |
| `GITSTARS_UID`            | 否       | `1000`     | Docker 容器的运行 UID；应设为 `id -u`，否则无法读取 `0600` 的私钥              |
| `GITSTARS_GID`            | 否       | `1000`     | Docker 容器的运行 GID；应设为 `id -g`                                          |
| `VITE_API_PROXY`          | 否       | —          | 仅本地 `pnpm dev` 使用；把 `/api` 请求代理到的后端地址（例如已部署实例的 URL） |

修改 `VITE_GITSTARS_CLIENT_ID` 后必须重新构建镜像：

```bash
docker compose up -d --build
```

只修改 `GITHUB_CLIENT_SECRET` 时，重新创建容器即可：

```bash
docker compose up -d --force-recreate
```

## OAuth 常见问题

### `The redirect_uri is not associated with this application`

Gitstars 使用浏览器当前的 `location.origin` 作为 OAuth `redirect_uri`。请确认 GitHub OAuth App 中的 Authorization callback URL 与访问地址完全一致：

| 实际访问地址             | 正确的回调地址           |
| ------------------------ | ------------------------ |
| `https://localhost:8080` | `https://localhost:8080` |
| `https://127.0.0.1:8080` | `https://127.0.0.1:8080` |

以下内容均不能混用：

- `http` 与 `https`
- `localhost` 与 `127.0.0.1`
- 不同端口

回调地址应填写站点根地址，不要填写 `/api/oauth/access_token`。

### 浏览器提示证书不受信任

重新生成并安装本地证书，然后重启浏览器：

```bash
./scripts/setup-local-https.sh
```

Firefox 使用独立的证书库，必要时需要单独信任 mkcert 的本地 CA。

### 修改 Client ID 后仍然跳转到旧应用

Client ID 会在构建阶段写入前端文件，修改 `.env` 后需要带 `--build` 重新启动：

```bash
docker compose up -d --build
```

## 本地前端开发

本地开发需要 Node.js 20.19 或更高版本，以及 pnpm 12：

```bash
pnpm install
pnpm cert:local
pnpm dev
```

Vite 开发服务器默认运行在 `https://localhost:30000`，并使用与 Docker 相同的 `.certs` 证书目录。这个端口来自 Vite 开发配置，与 Docker 默认使用的 `8080` 无关。若需要代理 OAuth 接口，可通过 `VITE_API_PROXY` 指定后端服务地址。

开发服务器默认只监听 `localhost`，不会对所有网卡开放；需要局域网或真机调试时运行 `pnpm dev -- --host`。

常用命令：

| 命令                | 说明                         |
| ------------------- | ---------------------------- |
| `pnpm dev`          | 启动 Vite 开发服务器         |
| `pnpm build`        | 构建生产版本                 |
| `pnpm preview`      | 预览生产构建                 |
| `pnpm cert:local`   | 生成并信任本地 HTTPS 证书    |
| `pnpm format`       | 用 Prettier 格式化代码       |
| `pnpm format:check` | 检查代码格式（CI 使用）      |
| `pnpm lint`         | 运行 ESLint                  |
| `pnpm test`         | 运行 `tests/` 下的 Node 测试 |

## 代码质量

- `pnpm format` / `pnpm format:check`：Prettier + `prettier-plugin-tailwindcss` 负责格式化和 Tailwind 类名排序。
- `pnpm lint`：ESLint（`eslint.config.js`，包含 `eslint-plugin-vue` 的 essential 规则）。
- `pnpm test`：Node.js 内置测试运行器，测试位于 `tests/`。
- GitHub Actions（`.github/workflows/ci.yml`）会在 push 到 `main` 和 Pull Request 时依次执行格式检查、Lint、测试与构建。

## Vercel 部署

在 Vercel 项目中配置 `GITHUB_CLIENT_SECRET`（旧部署使用的 `VITE_GITSTARS_CLIENT_SECRET` 仍然兼容），并在构建环境中配置 `VITE_GITSTARS_CLIENT_ID`（前端构建时需要写入 Client ID）。其余步骤参阅 [Vercel 部署 Wiki](https://github.com/cfour-hi/gitstars/wiki/Vercel-%E9%83%A8%E7%BD%B2)。

## 技术栈

- Vue 3、Vite、Pinia
- Tailwind CSS
- GitHub REST API 与 OAuth
- Node.js HTTPS Server
- Docker Compose

## 安全说明

- `GITHUB_CLIENT_SECRET` 只注入运行容器，不会写入前端静态资源或最终镜像。
- 本地证书和私钥位于 `.certs`，不会提交到 Git，也不会进入 Docker 构建上下文。
- 本地私钥 `.certs/localhost-key.pem` 权限为 `0600`，公开证书 `.certs/localhost.pem` 为 `0644`；Docker Compose 通过 `user:` 以宿主机 UID/GID 运行容器，无需放宽私钥权限。
- OAuth Access Token 保存在浏览器 LocalStorage 中，请仅在可信设备上使用。
- 不要提交 `.env`、Client Secret 或本地证书私钥。

## 许可证

本项目基于 [MIT License](LICENSE) 发布。
