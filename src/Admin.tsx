import { useState, type Dispatch, type SetStateAction } from 'react'
import { DIMS, type Article, type Collection, type Dim, type Tag } from './data'
import { Btn, Chip, Icon, P, Switch } from './ui'

/* ---------------- 合集 ---------------- */

export function Collections({
  cols,
  setCols,
  arts,
  tags,
}: {
  cols: Collection[]
  setCols: Dispatch<SetStateAction<Collection[]>>
  arts: Article[]
  tags: Tag[]
  setArts: Dispatch<SetStateAction<Article[]>>
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [rule, setRule] = useState<string[]>([])
  const [mode, setMode] = useState<'any' | 'all'>('any')
  const [scan, setScan] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const patch = (id: string, v: Partial<Collection>) => setCols((x) => x.map((c) => (c.id === id ? { ...c, ...v } : c)))
  const matches = (c: Collection) =>
    c.rule.length === 0 ? [] : arts.filter((a) => (c.mode === 'any' ? c.rule.some((t) => a.tags.includes(t)) : c.rule.every((t) => a.tags.includes(t))))
  const count = (c: Collection) => new Set([...arts.filter((a) => c.id in a.cols), ...matches(c)].map((a) => a.id)).size

  const create = () => {
    if (!name.trim()) return
    setCols((x) => [...x, { id: 'c' + Date.now(), name, purpose, rule, mode, pinned: false, archived: false }])
    setName('')
    setPurpose('')
    setRule([])
    setCreating(false)
  }
  const preview = arts.filter((a) => (rule.length ? (mode === 'any' ? rule.some((t) => a.tags.includes(t)) : rule.every((t) => a.tags.includes(t))) : false)).length

  const list = cols.filter((c) => c.archived === showArchived).sort((a, b) => +b.pinned - +a.pinned)

  return (
    <div className="h-full overflow-y-auto scroll-quiet">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-normal">合集</h1>
            <p className="text-[14px] text-g-sub mt-1">设定用途与规则，其余交给后台。新文章会静默归入符合条件的合集。</p>
          </div>
          {!creating && (
            <Btn kind="primary" onClick={() => setCreating(true)}>
              <Icon d={P.plus} className="w-4 h-4" /> 新建合集
            </Btn>
          )}
        </div>

        {creating && (
          <div className="mt-6 rounded-2xl border border-g-line p-6 shadow-[0_1px_3px_rgba(60,64,67,.15)]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="合集名称"
              className="w-full h-11 text-[20px] border-b border-g-line focus:border-g-blue outline-none"
            />
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              placeholder="用途说明：AI 会据此理解这个合集应该收录什么"
              className="w-full mt-4 text-[14px] border border-g-line rounded-xl p-3 resize-none focus:border-g-blue outline-none"
            />
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[13px] text-g-sub">标签规则（可选）</span>
              <div className="flex rounded-full border border-g-line text-[12px] overflow-hidden">
                {(['any', 'all'] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`px-3 h-6 ${mode === m ? 'bg-g-tint text-g-blue-dark font-medium' : 'text-g-sub'}`}>
                    {m === 'any' ? '命中任一' : '命中全部'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags
                .filter((t) => t.enabled)
                .map((t) => {
                  const on = rule.includes(t.name)
                  return (
                    <button
                      key={t.name}
                      onClick={() => setRule(on ? rule.filter((r) => r !== t.name) : [...rule, t.name])}
                      className={`h-7 px-3 rounded-full text-[13px] border ${on ? 'bg-g-tint border-g-blue text-g-blue-dark' : 'border-g-line hover:bg-g-surface'}`}
                    >
                      {t.name}
                    </button>
                  )
                })}
            </div>
            <label className="mt-5 flex items-center gap-2 text-[14px]">
              <Switch on={scan} onChange={setScan} label="扫描现有文章" />
              扫描并收录现有匹配文章
              {scan && rule.length > 0 && <span className="text-g-sub">（预计 {preview} 篇）</span>}
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Btn onClick={() => setCreating(false)}>取消</Btn>
              <Btn kind="primary" onClick={create} disabled={!name.trim()}>
                创建
              </Btn>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-1 border-b border-g-line">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              onClick={() => setShowArchived(v)}
              className={`h-10 px-4 text-[14px] font-medium border-b-2 -mb-px ${showArchived === v ? 'border-g-blue text-g-blue-dark' : 'border-transparent text-g-sub'}`}
            >
              {v ? '已归档' : '进行中'}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-g-line">
          {list.length === 0 && <li className="py-12 text-center text-[14px] text-g-sub">这里还没有合集</li>}
          {list.map((c) => (
            <li key={c.id} className="py-5 group">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editing === c.id ? (
                      <input
                        autoFocus
                        value={c.name}
                        onChange={(e) => patch(c.id, { name: e.target.value })}
                        onBlur={() => setEditing(null)}
                        className="text-[18px] font-medium border-b border-g-blue outline-none"
                      />
                    ) : (
                      <h2 className="text-[18px] font-medium">{c.name}</h2>
                    )}
                    {c.pinned && <Icon d={P.pin} className="w-4 h-4 text-g-blue" />}
                    <span className="text-[13px] text-g-sub">{count(c)} 篇</span>
                  </div>
                  {editing === c.id ? (
                    <textarea
                      value={c.purpose}
                      onChange={(e) => patch(c.id, { purpose: e.target.value })}
                      rows={2}
                      className="mt-1 w-full text-[14px] border border-g-line rounded-lg p-2 resize-none focus:border-g-blue outline-none"
                    />
                  ) : (
                    <p className="text-[14px] text-g-sub mt-1 leading-relaxed">{c.purpose}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {c.rule.length > 0 ? (
                      <>
                        <span className="text-[12px] text-g-sub mr-1">{c.mode === 'any' ? '命中任一' : '命中全部'}</span>
                        {c.rule.map((r) => (
                          <Chip key={r} dim={tags.find((t) => t.name === r)?.dim ?? 'topic'}>
                            {r}
                          </Chip>
                        ))}
                      </>
                    ) : (
                      <span className="text-[12px] text-g-sub">AI 语义收录 · 无硬性规则</span>
                    )}
                    {c.archived && <span className="text-[12px] text-g-sub ml-2">自动收录已暂停</span>}
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition">
                  {[
                    [P.pin, c.pinned ? '取消置顶' : '置顶', () => patch(c.id, { pinned: !c.pinned })],
                    [P.edit, '重命名 / 修改说明', () => setEditing(editing === c.id ? null : c.id)],
                    [P.archive, c.archived ? '取消归档' : '归档', () => patch(c.id, { archived: !c.archived })],
                    [P.trash, '删除合集（不删除文章）', () => setCols((x) => x.filter((y) => y.id !== c.id))],
                  ].map(([d, t, f]) => (
                    <button key={t as string} title={t as string} aria-label={t as string} onClick={f as () => void} className="w-9 h-9 grid place-items-center rounded-full text-g-sub hover:bg-g-surface">
                      <Icon d={d as string} className="w-[18px] h-[18px]" />
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-g-sub mt-4">删除合集仅解散归属关系，文章本体不会被删除。</p>
      </div>
    </div>
  )
}

/* ---------------- 标签库 ---------------- */

export function TagLibrary({ tags, setTags, arts }: { tags: Tag[]; setTags: Dispatch<SetStateAction<Tag[]>>; arts: Article[] }) {
  const [dim, setDim] = useState<Dim>('topic')
  const [open, setOpen] = useState<string | null>(null)
  const list = tags.filter((t) => t.dim === dim)
  const patch = (n: string, v: Partial<Tag>) => setTags((x) => x.map((t) => (t.name === n ? { ...t, ...v } : t)))

  const add = () => {
    const name = '新标签' + (tags.length + 1)
    setTags((x) => [...x, { name, dim, auto: true, enabled: true, aliases: '', desc: '' }])
    setOpen(name)
  }

  return (
    <div className="h-full overflow-y-auto scroll-quiet">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-normal">标签库</h1>
            <p className="text-[14px] text-g-sub mt-1">AI 与你共用的词典。写好定义即可，无需日常维护。</p>
          </div>
          <Btn kind="primary" onClick={add}>
            <Icon d={P.plus} className="w-4 h-4" /> 新增标签
          </Btn>
        </div>

        <div className="mt-8 flex gap-1 border-b border-g-line">
          {(Object.keys(DIMS) as Dim[]).map((d) => (
            <button
              key={d}
              onClick={() => setDim(d)}
              className={`h-10 px-4 text-[14px] font-medium border-b-2 -mb-px ${dim === d ? 'border-g-blue text-g-blue-dark' : 'border-transparent text-g-sub hover:text-g-text'}`}
            >
              {DIMS[d].label} <span className="text-g-sub font-normal ml-1">{tags.filter((t) => t.dim === d).length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_80px_110px_40px] px-2 h-10 items-center text-[12px] text-g-sub">
          <span>名称</span>
          <span>文章数</span>
          <span>派发方式</span>
          <span />
        </div>
        <ul className="border-t border-g-line divide-y divide-g-line">
          {list.map((t) => (
            <li key={t.name}>
              <div className={`grid grid-cols-[1fr_80px_110px_40px] px-2 min-h-12 items-center hover:bg-g-surface/70 ${!t.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 py-2">
                  <Chip dim={t.dim}>{t.name}</Chip>
                  {t.aliases && <span className="text-[12px] text-g-sub">别名 {t.aliases}</span>}
                  {!t.enabled && <span className="text-[12px] text-g-red">已停用</span>}
                </div>
                <span className="text-[14px] tabular-nums">{arts.filter((a) => a.tags.includes(t.name)).length}</span>
                <span className={`text-[13px] ${t.auto ? 'text-g-green' : 'text-g-sub'}`}>{t.auto ? 'AI 自动参与' : '仅人工使用'}</span>
                <button onClick={() => setOpen(open === t.name ? null : t.name)} aria-label="编辑" className="w-8 h-8 grid place-items-center rounded-full text-g-sub hover:bg-g-surface">
                  <Icon d={P.edit} className="w-4 h-4" />
                </button>
              </div>
              {open === t.name && (
                <div className="bg-g-surface/60 px-5 py-5 grid gap-4 grid-cols-2 max-[1000px]:grid-cols-1">
                  <label className="text-[12px] text-g-sub">
                    名称（改名不影响已有关联）
                    <input value={t.name} onChange={(e) => { patch(t.name, { name: e.target.value }); setOpen(e.target.value) }} className="mt-1 w-full h-10 px-3 rounded-lg border border-g-line bg-white text-[14px] text-g-text focus:border-g-blue outline-none" />
                  </label>
                  <label className="text-[12px] text-g-sub">
                    别名
                    <input value={t.aliases} onChange={(e) => patch(t.name, { aliases: e.target.value })} placeholder="如：低秩适应" className="mt-1 w-full h-10 px-3 rounded-lg border border-g-line bg-white text-[14px] text-g-text focus:border-g-blue outline-none" />
                  </label>
                  <label className="text-[12px] text-g-sub col-span-2 max-[1000px]:col-span-1">
                    适用与不适用描述
                    <textarea value={t.desc} onChange={(e) => patch(t.name, { desc: e.target.value })} rows={2} placeholder="什么算实质讨论，什么只是偶然提到" className="mt-1 w-full p-3 rounded-lg border border-g-line bg-white text-[14px] text-g-text resize-none focus:border-g-blue outline-none" />
                  </label>
                  <div className="flex items-center gap-8 col-span-2 max-[1000px]:col-span-1 text-[14px]">
                    <label className="flex items-center gap-2">
                      <Switch on={t.auto} onChange={(v) => patch(t.name, { auto: v })} label="AI 自动打标" /> AI 自动打标
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch on={t.enabled} onChange={(v) => patch(t.name, { enabled: v })} label="启用" /> 启用
                    </label>
                    <span className="ml-auto"><Btn onClick={() => setOpen(null)}>完成</Btn></span>
                  </div>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && <li className="py-12 text-center text-[14px] text-g-sub">该维度下暂无标签</li>}
        </ul>
        <p className="text-[12px] text-g-sub mt-4">停用后模型不再给新文章打该标签，已有文章保留。</p>
      </div>
    </div>
  )
}

/* ---------------- 设置 ---------------- */

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, (used / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-[14px]">
        <span>{label}</span>
        <span className="tabular-nums text-g-sub">
          <span className="text-g-text font-medium">{used}</span> / {max}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-g-surface overflow-hidden">
        <div className={`h-full rounded-full ${pct > 85 ? 'bg-[#f9ab00]' : 'bg-g-blue'}`} style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

export function Settings() {
  const [token, setToken] = useState('cairn_sk_8f2a91c4e7')
  const [show, setShow] = useState(false)
  const [checking, setChecking] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [online, setOnline] = useState(false)

  const recheck = () => {
    setChecking(true)
    setDone(null)
    setTimeout(() => {
      setChecking(false)
      setOnline(true)
      setDone('连接已恢复，已唤醒 3 个休眠任务')
    }, 1400)
  }

  const Row = ({ ok, title, sub }: { ok: boolean; title: string; sub: string }) => (
    <div className="flex items-center gap-3 py-3">
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-[#34a853]' : 'bg-[#f9ab00]'}`} />
      <div className="flex-1">
        <div className="text-[14px]">{title}</div>
        <div className="text-[12px] text-g-sub">{sub}</div>
      </div>
      <span className={`text-[13px] font-medium ${ok ? 'text-g-green' : 'text-[#b06000]'}`}>{ok ? '已连接' : '重试中'}</span>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto scroll-quiet">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
        <div>
          <h1 className="text-[28px] font-normal">设置与状态</h1>
          <p className="text-[14px] text-g-sub mt-1">一切自动运转。这里只是让你看见它在运转。</p>
        </div>

        <section>
          <h2 className="text-[16px] font-medium">连接与凭证</h2>
          <div className="mt-2 divide-y divide-g-line border-y border-g-line">
            <Row ok title="云端存储" sub="Worker · D1 数据库 · 延迟 42 ms" />
            <Row ok={online || false} title="浏览器采集插件" sub={online ? 'Chrome 扩展 v1.4.2 · 刚刚同步' : 'Chrome 扩展 v1.4.2 · 上次同步 18 分钟前'} />
          </div>
          <label className="block mt-4 text-[12px] text-g-sub">
            访问令牌
            <div className="mt-1 flex gap-2">
              <input
                type={show ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-g-line text-[14px] text-g-text font-mono focus:border-g-blue outline-none"
              />
              <Btn kind="outline" onClick={() => setShow((v) => !v)}>
                {show ? '隐藏' : '显示'}
              </Btn>
            </div>
          </label>
        </section>

        <section>
          <h2 className="text-[16px] font-medium">今日模型调用</h2>
          <p className="text-[12px] text-g-sub mt-0.5">达到每日保护上限后，剩余任务顺延至明日。</p>
          <div className="mt-5 space-y-5">
            <Meter label="阅读增强（摘要 / 翻译 / 清洗）" used={86} max={200} />
            <Meter label="分类判断（标签 / 合集）" used={241} max={300} />
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-medium">后台队列</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ['排队中', online ? 0 : 7, 'text-g-text'],
              ['重试中', online ? 0 : 3, 'text-[#b06000]'],
              ['已完成', online ? 131 : 128, 'text-g-green'],
            ].map(([l, n, c]) => (
              <div key={l as string} className="rounded-2xl border border-g-line p-4">
                <div className={`text-[32px] leading-none tabular-nums ${c}`}>{n}</div>
                <div className="text-[13px] text-g-sub mt-2">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-g-surface p-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[15px] font-medium">故障自动恢复</div>
            <p className="text-[13px] text-g-sub mt-0.5 leading-relaxed">
              网络故障或模型限流时，系统会按指数退避自动重试，无需干预。上游恢复后可立即唤醒休眠任务。
              {done && <span className="block text-g-green mt-1">{done}</span>}
            </p>
          </div>
          <Btn kind="primary" onClick={recheck} disabled={checking}>
            <Icon d={P.refresh} className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? '检测中…' : '重新检测服务连通性'}
          </Btn>
        </section>
      </div>
    </div>
  )
}
