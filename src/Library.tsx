import { useEffect, useState, type ReactNode } from 'react'
import { DIMS, type Article, type Collection, type Dim, type Tag } from './data'
import { Btn, Chip, Icon, P } from './ui'

type Update = (id: number, f: (a: Article) => Article) => void

export const COL_DOT = ['#0b57d0', '#1e8e5a', '#d9822b', '#8e4ec6', '#c2410c', '#0e7490']

const Mark = ({ text, q }: { text: string; q: string }): ReactNode => {
  const k = q.trim()
  if (!k) return text
  const i = text.toLowerCase().indexOf(k.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[#fde9a8] text-inherit rounded-sm">{text.slice(i, i + k.length)}</mark>
      {text.slice(i + k.length)}
    </>
  )
}

const Label = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="flex items-center justify-between mb-2.5">
    <span className="text-[11px] font-medium tracking-[.12em] text-g-sub uppercase">{children}</span>
    {right}
  </div>
)

/* ------------------------------ 工作台 ------------------------------ */

export function Workspace(p: {
  arts: Article[]
  shown: Article[]
  tags: Tag[]
  cols: Collection[]
  q: string
  setQ: (v: string) => void
  sel: number | null
  setSel: (id: number | null) => void
  update: Update
  dimOf: (n: string) => Dim
  heading: string
  filtering: boolean
  clear: () => void
}) {
  const a = p.arts.find((x) => x.id === p.sel) ?? null
  return (
    <div className="h-full grid grid-cols-[372px_1fr] max-[900px]:grid-cols-1">
      <ArticleList {...p} />
      <div className="min-w-0 h-full bg-white max-[900px]:hidden">
        {a ? (
          <Reader key={a.id} a={a} {...p} />
        ) : (
          <Overview arts={p.arts} cols={p.cols} open={p.setSel} dimOf={p.dimOf} />
        )}
      </div>
    </div>
  )
}

/* ------------------------------ 列表 ------------------------------ */

function ArticleList(p: Parameters<typeof Workspace>[0]) {
  const { shown, q, sel, cols } = p
  return (
    <section className="h-full flex flex-col bg-g-paper border-r border-g-line min-w-0">
      <div className="p-4 pb-3 space-y-3 shrink-0">
        <div className="relative">
          <Icon d={P.search} className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-g-sub" />
          <input
            value={q}
            onChange={(e) => p.setQ(e.target.value)}
            placeholder="搜索标题、摘要、正文、链接"
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-g-line text-[14px] focus:border-g-blue focus:shadow-[0_0_0_3px_rgba(11,87,208,.1)] outline-none transition"
          />
          {q && (
            <button onClick={() => p.setQ('')} aria-label="清除" className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full hover:bg-g-surface text-g-sub">
              <Icon d={P.x} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[18px] font-semibold truncate">{p.heading}</h2>
          <span className="text-[12px] text-g-sub shrink-0 ml-3">
            {shown.length} 篇
            {p.filtering && (
              <button onClick={p.clear} className="ml-2 text-g-blue font-medium hover:underline">
                清除
              </button>
            )}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-quiet border-t border-g-line">
        {shown.length === 0 && <p className="py-16 text-center text-[13px] text-g-sub">没有匹配的资料</p>}
        {shown.map((a) => {
          const on = sel === a.id
          return (
            <button
              key={a.id}
              onClick={() => p.setSel(a.id)}
              className={`relative w-full text-left px-4 py-3.5 border-b border-g-line transition ${on ? 'bg-white' : 'hover:bg-white/70'}`}
            >
              {on && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-g-blue" />}
              <div className="flex items-center gap-2 text-[11.5px] text-g-sub">
                <span className="text-g-green truncate">{a.source}</span>
                <span className="shrink-0">· {a.date}</span>
                {a.failed && <span className="ml-auto shrink-0 text-[#b06000] font-medium">待补充</span>}
              </div>
              <h3 className={`font-serif text-[16px] leading-snug mt-1 line-clamp-2 ${on ? 'text-g-blue-dark' : ''} font-medium`}>
                <Mark text={a.title} q={q} />
              </h3>
              {!a.failed && (
                <>
                  <p className="text-[12.5px] leading-[1.65] text-g-sub mt-1.5 line-clamp-2">
                    <Mark text={a.summary} q={q} />
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {a.tags.slice(0, 3).map((t) => (
                      <Chip key={t} dim={p.dimOf(t)}>
                        {t}
                      </Chip>
                    ))}
                    {a.tags.length > 3 && <span className="text-[11px] text-g-sub">+{a.tags.length - 3}</span>}
                    <span className="ml-auto flex gap-1">
                      {Object.keys(a.cols).map((id) => (
                        <span
                          key={id}
                          title={cols.find((c) => c.id === id)?.name}
                          className="w-2 h-2 rounded-full"
                          style={{ background: COL_DOT[cols.findIndex((c) => c.id === id) % COL_DOT.length] }}
                        />
                      ))}
                    </span>
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------ 总览 ------------------------------ */

function Overview({ arts, cols, open, dimOf }: { arts: Article[]; cols: Collection[]; open: (id: number) => void; dimOf: (n: string) => Dim }) {
  const failed = arts.filter((a) => a.failed)
  const placed = arts.filter((a) => Object.keys(a.cols).length).length
  const tagCount = arts.reduce((n, a) => n + a.tags.length, 0)
  const events = arts
    .filter((a) => !a.failed)
    .flatMap((a, i) => [
      ...Object.keys(a.cols).map((id) => ({
        a,
        t: `${9 + i}:${10 + i * 7}`,
        text: `自动加入合集「${cols.find((c) => c.id === id)?.name}」`,
        dot: COL_DOT[cols.findIndex((c) => c.id === id) % COL_DOT.length],
      })),
      { a, t: `${8 + i}:${22 + i * 5}`, text: `生成摘要，并赋予 ${a.tags.length} 个标签`, dot: '#9aa0a6' },
    ])
    .sort((x, y) => (x.t < y.t ? 1 : -1))
    .slice(0, 7)

  return (
    <div className="h-full overflow-y-auto scroll-quiet">
      <div className="max-w-[860px] mx-auto px-10 py-10 rise">
        <div className="text-[12px] text-g-sub tracking-wide">10 月 12 日 · 周一</div>
        <h1 className="text-[30px] font-semibold mt-1.5 leading-tight">今天已整理 {arts.length} 篇资料</h1>
        <p className="text-[14px] text-g-sub mt-1.5">摘要、标签与合集均已自动生效。从左侧选一篇开始阅读。</p>

        <div className="grid grid-cols-4 mt-8 border border-g-line rounded-xl divide-x divide-g-line overflow-hidden max-[1100px]:grid-cols-2 max-[1100px]:divide-y">
          {[
            [arts.length, '今日入库', '#1f1f1f'],
            [tagCount, '标签已生效', '#1f1f1f'],
            [placed, '自动入集', '#0b57d0'],
            [failed.length, '待你处理', '#b06000'],
          ].map(([n, l, c]) => (
            <div key={l as string} className="px-5 py-4">
              <div className="font-serif text-[32px] leading-none tabular-nums" style={{ color: c as string }}>
                {n}
              </div>
              <div className="text-[12.5px] text-g-sub mt-2">{l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1.35fr_1fr] gap-10 mt-10 max-[1100px]:grid-cols-1">
          <section>
            <Label>最近自动化动态</Label>
            <ul className="border-t border-g-line">
              {events.map((e, i) => (
                <li key={i}>
                  <button onClick={() => open(e.a.id)} className="w-full flex items-start gap-3 py-3 border-b border-g-line text-left hover:bg-g-paper -mx-2 px-2 rounded transition">
                    <span className="w-2 h-2 rounded-full mt-[7px] shrink-0" style={{ background: e.dot }} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] truncate font-medium">{e.a.title}</span>
                      <span className="block text-[12.5px] text-g-sub mt-0.5">{e.text}</span>
                    </span>
                    <span className="text-[11.5px] text-g-sub tabular-nums mt-0.5">{e.t}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-9">
            <section>
              <Label>需要看一眼</Label>
              {failed.length === 0 ? (
                <p className="text-[13px] text-g-sub border-t border-g-line pt-3">一切正常。</p>
              ) : (
                failed.map((a) => (
                  <button key={a.id} onClick={() => open(a.id)} className="w-full text-left rounded-xl bg-[#fdf6e7] border border-[#f1dfb3] p-4 hover:shadow-sm transition">
                    <div className="text-[11.5px] font-medium text-[#8a5a00]">正文未抓到</div>
                    <div className="font-serif text-[15px] font-medium mt-1 leading-snug">{a.title}</div>
                    <div className="text-[12.5px] text-g-blue mt-2">手动粘贴正文 →</div>
                  </button>
                ))
              )}
            </section>
            <section>
              <Label>合集增长</Label>
              <ul className="border-t border-g-line">
                {cols
                  .filter((c) => !c.archived)
                  .map((c, i) => {
                    const n = arts.filter((a) => c.id in a.cols).length
                    return (
                      <li key={c.id} className="flex items-center gap-3 py-2.5 border-b border-g-line">
                        <span className="w-2 h-2 rounded-full" style={{ background: COL_DOT[i % COL_DOT.length] }} />
                        <span className="flex-1 text-[13.5px] truncate">{c.name}</span>
                        <div className="w-20 h-1 rounded-full bg-g-surface overflow-hidden">
                          <div className="h-full" style={{ width: Math.min(100, n * 40) + '%', background: COL_DOT[i % COL_DOT.length] }} />
                        </div>
                        <span className="text-[12.5px] tabular-nums text-g-sub w-5 text-right">{n}</span>
                      </li>
                    )
                  })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ 阅读 + 检查器 ------------------------------ */

function Reader({
  a,
  arts,
  tags,
  cols,
  update,
  dimOf,
  setSel,
}: {
  a: Article
  arts: Article[]
  tags: Tag[]
  cols: Collection[]
  update: Update
  dimOf: (n: string) => Dim
  setSel: (id: number | null) => void
}) {
  const [raw, setRaw] = useState(false)
  const [insp, setInsp] = useState(typeof window === 'undefined' || window.innerWidth >= 1360)
  const [paste, setPaste] = useState('')
  const [progress, setProgress] = useState(0)
  const idx = arts.findIndex((x) => x.id === a.id)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return
      if (e.key === 'Escape') setSel(null)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setSel])

  const submitPaste = () => {
    const paras = paste.split(/\n+/).filter(Boolean)
    if (!paras.length) return
    update(a.id, (x) => ({ ...x, failed: false, body: paras, raw: paste, lang: '中文', summary: paras[0].slice(0, 100), tags: ['大语言模型', '博客文章', '网页'] }))
    setPaste('')
  }

  return (
    <div className="h-full flex relative overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-12 shrink-0 flex items-center gap-1 px-4 border-b border-g-line relative">
          <button onClick={() => setSel(null)} title="回到总览 (Esc)" className="h-8 px-3 rounded-full text-[13px] text-g-sub hover:bg-g-surface inline-flex items-center gap-1">
            <Icon d="M15 6l-6 6 6 6" className="w-4 h-4" /> 总览
          </button>
          <span className="text-[12px] text-g-sub tabular-nums ml-1">
            {idx + 1} / {arts.length}
          </span>
          <button disabled={idx <= 0} onClick={() => setSel(arts[idx - 1].id)} aria-label="上一篇" className="w-8 h-8 grid place-items-center rounded-full hover:bg-g-surface disabled:opacity-30">
            <Icon d="M6 15l6-6 6 6" className="w-4 h-4" />
          </button>
          <button disabled={idx >= arts.length - 1} onClick={() => setSel(arts[idx + 1].id)} aria-label="下一篇" className="w-8 h-8 grid place-items-center rounded-full hover:bg-g-surface disabled:opacity-30">
            <Icon d="M6 9l6 6 6-6" className="w-4 h-4" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            {!a.failed && (
              <div className="flex rounded-full bg-g-surface p-0.5 text-[12.5px]">
                {[
                  [false, '净读'],
                  [true, '原文快照'],
                ].map(([v, l]) => (
                  <button key={String(l)} onClick={() => setRaw(v as boolean)} className={`h-7 px-3.5 rounded-full transition ${raw === v ? 'bg-white shadow-sm font-medium' : 'text-g-sub'}`}>
                    {l as string}
                  </button>
                ))}
              </div>
            )}
            <a href={a.url} onClick={(e) => e.preventDefault()} className="h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[12.5px] text-g-blue font-medium hover:bg-g-tint">
              原网页 <Icon d={P.ext} className="w-3.5 h-3.5" />
            </a>
            {!a.failed && (
              <button
                onClick={() => setInsp((v) => !v)}
                aria-pressed={insp}
                className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[12.5px] font-medium ${insp ? 'bg-g-tint text-g-blue-dark' : 'text-g-sub hover:bg-g-surface'}`}
              >
                <Icon d={P.edit} className="w-3.5 h-3.5" /> 整理
              </button>
            )}
          </div>
          <div className="absolute left-0 bottom-[-1px] h-0.5 bg-g-blue" style={{ width: progress + '%' }} />
        </div>

        <div
          className="flex-1 overflow-y-auto scroll-quiet"
          onScroll={(e) => {
            const el = e.currentTarget
            setProgress((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * 100)
          }}
        >
          <article className="max-w-[660px] mx-auto px-8 pt-10 pb-28 rise">
            <div className="text-[12.5px] text-g-sub">
              <span className="text-g-green">{a.source}</span> · {a.date} · {a.lang}
            </div>
            <h1 className="text-[30px] leading-[1.3] font-semibold mt-3">{a.title}</h1>

            {a.failed ? (
              <div className="mt-8 rounded-xl bg-g-paper border border-g-line p-6">
                <div className="font-serif text-[18px] font-medium">这篇没能抓到正文</div>
                <p className="text-[13.5px] text-g-sub mt-1.5 leading-relaxed">页面可能需要登录或由脚本动态加载。粘贴正文并保存后，会自动生成摘要、标签并归入合集。</p>
                <textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={9}
                  placeholder="在此粘贴正文…"
                  className="mt-4 w-full rounded-lg border border-g-line bg-white p-3.5 text-[14.5px] leading-relaxed resize-none focus:border-g-blue outline-none"
                />
                <div className="mt-3">
                  <Btn kind="primary" onClick={submitPaste} disabled={!paste.trim()}>
                    保存并自动整理
                  </Btn>
                </div>
              </div>
            ) : (
              <>
                <aside className="mt-6 pl-4 border-l-2 border-g-blue">
                  <div className="text-[10.5px] font-medium tracking-[.14em] text-g-blue-dark">摘要 · ABSTRACT</div>
                  <p className="font-serif text-[16px] leading-[1.8] mt-1.5 text-[#2b2b2b]">{a.summary}</p>
                </aside>
                {raw ? (
                  <pre className="mt-8 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.8] text-g-sub bg-g-surface rounded-xl p-5">{a.raw}</pre>
                ) : (
                  <div className="mt-8 font-serif text-[17.5px] leading-[1.95] space-y-5 text-[#222]">
                    {a.body.map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </div>

      {insp && !a.failed && (
        <Inspector a={a} tags={tags} cols={cols} update={update} dimOf={dimOf} close={() => setInsp(false)} />
      )}
    </div>
  )
}

function Inspector({ a, tags, cols, update, dimOf, close }: { a: Article; tags: Tag[]; cols: Collection[]; update: Update; dimOf: (n: string) => Dim; close: () => void }) {
  const [adding, setAdding] = useState(false)
  const addable = tags.filter((t) => t.enabled && !a.tags.includes(t.name))
  const removeTag = (n: string) => update(a.id, (x) => ({ ...x, tags: x.tags.filter((t) => t !== n), excluded: [...x.excluded, n] }))
  const addTag = (n: string) => {
    update(a.id, (x) => ({ ...x, tags: [...x.tags, n], excluded: x.excluded.filter((e) => e !== n) }))
    setAdding(false)
  }
  const toggleCol = (id: string) =>
    update(a.id, (x) => {
      const c = { ...x.cols }
      if (id in c) delete c[id]
      else c[id] = ''
      return { ...x, cols: c }
    })

  return (
    <aside className="w-[296px] shrink-0 h-full border-l border-g-line bg-g-paper overflow-y-auto scroll-quiet max-[1360px]:absolute max-[1360px]:right-0 max-[1360px]:top-0 max-[1360px]:shadow-[-12px_0_28px_rgba(0,0,0,.08)] slide-in z-10">
      <div className="h-12 px-5 flex items-center justify-between border-b border-g-line">
        <span className="text-[13px] font-semibold">整理</span>
        <button onClick={close} aria-label="收起" className="w-7 h-7 grid place-items-center rounded-full hover:bg-g-surface text-g-sub">
          <Icon d={P.x} className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-7">
        <section>
          <Label>标签 · {a.tags.length}</Label>
          <div className="flex flex-wrap gap-1.5 items-center">
            {a.tags.map((t) => (
              <Chip key={t} dim={dimOf(t)} onRemove={() => removeTag(t)}>
                {t}
              </Chip>
            ))}
            <div className="relative">
              <button onClick={() => setAdding((v) => !v)} className="h-6 px-2.5 rounded-full border border-dashed border-[#b6bac0] text-[12px] text-g-sub hover:bg-white inline-flex items-center gap-1">
                <Icon d={P.plus} className="w-3 h-3" /> 添加
              </button>
              {adding && (
                <div className="absolute z-20 top-8 left-0 w-52 max-h-56 overflow-y-auto scroll-quiet bg-white rounded-xl border border-g-line shadow-[0_8px_24px_rgba(0,0,0,.12)] py-1">
                  {addable.map((t) => (
                    <button key={t.name} onClick={() => addTag(t.name)} className="w-full text-left px-3.5 h-8 text-[13px] hover:bg-g-surface flex justify-between items-center">
                      {t.name}
                      <span className="text-[10.5px] text-g-sub">{DIMS[t.dim].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-[11.5px] text-g-sub mt-2.5 leading-relaxed">
            点 ✕ 移除后不会再被自动加回。
            {a.excluded.length > 0 && <span className="block mt-0.5">已排除：{a.excluded.join('、')}</span>}
          </p>
        </section>

        <section>
          <Label>合集</Label>
          <div>
            {cols
              .filter((c) => !c.archived)
              .map((c, i) => {
                const on = c.id in a.cols
                return (
                  <div key={c.id} className="py-1.5">
                    <button onClick={() => toggleCol(c.id)} aria-pressed={on} className="w-full flex items-center gap-2.5 text-left">
                      <span className={`w-4 h-4 rounded-[4px] border-2 grid place-items-center shrink-0 transition ${on ? 'bg-g-blue border-g-blue text-white' : 'border-[#80868b] bg-white'}`}>
                        {on && <Icon d={P.check} className="w-2.5 h-2.5" />}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: COL_DOT[i % COL_DOT.length] }} />
                      <span className="text-[13px]">{c.name}</span>
                    </button>
                    {on && (
                      <input
                        value={a.cols[c.id]}
                        onChange={(e) => update(a.id, (x) => ({ ...x, cols: { ...x.cols, [c.id]: e.target.value } }))}
                        placeholder="一句备注…"
                        className="mt-1 ml-[26px] w-[calc(100%-26px)] h-7 border-b border-g-line text-[12.5px] bg-transparent focus:border-g-blue outline-none"
                      />
                    )}
                  </div>
                )
              })}
          </div>
        </section>

        <section>
          <Label>引用 · {a.links.length}</Label>
          {a.links.length === 0 ? (
            <p className="text-[12.5px] text-g-sub">文中没有外部引用。</p>
          ) : (
            <ol className="border-t border-g-line">
              {a.links.map((l, i) => (
                <li key={l.url} className="flex gap-2.5 py-2.5 border-b border-g-line">
                  <span className="font-mono text-[11px] text-g-sub pt-0.5">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] leading-snug text-g-blue">{l.label}</div>
                    <div className="text-[11px] text-g-green mt-0.5 truncate">{l.url}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <Label>来源</Label>
          <dl className="text-[12.5px] grid grid-cols-[48px_1fr] gap-y-1.5">
            <dt className="text-g-sub">网址</dt>
            <dd className="truncate text-g-green">{a.url.replace('https://', '')}</dd>
            <dt className="text-g-sub">语言</dt>
            <dd>{a.lang}</dd>
            <dt className="text-g-sub">入库</dt>
            <dd>{a.date}</dd>
          </dl>
        </section>
      </div>
    </aside>
  )
}
