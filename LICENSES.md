# 素材与授权

## 代码

项目代码为本次实现的自有代码。未复制第三方游戏、角色或关卡素材。

## 原创 SVG

`design/` 与 `web/src/art/` 中的角色、场景、图标、数字、UI 图形均为本项目绘制。应用内所有插画、图标和装饰都以内联 SVG 或 SVG 源稿呈现；Android 启动图标由同一 SVG 品牌图形导出为系统要求的 PNG 尺寸。

SVG 源稿中没有第三方图库素材、远程图片、嵌入位图或外部链接。

## 字体

| 字体 | 用途 | 授权 |
|---|---|---|
| ZCOOL KuaiLe | 儿童界面标题/短句 | SIL Open Font License 1.1 |
| Fredoka | 数字 | SIL Open Font License 1.1 |
| 系统中文无衬线回退 | 家长区正文 | 系统字体，不随 APK 分发 |

OFL 许可证文本随 APK 放在：`assets/www/licenses/`。字体只打包使用到的字形子集。

## 语音

当前旁白使用 **CosyVoice3 / Fun-CosyVoice3-0.5B**（Apache License 2.0）离线生成，温柔活泼语气，不依赖在线 TTS 服务。

- 项目：https://github.com/FunAudioLLM/CosyVoice
- 模型：https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- 参考音色：CosyVoice 仓库自带的 `asset/zero_shot_prompt.wav`
- APK 不包含模型权重，只包含预生成的旁白音频；许可证说明随 APK 放在 `assets/www/licenses/COSYVOICE3.txt`。
- 当前参考音色用于家庭原型。正式公开发行前，建议换成有明确授权的配音员/定制音色，避免真人声音 likeness 的授权问题。
- 语音仍属于合成语音，不是真人录音；如果要求绝对自然，仍需真人配音。

音效与背景音乐由 Web Audio 程序合成，属于本项目原创。

## 参考与调研

平台约束、儿童发展目标与交互参考见 [docs/01-research.md](docs/01-research.md)。调研资料只用于事实核验和设计参考，不复制竞品角色、文案、关卡或画面。
