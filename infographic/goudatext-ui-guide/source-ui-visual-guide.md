# GoudaText 视觉 UI 规范

视觉定位：装甲档案系统。作品先于装饰，结构表达信息，高对比但有节制。

色彩：Armor Black `#090B0C`、Gunmetal `#1B2023`、Bone White `#F2F0E8`、Warning Yellow `#F4C430`、Signal Red `#E6462D`。

字体：GoudaRoboto。Black 900 用于品牌和标题，Bold 700 用于操作与编号，Regular 400 用于正文，Light 300 用于低优先级说明。

布局：桌面端 `116px` 左侧导轨；移动端 `68px` 顶部导航；响应式主断点为 `800px`；Gallery 主图比例 `627 / 769`。

页面：Hero、Profile、Gallery、Schedule、Detail。Hero 展示品牌与 Banshee Norn；Profile 使用黑白分区；Gallery 使用主图加六项索引；Schedule 使用黄色标题区和五条项目图；Detail 使用全屏图片流。

交互：滚轮、触摸、键盘切换章节；GSAP `0.8s`、`power3.inOut`；详情支持 Escape、焦点循环与焦点返回；支持 `prefers-reduced-motion`。

可访问性：`3px` 黄色焦点外框、图像替代文本、加载失败回退、详情语义、懒加载、无水平溢出。
