# GitHub汉化脚本

把 GitHub 网页界面汉化成中文的用户脚本（userscript），适用于 **篡改猴 / Tampermonkey**、**Violentmonkey**、**Greasemonkey** 等支持 `@require` 的脚本管理器。

- 覆盖新版 GitHub **React 顶栏**（Code / Issues / Pull requests / Actions / Projects / Security and quality / Insights / Settings / Agents …）
- 覆盖仓库页、议题、拉取请求、发布、设置、通知等主要页面
- 采用**页面级词库 + 忽略规则**，不会误翻仓库名、文件名、代码与 Markdown 正文
- 支持 GitHub 的 Turbo 局部导航（切页面不用刷新也能继续汉化）

## 安装

| 方式 | 链接 | 说明 |
| --- | --- | --- |
| GreasyFork | 上架后填写 | 推荐，自动更新 |
| GitHub Raw | `https://raw.githubusercontent.com/FVsonar/github-chinese/main/main.user.js` | 篡改猴会弹出安装页 |
| 自包含版 | [`dist/github-chinese-selfcontained.user.js`](dist/github-chinese-selfcontained.user.js) | 词库已内联，**不依赖任何 CDN / raw.githubusercontent**，适合网络受限环境 |
| 离线包 | [Releases · v1.0.0](https://github.com/FVsonar/github-chinese/releases/download/v1.0.0/github-chinese-selfcontained.user.js) | 直接下载 .user.js，双击/拖入浏览器安装 |

> 两个版本 **二选一** 即可（`@name` + `@namespace` 相同，先装矮的再装胖的会直接覆盖升级，不会重复）。

### 国内网络提示

标准版通过 `@require` 拉取词库，地址为 GreasyFork 认可的 CDN：

```
https://cdn.jsdelivr.net/gh/FVsonar/github-chinese@2f05f22605f7fb3c51fc1f3082fc8c36cd3ddb15/locals.js
```

> `@require` 的地址格式很挑：[GreasyFork 认可的 CDN](https://greasyfork.org/en/help/cdns) 里，
> jsDelivr 的 GitHub 来源**只允许 `gh/<user>/<repo>@<40 位 commit SHA>` 这一种形式**——
> 用 `@main`、`@v1.0.0` 这类分支/tag 形式会被直接拒收（`raw.githubusercontent.com` 更不在名单内）。
> 该 SHA 写在 `build.mjs` 的 `LOCALS_REF`，构建时会校验它对应的 commit 里就是当前的 `locals.js`。

如果 CDN 不可达，请改用**自包含版**：词库已经写进脚本本体，断网也能汉化。

## 功能开关

安装后在 GitHub 页面点击脚本管理器图标，可以看到菜单命令（由脚本注册），用于切换部分翻译行为、查看/清空本地缓存。

## 目录结构

```
.
├── main.user.js                              # 构建产物：上架用（@require 词库，约 63 KB）
├── dist/
│   └── github-chinese-selfcontained.user.js  # 构建产物：自包含版（约 2 MB）
├── locals.js                                 # 词库（来自上游，GPL-3.0）
├── src/
│   └── main.user.js                          # 上游引擎源码（原始 userscript，构建时取其脚本体）
├── build.mjs                                 # 构建脚本：node build.mjs
├── CHANGELOG.md
└── LICENSE                                   # GPL-3.0
```

## 构建

```sh
node build.mjs
```

会重新生成 `main.user.js` 与 `dist/github-chinese-selfcontained.user.js`，并对两个产物执行 `node --check` 语法校验。

## 发布

**GitHub**

1. 新建仓库（本目录即仓库根），推送到 `main` 分支；
2. 因为 `main.user.js` 里的 `@require` / `@downloadURL` 指向
   `https://raw.githubusercontent.com/FVsonar/github-chinese/main/...`，
   仓库名/用户名或分支名不同的话，改 `build.mjs` 顶部的 `REPO` / `RAW` 后重新构建；
3. 打 tag 并上传 `dist/github-chinese-selfcontained.user.js` 作为 Release 附件。

**GreasyFork**

1. 先打好与 `@version` 同名的 tag（如 `v1.0.0`）并推送，**因为 `@require` 指向的就是这个 tag**；
2. 打开 <https://greasyfork.org/zh-CN/scripts/new>，粘贴 `main.user.js` 的内容（**不要**贴自包含版，2 MB 体积大且不利于审核）；
3. “附加信息 → 源地址” 填 `https://github.com/FVsonar/github-chinese`，即可开启 GitHub 同步自动更新；
4. 由于同时发布了 GitHub 仓库，建议在描述里同时给出两个安装入口。

> 注意事项：
> - `@require` 必须指向 GreasyFork [认可的 CDN](https://greasyfork.org/en/help/cdns)，且 jsDelivr 的 GitHub 来源必须是 commit SHA 形式；
> - **词库更新时**：改完 `locals.js` 先提交拿到 commit SHA，把 `build.mjs` 的 `LOCALS_REF` 换成它，再 `node build.mjs`、`git commit`、打新 tag；
> - 不要在 GreasyFork 上放体积接近 2 MB 的自包含版（会被拒或触发人工审核）。

## 上游与致谢

本项目的**引擎与全部词条**来自下列开源项目，遵循 **GPL-3.0** 许可：

- [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese) — 沙漠之子（维护者）
- 原项目作者：楼教主（<http://www.52cik.com/>）

词库版本：`1.9.4.4-2026-09-11`。本仓库只做了打包方式的调整（自包含构建、构建脚本、发布整理）与少量元数据修改；**翻译内容不是本项目作者的原创劳动**，请在再分发时保留上游署名与 GPL-3.0 许可。

## 许可证

[GPL-3.0](LICENSE)
