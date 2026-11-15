# 03 · 技术设计

**目标：** 在小米电视上以 APK 形式运行，完全离线，遥控器可完成所有操作，画面由原创 SVG 构成。
**原则：** 小包体、低依赖、可降级、先真机验证、可维护的内容与引擎分离。

---

## 1. 技术选型

| 层 | 方案 | 理由 |
|---|---|---|
| 应用外壳 | 原生 Android（Kotlin，单 Activity） | 启动快、全屏/遥控/音频/存储可控，APK 小 |
| 画面层 | WebView + HTML/CSS/TypeScript + 内嵌 SVG | SVG 表现力和迭代效率最好；不需要渲染 3D |
| 构建 | Gradle + Vite/TypeScript | 标准 Android 工具链；Web 资源独立构建 |
| 状态与存档 | 原生 SharedPreferences（JSON） | 比 WebView localStorage 更稳，卸载可清除 |
| 音频 | 内嵌 OGG 语音/音乐 + Web Audio/原生音频焦点 | 离线；不依赖系统 TTS 才可用 |
| 联网 | **不申请 INTERNET 权限** | 儿童安全与隐私底线；也消除外部资源风险 |
| 分发 | Debug 签名 APK 侧载 | 先验证，不背上架资质负担 |

**不选 Flutter/Unity/Cocos 的原因：** 首版是 2D 关卡游戏，画面以 SVG 为主；引入游戏引擎会显著增加包体、构建复杂度和低端电视适配成本。WebView 的主要风险（旧内核、遥控事件）可以通过保守实现和真机测试控制。

---

## 2. 总体架构

```
┌────────────────────────────────────────────────────┐
│ Android APK                                         │
│                                                    │
│  MainActivity (Kotlin)                              │
│   ├─ 全屏沉浸 / 横屏 / 屏幕常亮 / 音频焦点            │
│   ├─ dispatchKeyEvent → 统一遥控键 → evaluateJavascript│
│   ├─ WebViewAssetLoader → https://appassets/...     │
│   ├─ @JavascriptInterface: load/save/exit/ready      │
│   └─ 加载失败 / 渲染进程崩溃 → 原生兜底页             │
│                                                    │
│   WebView                                           │
│   └─ 离线前端 (HTML/CSS/TS)                         │
│       ├─ 状态机 + 屏幕路由                           │
│       ├─ 焦点引擎（roving focus / 去重 / 转场锁）     │
│       ├─ 关卡数据 + 出题/提示/计分                    │
│       ├─ SVG 场景渲染 + CSS 动画                     │
│       ├─ 语音/音乐/音效 + 字幕                       │
│       └─ 存档适配层（原生桥优先，localStorage 兜底）   │
└────────────────────────────────────────────────────┘
```

- WebView 只加载 APK 内的静态资源，不接受用户输入 URL，不允许外部跳转。
- 原生层只做“壳”和系统能力，不承载游戏逻辑；游戏逻辑可独立在浏览器测试。
- 原生层与前端通过一个很小的、固定协议通信，避免 WebView 与 Android 代码耦合。

---

## 3. Android 壳设计

### 3.1 工程与版本基线

- 包名：`com.jolly.numberisland`（工作名，发布后不改）
- 应用名：`数字岛大冒险`（5 个汉字，符合小米 ≤9 个汉字的要求）
- `minSdk 23`（Android 6.0），`targetSdk 34`，`compileSdk 35`
- 语言：Kotlin；单 Activity；不引入 UI 框架（不用 AppCompat/Material）
- 依赖尽量少：`androidx.webkit`（WebViewAssetLoader）、Kotlin 标准库
- 构建：AGP 8.x + Gradle 8.x + JDK 17

当前机器状态：

- Node.js v24.15.0 / npm 11.12.1：可用
- JDK 17.0.20：已安装，但默认 `java` 仍指向 1.8；构建时需要显式 `JAVA_HOME`
- Android SDK、adb：未安装
- 小米电视：未连接

**动工前准备：** 安装 Android command-line tools、platform-tools、`platforms;android-35`、`build-tools;35.0.0`，并接受 SDK licenses；把 `local.properties` 指向 SDK。所有工具安装与真机连接都会在开始编码时单独说明。

### 3.2 AndroidManifest 设计

- 声明电视特性：
  ```xml
  <uses-feature android:name="android.hardware.type.television"
                android:required="true" />
  ```
- 不声明 `INTERNET` 权限。
- `MainActivity`：
  - `android:screenOrientation="landscape"`
  - `android:exported="true"`
  - `android:configChanges="keyboard|keyboardHidden|navigation|orientation|screenSize|screenLayout|smallestScreenSize|uiMode|density"`
  - `android:resizeableActivity="false"`（游戏不做多窗口）
- 启动入口优先使用 `android.intent.category.LAUNCHER`，确保小米电视桌面能显示；是否额外声明 `LEANBACK_LAUNCHER` 由真机验证决定，避免出现两个桌面图标（小米规范要求最多一个快捷方式）。
- `android:allowBackup="false"`；不需要的权限一律不申请。
- 主题背景用品牌奶油色，避免启动白屏闪烁；图标由 SVG 品牌图形导出为启动图标资源（180×180 xhdpi 与商店 512×512 的直角图标），源文件保留为 SVG。

### 3.3 Activity 生命周期

- 进入：设置沉浸式全屏、隐藏系统栏、保持屏幕常亮、请求音频焦点（`AUDIOFOCUS_GAIN`）。
- `onPause` / 失焦：通过 JS 发送 `pause`，暂停语音、音乐、动画和计时；释放音频焦点。
- `onResume`：发送 `resume`，显示暂停层，等待用户按 OK 继续；不自动恢复音频，避免突然出声。
- `onDestroy`：移除 Handler 回调、销毁 WebView、释放音频焦点。
- Home 键切后台：由系统处理；应用自动暂停，回来时恢复当前题目，不丢进度。

### 3.4 WebView 配置

- 使用 `WebViewAssetLoader` + `AssetsPathHandler`，加载：
  ```
  https://appassets.androidplatform.net/assets/www/index.html
  ```
- 关键设置：
  - JavaScript 开启，DOM Storage 开启
  - `allowFileAccess = false`，`allowContentAccess = false`
  - `allowFileAccessFromFileURLs = false`，`allowUniversalAccessFromFileURLs = false`
  - `mixedContentMode = NEVER_ALLOW`
  - 禁止缩放、禁止滚动条、背景色与品牌底色一致
  - `mediaPlaybackRequiresUserGesture = false`（首页欢迎语音需要）
  - 调试 WebView 只在 debug 构建开启；release 关闭
- 导航拦截：
  - `shouldOverrideUrlLoading` 只允许 `appassets.androidplatform.net`，其余全部拦截。
  - 由于没有 INTERNET 权限，网络本身不可用；仍做 URL 白名单，防止未来误加外链。
- 渲染兜底：
  - 主文档加载超时（约 10 秒）或 `onReceivedError` → 原生错误页，提供“重试”和“退出”，且保持遥控器可达。
  - `onRenderProcessGone` 时安全重建 WebView 一次；再次失败进入错误页而不是崩溃。
- 启动过渡：
  - Activity 先显示品牌底色 + 简化 Logo；等 WebView 第一帧可用后淡入，避免白屏。
  - 前端 `ready` 之前不接收方向键，防止误操作。

### 3.5 遥控器输入桥

**为什么要原生拦截：** WebView 对方向键的默认处理可能滚动页面或移动 DOM 焦点；不同电视固件的键值也不完全一致。由 Activity 统一捕获再做映射，行为最可控。

| 原始按键 | 统一动作 |
|---|---|
| `KEYCODE_DPAD_LEFT` (21) | `left` |
| `KEYCODE_DPAD_RIGHT` (22) | `right` |
| `KEYCODE_DPAD_UP` (19) | `up` |
| `KEYCODE_DPAD_DOWN` (20) | `down` |
| `KEYCODE_DPAD_CENTER` (23) / `KEYCODE_ENTER` (66) | `confirm` |
| `KEYCODE_BACK` (4) | `back` / 长按 `back_long` |
| `KEYCODE_MENU` (82) | `menu`（可选家长入口） |
| 其他 | 交给系统 |

规则：

1. **只处理 `ACTION_DOWN`**；方向键/确认键的自动重复一律忽略（避免孩子按住跳过）。
2. **确认键去重**：23 和 66 在 300ms 内只发一次。
3. **返回键**：按下开始计时；≥1500ms 发 `back_long`，否则抬起时发 `back`；长按后抬起不再发普通返回。
4. 所有动作通过 `evaluateJavascript` 调用前端固定入口，例如：
   ```js
   window.__numberIsland.onNativeKey({ action: "left", repeat: false })
   ```
   前端只接受白名单 action；原生不拼接任何用户可控内容。
5. 前端处理后再做一次状态锁；同一次确认不会触发两个屏幕动作。
6. 开发浏览器保留键盘映射（方向键/Enter/Space/Escape），真机不使用浏览器默认键盘。

### 3.6 JS Bridge（极简）

只暴露必要方法，全部由本地可信内容调用：

| 方法 | 用途 | 说明 |
|---|---|---|
| `loadState(): String` | 加载 JSON 存档 | 失败/空时返回 `""` |
| `saveState(json: String)` | 保存进度与设置 | 限制大小（如 ≤64KB），异常安全吞掉并记录 |
| `exitApp()` | 用户确认后退出 | 二次确认由前端完成 |
| `ready()` | 首帧绘制完成 | 原生据此淡入并开始接收按键 |
| `setAudioFocus(active: Boolean)` | 语音/音乐播放时请求/释放音频焦点 | 可选；失败不影响游戏 |

**安全约束：** 只加载本地 assets；不允许外部页面；不把 `@JavascriptInterface` 暴露给可导航的外部内容；release 关闭 WebView 调试；存档进行大小和字段校验；不记录儿童个人信息。

### 3.7 音频与语音

4–5 岁非识字用户需要语音。语音资源是独立的“非画面资源”，同样必须原创或明确授权。

**首选方案：**

- 约 60–80 条固定中文短句，打包为单声道 OGG（或 AAC/M4A，按 WebView 兼容性决定）。
- 音量标准化；旁白占主导；音乐自动 duck 到 20–30%。
- 按关卡预加载当前关语音，避免首次播放延迟；其余按需加载。
- 音乐：每个世界一条 45–60 秒循环，终章一条；音量低、无强节奏。
- 音效：正确、错误、焦点移动、星星、按钮等用短音效；可先用程序合成，后续替换为原创录音。

**备选（仅当没有录音/授权语音时）：**

- 原生 Android `TextToSpeech`（zh-CN）作为兜底，但音色和可用性因电视而异，不作为主方案。
- 若 TTS 也不可用：显示字幕并保留图形提示，保证题目仍可完成；在家长区明确提示语音不可用。

**不在运行时调用任何云端 TTS 或音频接口。**

---

## 4. Web 前端设计

### 4.1 技术栈

- TypeScript（strict）+ Vite
- **不引入 React/Vue 等运行时框架**：页面屏幕数量有限，手写状态与 DOM 更轻，焦点行为更可控。
- 目标浏览器基线：Chromium 80+（具体以目标电视实测为准）。构建时用 Babel/esbuild 降级到可配置 target；避免使用目标基线不支持的 CSS 特性（例如 flex `gap`、`aspect-ratio`、最新 `:has()`）。
- 仅使用 CSS 动画/过渡；不使用会触发大面积重绘的 JS 逐帧布局。
- 单元测试 Vitest；交互冒烟测试 Playwright（桌面 Chromium，模拟遥控键）；构建和测试不进 APK。

### 4.2 屏幕与状态机

```
Boot
 ├─ Home
 │   ├─ Map
 │   │   ├─ LevelIntro → Round(1..3) → Feedback → LevelComplete → Map
 │   │   ├─ ParentZone
 │   │   └─ Home
 │   └─ ExitConfirm → (native finish)
 ├─ Tutorial
 ├─ Pause overlay
 ├─ Break overlay
 └─ Error / NoAudio fallback
```

- 每个屏幕有独立的 `mount/render/unmount`，避免全局 DOM 越来越大。
- 转场期间设置 `transitioning=true`，丢弃按键，防连击。
- 每个屏幕必须声明默认焦点；进入时由焦点引擎恢复。
- 不把游戏状态存在 DOM class 中；状态变化 → 重新渲染当前屏幕 → 重新绑定焦点。

### 4.3 焦点引擎

- 每个屏幕注册 `[data-focusable]` 元素及方向关系；首版只支持水平列表和关卡地图路径。
- 焦点样式由 `.is-focused` 类控制：
  - 放大/抬起；
  - 3–4px 深色描边 + 8–12px 金色外圈（在浅色与深色背景上都可见）；
  - 下方三角/小箭头；
  - 不依赖颜色单独表达。
- 焦点移动有音效与轻微缩放反馈；到头不循环，给出“到头了”的小回弹，避免意外跳转。
- 焦点元素确保在视口安全区内；地图移动用 `transform: translate3d` 平移轨道，不触发整页重排。
- 记住上次选择：同屏内切换选项再返回，焦点留在原处；跨屏幕默认焦点由屏幕定义。
- 选择确定后先锁定，播放反馈动画，再解锁下一个动作。

### 4.4 内容数据

内容与引擎分离，关卡数据可测试、可编辑。示意：

```jsonc
{
  "id": "forest-1",
  "world": "forest",
  "title": "花园数一数",
  "skill": "count-to-numeral",
  "introVoice": "voice.f1.intro",
  "rounds": [
    {
      "kind": "count-to-numeral",
      "target": 3,
      "items": ["flower"],
      "choices": [2, 3, 4],
      "answer": 3,
      "promptVoice": "voice.f1.r1.prompt",
      "correctVoice": "voice.f1.r1.correct",
      "hintVoices": ["voice.f1.r1.hint1", "voice.f1.r1.hint2"]
    }
  ]
}
```

约束：

- 每关恰好 3 轮；每轮恰好 3 个选项；有且只有一个答案。
- 正确答案位置在关内均衡；使用关卡 + 轮次 + 会话种子确定性打乱，便于测试与恢复。
- 每个数值/数量在构建时校验：范围、唯一性、无歧义、素材存在。
- 语音通过 key 引用；构建时检查所有 key 都有对应音频文件或明确的 fallback。
- 文案与数据不写死在渲染函数里；内容表即“课程表”。

### 4.5 题目生成与教学反馈

- `question` 中间层统一生成：显示对象、选项顺序、焦点初值、提示阶梯、语音 key。
- 对计数题，视觉对象必须有稳定布局；避免对象互相遮挡。高亮计数按从左到右/从上到下稳定顺序进行（允许按视觉路径）。
- 提示阶梯抽象为最多 3 层：
  1. 策略提示（不揭示答案）；
  2. 具体演示（计数编号、分组、配对线等）；
  3. 高亮答案并等待 OK。
- 答对后自动下一题（约 2.8 秒），期间按 OK 可提前进入；答错不自动推进。
- 题目状态写入存档：当前关、当前轮、尝试次数、是否已用提示；重进恢复。
- 每关完成后更新星星和下一关解锁；旧数据通过版本迁移。

### 4.6 渲染与 SVG 资源管线

- 所有角色、场景、UI、数字、图标以原创 SVG 源文件维护在 `web/src/art/`。
- 前端通过 Vite 的 `?raw` 导入 SVG 字符串，经构建时校验后内联到 DOM；需要动画的部件使用稳定的 `id`/class（如眼睛、尾巴、星星），通过 CSS 控制。
- **禁止**：内嵌 `<image>`、外部字体、外部 `href`、脚本、远程 URL、第三方图库素材。
- **慎用**：`feGaussianBlur`、大面积 `filter`、复杂遮罩。纸纹用轻量 `<pattern>` 或叠色表现，不用噪声滤镜。
- 每屏 DOM 节点目标 ≤ 2500；单个 SVG 源文件目标 ≤ 150KB；总 SVG 资源目标 ≤ 1.5MB。
- 优先“背景 / 中景 / 前景 / 角色”分层；同一场景的静态背景只渲染一次。
- 数字 1–10 使用统一的原创字形或 Fredoka 字体，**不装饰到影响认读**；所有数量对象保持同形同色（规律题除外）。

### 4.7 布局与分辨率

- 设计基准：1920×1080 横屏。
- 采用固定 1920×1080 舞台 + 等比缩放（`transform: scale()`），保证构图与字号比例一致；舞台四周留出安全边距。
- 安全区：距画面边缘至少 64px（垂直）/96px（水平）；关键内容再内缩，兼容 5% overscan。
- 适配 1280×720 / 1920×1080 / 3840×2160；非 16:9 的设备用品牌底色 letterbox，不拉伸。
- 字号（1080p 设计稿）：
  - 关卡标题 / 大按钮：72–120px
  - 题目主字：56–72px
  - 选项数字：120–180px
  - 儿童可见短句：44–56px
  - 家长区正文：最低 28–32px
  - 控制提示：32–36px
- 正文不依靠细字重；对比度至少满足 WCAG AA（正常文本 4.5:1，大字号 3:1）。

### 4.8 动效与性能预算

- 时长：焦点 180–250ms；反馈 250–500ms；关卡完成 1.5–2.5s。
- 只动 `transform` / `opacity`；不持续动画大片背景。
- 目标 60fps（现代电视），低端不低于 30fps；掉帧时自动减少粒子数量（检测 `requestAnimationFrame` 间隔，降级）。
- 尊重“减少动态效果”：关闭粒子、浮动、视差，保留状态变化。
- 无闪烁；不使用 >3Hz 的亮暗变化；避免突然全屏白/黑。

### 4.9 存档格式

```jsonc
{
  "version": 1,
  "progress": {
    "completedLevels": ["forest-1"],
    "stars": { "forest-1": 1 },
    "currentLevel": "forest-2",
    "attempts": { "forest-1": 4 },
    "hintsUsed": { "forest-1": 1 },
    "lastPlayedAt": "2026-11-13T15:00:00+08:00"
  },
  "settings": {
    "voiceVolume": 0.9,
    "sfxVolume": 0.7,
    "musicEnabled": true,
    "breakMinutes": 15,
    "reduceMotion": false,
    "captions": false,
    "unlockedAll": false
  },
  "resume": {
    "levelId": "forest-2",
    "roundIndex": 1,
    "attempts": 0
  }
}
```

- 每完成一题 / 一次设置变更 / 回到地图时保存；动画中间状态不保存。
- 存档 JSON ≤ 64KB；读取失败回退默认值，不崩溃。
- 版本迁移在 JS 内完成；原生只负责字符串存取。
- 卸载应用即删除全部数据；不申请备份。
- 家长区“重置进度”需长按 OK 5 秒，清除存档后回到首页。

### 4.10 可访问性与安全

- 所有交互元素有可读的 `aria-label`；题目语音有可选字幕。
- 不只用颜色表达正确/错误/焦点；用形状、图标、位置、文字共同表达。
- 静音也能完成题目：数字题显示数量对象与数字卡，比较题显示两组对象和“多/少”图标。
- 禁用长按选择、拖拽、文本选择、右键菜单；全屏无浏览器 UI。
- 不收集任何个人信息；无网络；无第三方 SDK。
- 应用切后台立即暂停；恢复必须用户按 OK，避免后台播放声音。

---

## 5. 资源与音频预算

| 类别 | 目标 | 上限 |
|---|---|---|
| HTML/CSS/JS（构建后） | < 250KB | 500KB |
| SVG 源资源 | < 1.5MB | 3MB |
| 字体（子集，2–3 个 WOFF2） | < 800KB | 1.5MB |
| 语音（60–80 条，OGG 单声道） | < 4MB | 7MB |
| 音乐（4 条循环） | < 2MB | 3MB |
| 音效 | < 300KB | 500KB |
| Android 壳 | < 2MB | 3MB |
| **APK 目标** | **< 12MB** | **< 20MB（商店上限 40MB）** |
| 前台内存目标 | < 80MB | < 100MB |

- 所有音频避免 48kHz 立体声；语音 32–44.1kHz 单声道，音乐可 44.1kHz 立体声低码率。
- 字体仅打包实际用到的字形；构建脚本生成子集并保留 OFL 许可证文件。
- 不使用未授权字体、图库、音效包或角色素材。

---

## 6. 构建与安装

### 6.1 目录结构（计划）

```
number-island-tv/
├── app/                            # Android 壳
│   ├── build.gradle.kts
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/jolly/numberisland/MainActivity.kt
│   │   ├── assets/www/             # Vite 构建产物（生成）
│   │   └── res/
│   └── ...
├── web/                            # 前端与游戏
│   ├── index.html
│   ├── src/
│   │   ├── main.ts
│   │   ├── app/                    # 状态机、焦点、屏幕
│   │   ├── game/                   # 出题、提示、进度
│   │   ├── art/                    # 原创 SVG
│   │   ├── audio/                  # 语音/音乐/音效
│   │   └── styles/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
├── content/                        # 关卡/语音/文案数据
├── design/                         # 设计稿与源 SVG
├── docs/
├── scripts/                        # 构建、校验、资源处理
├── gradle/ build.gradle.kts settings.gradle.kts
└── README.md
```

### 6.2 构建流程

1. 安装 JDK 17、Android SDK、Node.js（当前已具备 Node 和 JDK 17）。
2. `npm install`（web）。
3. `npm run build` → 输出到 `app/src/main/assets/www/`。
4. `./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`。
5. 可选：`npm run test`（内容校验、焦点/状态单测）；`npm run e2e`（桌面浏览器模拟遥控）。

构建脚本要做前置检查：Node/JDK/SDK 是否正确；资源校验失败时中止构建，不带坏资源出包。

### 6.3 安装到小米电视

**U 盘方式（给用户）：**

1. 电视设置中允许安装未知来源应用；
2. 将 APK 拷到 FAT32/exFAT U 盘；
3. 电视打开高清播放器/文件管理，找到 APK 安装；
4. 在“我的应用”中启动《数字岛大冒险》。

**ADB 方式（开发调试）：**

```bash
adb connect <电视IP>:5555
adb install -r app-debug.apk
adb shell am start -n com.jolly.numberisland/.MainActivity
```

- 先在电视“设置 → 关于 → 产品型号”连续确认打开开发者模式，开启网络 ADB。
- 首次连接可能需要在电视上允许调试授权。
- 具体菜单名称随 HyperOS 版本变化；以目标电视为准。

### 6.4 签名与版本

- 原型：debug 签名 APK；不上传商店，不提交签名密钥。
- 若进入商店阶段：生成独立 release keystore，密钥不入 git；`versionCode` 单调递增，`versionName` 与商店信息一致。
- 应用名、图标、包名一旦发布不随意修改（小米规范）。

---

## 7. 测试策略

### 7.1 自动化

- **内容校验（构建时）：**
  - 每关 3 轮、每轮 3 选项、唯一正确答案；
  - 目标数量在范围内，选项无重复；
  - 正确答案位置分布合理；
  - 所有 SVG/音频/语音 key 存在；
  - SVG 不含外链、图片、脚本；
  - 关卡解锁图无环、无不可达节点。
- **单元测试：**
  - 焦点移动（边界、不循环、转场锁）；
  - 状态机（首页→地图→关卡→完成→地图；返回/暂停）；
  - 提示阶梯与答错次数；
  - 存档读写、版本迁移、损坏数据回退；
  - 出题随机但可复现。
- **浏览器冒烟：**
  - Chromium 1280×720 / 1920×1080；
  - 键盘模拟：左右/OK/上/返回/长按返回；
  - 首次教学、完成第 1 关、退出确认、家长区入口；
  - 断网、静音、减少动态、字幕；
  - 连续点击/长按的防抖。

### 7.2 真机验收（不可省）

| # | 项目 | 通过标准 |
|---|---|---|
| 1 | 安装 | U 盘和 ADB 至少一种方式可安装；桌面只有一个图标 |
| 2 | 启动 | 冷启动无白屏/黑屏，≤3 秒可操作 |
| 3 | 遥控器 | 上/下/左/右/OK/Enter/返回/长按返回全部符合预期 |
| 4 | 键值差异 | 23 和 66 都能确认；无双触发 |
| 5 | 返回 | 首页返回弹确认；答题中返回暂停；不会直接退出 |
| 6 | 画面 | 1080p 无裁切；720p 可读；4K 不模糊；5% 安全区内容完整 |
| 7 | 音频 | 旁白/音乐/音效正常；切后台静音；回来不突然爆音 |
| 8 | 生命周期 | Home/待机/信号切换后恢复正确；进度不丢 |
| 9 | 网络 | 拔网线/关 Wi-Fi 后完整可玩；应用无网络请求 |
| 10 | 稳定性 | 连续 30 分钟或完成 10 关不崩、不卡死、不明显发热 |
| 11 | 内存 | 前台内存低于 100MB；切关卡无持续增长 |
| 12 | 安装限制 | 目标电视允许侧载；如不允许，提供 ADB 方案 |

**当前没有连接电视。** 真机验收必须在用户的目标电视上进行；在此之前只能声称“桌面浏览器 + Android 模拟器通过”，不能声称“小米电视已验证”。

---

## 8. 实施顺序（评审通过后）

1. **M1 · 可运行壳**
   - 安装 SDK、创建 Android 壳、WebView 本地加载、全屏/横屏/生命周期；
   - 原生遥控键桥 + 桌面键盘模拟；
   - 品牌启动页和错误兜底。
2. **M2 · 第 1 关竖切**
   - 状态机、焦点引擎、存档、第 1 关完整三题；
   - 1 组场景 SVG + 角色 + 数字卡；
   - 语音占位/首条语音；在电视或模拟器上跑通。
3. **M3 · 完整内容**
   - 10 关数据、提示阶梯、家长区、进度/星星/解锁；
   - 三个世界与终章场景、图标、贴纸/节点；
   - 操作教学、暂停、退出、护眼休息。
4. **M4 · 打磨与交付**
   - 完整语音/音乐/音效；
   - 720p/1080p/4K 与真机测试；
   - 构建最终 APK、安装说明、家长指南；
   - 根据真机反馈修复遥控/性能问题。

**里程碑策略：** M2 就交付一个可安装、可玩的第 1 关，尽早验证最大风险（WebView + 遥控器 + 电视画面），而不是等 10 关全做完才发现问题。

---

## 9. 技术风险与预案

| 风险 | 触发条件 | 预案 |
|---|---|---|
| WebView 过旧 | 目标电视不识别现代 JS/CSS | 先读取 WebView 版本；构建 target 降低；必要时改原生 View 渲染（工作量大幅增加，需重新评估） |
| 遥控 OK 键不触发 | 只发 23 或 66 | 同时映射并去重；真机逐键测试；在错误页提供按键诊断（debug） |
| 返回键行为不一致 | 长按/短按事件冲突 | 原生计时并只发一种事件；前端再做状态锁 |
| 方向键被 WebView 默认消费 | 页面滚动/焦点跳动 | 原生 `dispatchKeyEvent` 拦截；禁止页面滚动 |
| 音频延迟 | 首次播放/解码慢 | 预加载当前关；短音效 Web Audio 合成；语音使用小文件；首帧后再允许操作 |
| 包体超限 | 音频/字体过大 | 压缩、子集化、降低码率；目标 <12MB，远低于 40MB |
| 低端电视掉帧 | 粒子/滤镜过多 | 动效预算、降级粒子、只用 transform/opacity、真机帧率检查 |
| 侧载被限制 | 系统不允许未知来源 | 准备 ADB 路径；让用户确认具体型号和系统版本 |
| 商店审核/资质 | 未来要公开发布 | 作为独立项目阶段处理，不在首版承诺 |

---

## 10. 明确不做的技术事项

- 不做远程更新、热更新、从网络下载可执行代码；
- 不做账号、云同步、推送、统计 SDK、广告 SDK；
- 不申请 INTERNET、存储、位置、麦克风、相机权限；
- 不引入第三方游戏引擎、跨端框架或大型 UI 库；
- 不使用远程图片/字体/音频/接口；
- 不为了“未来扩展”过度抽象架构；首版以 10 关完整可玩为边界。
