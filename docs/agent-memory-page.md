# Agent Memory 专题页维护

- 正文：`source/_posts/agent-memory.md`，继续用 Markdown 二、三级标题维护目录。
- 地址：`/technological_blog/agent-memory/`，由文章的 `permalink` 固定。
- 入口：首页自动生成文章卡片；顶部 `Agent Memory` 菜单配置在 `_config.butterfly.yml`。
- 图片：`source/images/agent-memory/`，3 张本站绘制的 SVG 概念图，正文写有图注和替代文本。
- 样式：`source/css/agent-memory.css`，通过 `#agent-memory-guide` 标识限定于此文章。
- 交互：`source/js/agent-memory.js`，复用 Hexo 生成的目录建立移动端折叠目录，修正标题跳转间距。桌面目录和原始图文不依赖此脚本生成。

桌面端左侧为固定分层目录，右侧为图文正文。手机端使用正文前的折叠目录，同时保留主题自带的悬浮目录。保留现有文章和 Butterfly 源码，未增加 npm 依赖。

内容以 2023—2025 年代表工作为入门阅读路线，引用原论文，工程建议不当作论文实验结论。补充论文时同步维护发布日期、参考资料和首页摘要中的计数。

验证命令：

```bash
npm install
npm run build
node --check source/js/agent-memory.js
git diff --check
npm run server
```

发布沿用现有 GitHub Actions：推送 `main` 后构建并部署 `public/`。不提交构建产物。
