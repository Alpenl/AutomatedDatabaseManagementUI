export type Dim = 'topic' | 'type' | 'trait' | 'medium'
export type Tag = { name: string; dim: Dim; auto: boolean; enabled: boolean; aliases: string; desc: string }
export type Article = {
  id: number
  title: string
  source: string
  url: string
  date: string
  lang: string
  summary: string
  body: string[]
  raw: string
  tags: string[]
  excluded: string[]
  cols: Record<string, string>
  links: { label: string; url: string }[]
  failed?: boolean
}
export type Collection = {
  id: string
  name: string
  purpose: string
  rule: string[]
  mode: 'any' | 'all'
  pinned: boolean
  archived: boolean
}

export const DIMS: Record<Dim, { label: string; chip: string }> = {
  topic: { label: '主题', chip: 'bg-[#e8eef7] text-[#0842a0]' },
  type: { label: '资源类型', chip: 'bg-[#e4f0e8] text-[#1e6b3a]' },
  trait: { label: '内容特征', chip: 'bg-[#f6eedb] text-[#8a5a00]' },
  medium: { label: '载体', chip: 'bg-[#eee8f6] text-[#6b3fa0]' },
}

export const TAGS0: Tag[] = [
  { name: 'LoRA', dim: 'topic', auto: true, enabled: true, aliases: '低秩适应', desc: '实质讨论 LoRA 方法或实现；仅在列表中偶然提及不算。' },
  { name: '扩散模型', dim: 'topic', auto: true, enabled: true, aliases: 'Diffusion', desc: '以扩散模型原理、训练或推理为主要内容。' },
  { name: '检索增强', dim: 'topic', auto: true, enabled: true, aliases: 'RAG', desc: '讨论检索与生成结合的系统设计。' },
  { name: '大语言模型', dim: 'topic', auto: true, enabled: true, aliases: 'LLM', desc: '' },
  { name: '设计系统', dim: 'topic', auto: false, enabled: true, aliases: '', desc: '仅由人工标记。' },
  { name: '论文', dim: 'type', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '教程', dim: 'type', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '博客文章', dim: 'type', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '开源项目', dim: 'type', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '含代码', dim: 'trait', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '含数据图表', dim: 'trait', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '长文', dim: 'trait', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '网页', dim: 'medium', auto: true, enabled: true, aliases: '', desc: '' },
  { name: 'PDF', dim: 'medium', auto: true, enabled: true, aliases: '', desc: '' },
  { name: '视频字幕', dim: 'medium', auto: true, enabled: false, aliases: '', desc: '' },
]

export const COLS0: Collection[] = [
  { id: 'c1', name: '微调与适配', purpose: '收录参数高效微调相关的方法、实验与实现细节。', rule: ['LoRA'], mode: 'any', pinned: true, archived: false },
  { id: 'c2', name: '图像生成研究', purpose: '扩散模型、图像编辑与可控生成方向的论文与教程。', rule: ['扩散模型', '论文'], mode: 'all', pinned: false, archived: false },
  { id: 'c3', name: '产品灵感', purpose: '值得借鉴的界面、交互与设计系统案例。', rule: [], mode: 'any', pinned: false, archived: false },
  { id: 'c4', name: '2025 年阅读清单', purpose: '已完成的年度专题。', rule: ['大语言模型'], mode: 'any', pinned: false, archived: true },
]

export const ARTS0: Article[] = [
  {
    id: 1,
    title: 'LoRA 再探：秩、缩放系数与层选择的实验对比',
    source: 'sebastianraschka.com',
    url: 'https://sebastianraschka.com/blog/lora-insights',
    date: '10 月 11 日',
    lang: '英文 · 已译',
    summary:
      '作者在 7B 模型上系统比较了不同秩、alpha 缩放及作用层范围对微调效果的影响，结论是：对全部线性层施加较小的秩，往往比仅调注意力层使用大秩更稳定，且显存开销相近。',
    body: [
      '低秩适应（LoRA）已成为参数高效微调的默认选择，但许多配置仍凭经验设定。本文在统一的数据集与训练预算下，对秩 r、缩放系数 alpha 以及作用层范围做了网格实验。',
      '结果显示，将 r 从 8 提高到 64 带来的收益很快饱和；而把 LoRA 应用到 MLP 层，比单纯增大注意力层的秩更有效。alpha 取 2r 时训练最稳定。',
      '最后，作者给出一组推荐配置：全部线性层、r=16、alpha=32、学习率 2e-4，并附上可复现脚本。',
    ],
    raw: 'LoRA Insights: Rank, Alpha and Layer Selection\n\nLow-rank adaptation (LoRA) has become the default choice for parameter-efficient finetuning, yet many configurations are still set by habit. In this article we run a grid of experiments...\n\n[snapshot saved 2026-10-11 09:42 · 4,812 words]',
    tags: ['LoRA', '大语言模型', '博客文章', '含数据图表'],
    excluded: [],
    cols: { c1: '用于下周调研' },
    links: [
      { label: 'LoRA: Low-Rank Adaptation of Large Language Models', url: 'arxiv.org/abs/2106.09685' },
      { label: 'huggingface/peft', url: 'github.com/huggingface/peft' },
    ],
  },
  {
    id: 2,
    title: 'Denoising Diffusion Probabilistic Models',
    source: 'arxiv.org',
    url: 'https://arxiv.org/abs/2006.11239',
    date: '10 月 10 日',
    lang: '英文 · 已译',
    summary:
      '提出通过逐步加噪与学习反向去噪过程来生成图像的 DDPM 框架，在 CIFAR-10 上取得当时最优的 FID，并建立了扩散模型与去噪得分匹配之间的联系。',
    body: [
      '我们展示了扩散概率模型能够生成高质量图像。训练目标可简化为预测噪声的加权变分下界。',
      '在无条件 CIFAR-10 上，模型取得 Inception 分数 9.46 与 FID 3.17。',
    ],
    raw: 'Denoising Diffusion Probabilistic Models\nJonathan Ho, Ajay Jain, Pieter Abbeel\n\nWe present high quality image synthesis results using diffusion probabilistic models...',
    tags: ['扩散模型', '论文', 'PDF', '含数据图表'],
    excluded: [],
    cols: { c2: '' },
    links: [{ label: 'hojonathanho/diffusion', url: 'github.com/hojonathanho/diffusion' }],
  },
  {
    id: 3,
    title: '用 200 行代码从零实现一个检索增强问答系统',
    source: 'mp.weixin.qq.com',
    url: 'https://mp.weixin.qq.com/s/rag-200',
    date: '10 月 9 日',
    lang: '中文',
    summary:
      '手把手演示文本切块、向量化、相似度检索与提示词拼装四个步骤，附完整 Python 代码，并指出切块大小与重排序是影响效果的两个主要因素。',
    body: [
      '检索增强（RAG）的核心并不复杂：把知识切成块，找到最相关的几块，再交给模型作答。',
      '我们先用滑动窗口切块，重叠 20%；随后用开源向量模型编码并存入本地索引。',
    ],
    raw: '用 200 行代码从零实现一个 RAG 系统\n\n检索增强的核心并不复杂……',
    tags: ['检索增强', '教程', '含代码', '网页'],
    excluded: ['长文'],
    cols: {},
    links: [{ label: 'langchain-ai/langchain', url: 'github.com/langchain-ai/langchain' }],
  },
  {
    id: 4,
    title: 'Linear 的设计系统是如何保持一致性的',
    source: 'linear.app',
    url: 'https://linear.app/blog/design-system',
    date: '10 月 8 日',
    lang: '英文 · 已译',
    summary: '介绍团队如何用少量设计令牌与严格的间距规则，在快速迭代中保持界面一致，并分享了他们的评审流程。',
    body: ['一致性并非来自庞大的组件库，而是来自一小组被严格执行的规则。'],
    raw: 'How Linear keeps its design system consistent...',
    tags: ['设计系统', '博客文章', '网页'],
    excluded: [],
    cols: { c3: '' },
    links: [],
  },
  {
    id: 5,
    title: '某付费专栏：2026 年模型推理成本展望',
    source: 'example-research.com',
    url: 'https://example-research.com/members/inference-cost-2026',
    date: '10 月 7 日',
    lang: '—',
    summary: '',
    body: [],
    raw: '',
    tags: [],
    excluded: [],
    cols: {},
    links: [],
    failed: true,
  },
]
