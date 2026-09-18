# ymnotes

公开个人网站：https://ymnotes.github.io/ 。访客无需登录。

浅灰桌面和移动端页面；分类、标签和文章详情。内容仅来自工作台的已发布内容导出，不含草稿、原始输入或连接密钥。

目前仅手动同步：在 Actions 中选择 “Sync published notes and deploy Pages”，点击 Run workflow。修改源码推送也会部署。没有定时任务，以后可改为每天一次。撤回/修改要等下一次成功部署才生效。上游失败会中止部署并保留旧版，不会用空列表覆盖网站。

仓库变量 `CONTENT_EXPORT_URL` 指向受保护的发布内容导出端点，密钥 `CONTENT_EXPORT_TOKEN` 只放 GitHub Actions secrets。输出只包含静态 HTML、CSS、JS 和图片。后台单独托管。
