import { useMemo, useState, type ReactNode } from 'react'
import { ARTS0, COLS0, DIMS, TAGS0, type Dim } from './data'
import { Collections, Settings, TagLibrary } from './Admin'
import { COL_DOT, Workspace } from './Library'
import { Icon, P } from './ui'

type View = 'lib' | 'col' | 'tag' | 'set'
type Quick = 'all' | 'todo'

const Group = ({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) => (
  <div className="mt-6">
    <div className="flex items-center justify-between px-3 mb-1.5">
      <span className="text-[11px] font-medium tracking-[.12em] text-g-sub">{title}</span>
      {right}
    </div>
    {children}
  </div>
)

const Item = ({ on, onClick, icon, dot, children, count }: { on?: boolean; onClick: () => void; icon?: string; dot?: string; children: ReactNode; count?: number | string }) => (
  <button
    onClick={onClick}
    className={`w-full h-8 px-3 rounded-lg flex items-center gap-2.5 text-[13.5px] text-left transition ${on ? 'bg-g-tint text-g-blue-dark font-medium' : 'text-[#3c4043] hover:bg-black/[.04]'}`}
  >
    {icon && <Icon d={icon} className="w-4 h-4 shrink-0" />}
    {dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />}
    <span className="flex-1 truncate">{children}</span>
    {count !== undefined && <span className={`text-[12px] tabular-nums ${on ? 'text-g-blue-dark' : 'text-g-sub'}`}>{count}</span>}
  </button>
)

export default function App() {
  const [view, setView] = useState<View>('lib')
  const [tags, setTags] = useState(TAGS0)
  const [cols, setCols] = useState(COLS0)
  const [arts, setArts] = useState(ARTS0)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<number | null>(null)
  const [quick, setQuick] = useState<Quick>('all')
  const [fCol, setFCol] = useState<string | null>(null)
  const [fTags, setFTags] = useState<string[]>([])
  const [mode, setMode] = useState<'any' | 'all'>('any')
  const [openDims, setOpenDims] = useState<Dim[]>(['topic'])

  const dimOf = (n: string): Dim => tags.find((t) => t.name === n)?.dim ?? 'topic'
  const update = (id: number, f: (a: (typeof arts)[number]) => (typeof arts)[number]) => setArts((x) => x.map((a) => (a.id === id ? f(a) : a)))

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase()
    return arts.filter((a) => {
      if (quick === 'todo' && !a.failed) return false
      if (k && ![a.title, a.summary, a.body.join(' '), a.url, a.links.map((l) => l.url + l.label).join(' ')].join(' ').toLowerCase().includes(k)) return false
      if (fTags.length && !(mode === 'any' ? fTags.some((t) => a.tags.includes(t)) : fTags.every((t) => a.tags.includes(t)))) return false
      if (fCol && !(fCol in a.cols)) return false
      return true
    })
  }, [arts, q, quick, fTags, mode, fCol])

  const filtering = quick !== 'all' || !!fCol || fTags.length > 0 || !!q.trim()
  const clear = () => {
    setQuick('all')
    setFCol(null)
    setFTags([])
    setQ('')
  }
  const goLib = (f: () => void) => {
    setView('lib')
    f()
  }
  const toggleTag = (n: string) => goLib(() => setFTags((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n])))

  const activeCols = cols.filter((c) => !c.archived).sort((a, b) => +b.pinned - +a.pinned)
  const heading = fCol
    ? cols.find((c) => c.id === fCol)?.name ?? '合集'
    : quick === 'todo'
      ? '待处理'
      : fTags.length
        ? `标签：${fTags.join(' ' + (mode === 'any' ? '或' : '且') + ' ')}`
        : q.trim()
          ? '搜索结果'
          : '全部资料'
  const todo = arts.filter((a) => a.failed).length

  return (
    <div className="h-full grid grid-cols-[248px_1fr] max-[900px]:grid-cols-[64px_1fr]">
      <aside className="h-full flex flex-col bg-g-surface border-r border-g-line min-h-0">
        <button onClick={() => goLib(() => { clear(); setSel(null) })} className="h-14 px-5 flex items-center gap-2.5 shrink-0">
          <svg viewBox="0 0 32 32" className="w-7 h-7" fill="#1f1f1f">
            <ellipse cx="16" cy="26" rx="12" ry="4.2" />
            <ellipse cx="16.5" cy="18.5" rx="8.5" ry="3.6" />
            <ellipse cx="15.5" cy="12" rx="5.5" ry="3" />
            <ellipse cx="16" cy="7" rx="3" ry="2.3" fill="#0b57d0" />
          </svg>
          <span className="font-serif text-[21px] font-semibold tracking-tight max-[900px]:hidden">Cairn</span>
        </button>

        <div className="flex-1 overflow-y-auto scroll-quiet px-3 pb-3 max-[900px]:hidden">
          <Group title="资料">
            <Item on={view === 'lib' && quick === 'all' && !fCol && !fTags.length} icon="M4 5h16v4H4zM4 11h16v8H4z" count={arts.length} onClick={() => goLib(() => { clear(); setSel(null) })}>
              全部资料
            </Item>
            <Item on={view === 'lib' && quick === 'todo'} icon="M12 8v5M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" count={todo || undefined} onClick={() => goLib(() => { clear(); setQuick('todo') })}>
              待处理
            </Item>
          </Group>

          <Group
            title="合集"
            right={
              <button onClick={() => setView('col')} aria-label="新建合集" className="w-5 h-5 grid place-items-center rounded hover:bg-black/[.06] text-g-sub">
                <Icon d={P.plus} className="w-3.5 h-3.5" />
              </button>
            }
          >
            {activeCols.map((c, i) => (
              <Item key={c.id} on={view === 'lib' && fCol === c.id} dot={COL_DOT[cols.indexOf(c) % COL_DOT.length]} count={arts.filter((a) => c.id in a.cols).length} onClick={() => goLib(() => { setQuick('all'); setFCol(fCol === c.id ? null : c.id) })}>
                {c.pinned && i === 0 ? <span className="inline-flex items-center gap-1">{c.name}</span> : c.name}
              </Item>
            ))}
          </Group>

          <Group
            title="标签"
            right={
              <div className="flex rounded-full bg-black/[.06] p-px text-[10.5px]">
                {(['any', 'all'] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`px-2 h-4 rounded-full ${mode === m ? 'bg-white shadow-sm text-g-text font-medium' : 'text-g-sub'}`}>
                    {m === 'any' ? '任一' : '全部'}
                  </button>
                ))}
              </div>
            }
          >
            {(Object.keys(DIMS) as Dim[]).map((d) => {
              const open = openDims.includes(d)
              const list = tags.filter((t) => t.dim === d && t.enabled)
              return (
                <div key={d}>
                  <button
                    onClick={() => setOpenDims((x) => (open ? x.filter((y) => y !== d) : [...x, d]))}
                    className="w-full h-7 px-3 flex items-center gap-1.5 text-[12.5px] text-g-sub hover:text-g-text"
                  >
                    <Icon d="M9 6l6 6-6 6" className={`w-3 h-3 transition ${open ? 'rotate-90' : ''}`} />
                    {DIMS[d].label}
                    <span className="ml-auto text-[11.5px]">{list.length}</span>
                  </button>
                  {open && (
                    <div className="flex flex-wrap gap-1 pl-7 pr-2 pb-2 pt-0.5">
                      {list.map((t) => {
                        const on = fTags.includes(t.name)
                        const n = arts.filter((a) => a.tags.includes(t.name)).length
                        return (
                          <button
                            key={t.name}
                            onClick={() => toggleTag(t.name)}
                            className={`h-6 px-2.5 rounded-full text-[12px] border transition ${on ? 'bg-g-blue border-g-blue text-white' : 'border-[#d3d6da] bg-white hover:border-[#9aa0a6]'}`}
                          >
                            {t.name} <span className={on ? 'text-white/70' : 'text-g-sub'}>{n}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </Group>

          <Group title="管理">
            <Item on={view === 'col'} icon="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" onClick={() => setView('col')}>
              合集管理
            </Item>
            <Item on={view === 'tag'} icon="M3 12V4h8l10 10-8 8zM7.5 8.5h.01" onClick={() => setView('tag')}>
              标签库
            </Item>
            <Item on={view === 'set'} icon="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1.5-2-3.5-2.4.8-1.6-1L14.5 4h-4L10 6.8l-1.6 1L6 7l-2 3.5L6 12" onClick={() => setView('set')}>
              设置与状态
            </Item>
          </Group>
        </div>

        <button onClick={() => setView('set')} className="shrink-0 m-3 p-3.5 rounded-xl bg-white border border-g-line text-left hover:shadow-sm transition max-[900px]:hidden">
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#34a853]" /> 后台运转正常
            <span className="ml-auto text-g-sub font-normal">排队 7 · 重试 3</span>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-g-sub">
            <span>今日分类调用</span>
            <span className="tabular-nums">241 / 300</span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-g-surface overflow-hidden">
            <div className="h-full bg-g-blue" style={{ width: '80%' }} />
          </div>
        </button>
      </aside>

      <main className="min-w-0 min-h-0 bg-white">
        {view === 'lib' && (
          <Workspace {...{ arts, shown, tags, cols, q, setQ, sel, setSel, update, dimOf, heading, filtering, clear }} />
        )}
        {view === 'col' && <Collections {...{ cols, setCols, arts, tags, setArts }} />}
        {view === 'tag' && <TagLibrary {...{ tags, setTags, arts }} />}
        {view === 'set' && <Settings />}
      </main>
    </div>
  )
}
