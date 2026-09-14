---
layout: dense-modules
style: technical-schematic
aspect_ratio: "9:16"
language: zh
backend: image-gen-proxy
references:
  - ref_id: 01
    filename: 01-ref-hero.png
    usage: direct
  - ref_id: 02
    filename: 02-ref-profile.png
    usage: direct
  - ref_id: 03
    filename: 03-ref-gallery.png
    usage: direct
  - ref_id: 04
    filename: 04-ref-schedule.png
    usage: direct
---

生成一张专业、出版级的竖版中文 UI 视觉规范信息图。

画面比例 9:16，分辨率 2K。主题为“GoudaText 视觉 UI 规范”，副标题为“装甲档案系统 / WEB”。使用 dense-modules 高密度模块布局与 technical-schematic 工程规范风格，但必须完全服从 GoudaText 现有视觉身份，禁止使用蓝图蓝或通用科技蓝。

严格使用以下色板：装甲黑 #090B0C、枪铁灰 #1B2023、骨白 #F2F0E8、警示黄 #F4C430、信号红 #E6462D。背景以装甲黑和骨白分区，警示黄只用于主强调，信号红只用于次强调。无渐变、无霓虹、无发光球、无玻璃拟态、无卡通图标。

参考图是当前真实网站页面。保留其中机甲摄影、巨大粗黑字、硬朗分栏、细线框和黄黑对比的视觉语言。可以将参考页面作为清晰缩略图或裁切片段纳入信息图，不要重新设计或虚构页面，不要改变机体外观。

信息结构由七个清晰模块组成，使用精密对齐、尺寸标注线、细线框和小型坐标标签组织，但不要堆叠无意义装饰：

1. 核心概念：装甲档案系统；作品先于装饰；结构表达信息。
2. 色彩系统：展示五个色块与准确文本“#090B0C”“#1B2023”“#F2F0E8”“#F4C430”“#E6462D”。
3. 字体层级：准确展示“GoudaRoboto”“900 Black”“700 Bold”“400 Regular”“300 Light”。
4. 布局参数：准确展示“116px 桌面导轨”“68px 移动导航”“800px 主断点”“627 / 769 Gallery 比例”。
5. 页面系统：准确展示“Hero / Profile / Gallery / Schedule / Detail”。
6. 动效与操作：准确展示“滚轮 / 触摸 / 键盘”“GSAP 0.8s”“power3.inOut”“Reduced motion”。
7. 可访问性：准确展示“3px 黄色焦点”“Escape 关闭”“焦点循环”“焦点返回”“无水平溢出”。

标题必须是画面最醒目的文字：“GOUDA TEXT 视觉 UI 规范”。所有中文和英文标签必须清晰、正确、可读，不得生成乱码。正文保持短句，避免大段说明。使用真实 UI 截图承担主要视觉信息，文字只负责标注规则。整体应像高端模型工作室的工程归档海报，而不是 SaaS 仪表盘、游戏 HUD 或通用赛博朋克海报。
