# ymnotes

公开个人网站：https://ymnotes.github.io/ 。访客无需登录。

浅灰桌面和移动端页面；分类、标签和文章详情。内容仅来自工作台的已发布内容导出，不含草稿、原始输入或连接密钥。

## 手动同步

目前没有定时任务。对维护助手说“同步 ymnotes 网站”，由助手在本地读取后台的公开内容导出，运行生成器，核对结果并把 `_site` 复制到本仓库 `docs` 后推送。GitHub Pages 从 main 分支的 docs 目录发布。用户后台中的发布、编辑和撤回操作，在下一次手动同步成功后才对访客生效。

后台凭据仅用于本地读取原后台，不上传到 GitHub，不保存在仓库或 Actions secrets。导出端点只返回已发布内容；Notion 连接失败会中止生成，保留上次成功的网站。完整替换 docs 目录可以移除已撤回页面。

生成器只读取本地 `CONTENT_SNAPSHOT` 指向的 JSON 文件，不接收任何后台凭据。该文件结构为 `{list: {version: 1, name, bio, entries, next: null}, articles: [...]}`，由维护助手在完整读取 `/api/public-export` 列表与每篇正文后生成。列表需要遍历所有 cursor；详情读取失败时中止同步。公开源码可以审查，产物中只有 HTML/CSS/JS/图片。以后如需每天同步一次，再单独配置自动化与受限凭据。
