#!/usr/bin/env python3
"""
Generate local/figure-audit.html — a contact sheet of every chapter figure next to
its caption, filename, and crossref label, for reviewing whether they agree.

Run:       python3 utility/figure-audit.py     (from anywhere; paths resolve from __file__)
Then open: local/figure-audit.html             (generated, gitignored)

Re-run after any renaming pass. Working from a stale copy of the page is dangerous:
a filename in an old listing may refer to a different image after renames.

Covers chapters/ch*.qmd and chapters/images/ch*/. Three kinds of row:
  live      — a figure referenced by a chapter, file present
  unused    — a file on disk that no chapter references
  broken    — a chapter reference whose file is missing
  (live rows inside an HTML comment are marked "commented out")

Flag checkboxes persist in the browser (localStorage); "Copy flagged" puts a
markdown list on the clipboard to paste back into a chat or an issue.
"""

import os, re, glob, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "local", "figure-audit.html")
EXT = (".png", ".jpg", ".jpeg", ".svg", ".mp4", ".gif")

FIG = re.compile(
    r"!\[(?P<cap>(?:[^\[\]]|\[[^\]]*\])*)\]\((?P<path>images/[^)\s]+?)\)"
    r"(?:\{(?P<attrs>[^}]*)\})?",
    re.S,
)
LABEL = re.compile(r"#([A-Za-z0-9_-]+)")


def comment_spans(text):
    return [(m.start(), m.end()) for m in re.finditer(r"<!--.*?-->", text, re.S)]


def clean(cap):
    cap = re.sub(r"\s+", " ", cap).strip()
    return cap


def main():
    rows = []
    referenced = set()

    for qmd in sorted(glob.glob(os.path.join(ROOT, "chapters", "ch*.qmd"))):
        chfile = os.path.basename(qmd)
        ch = chfile[:4]
        text = open(qmd, encoding="utf-8").read()
        spans = comment_spans(text)
        line_starts = [m.start() for m in re.finditer(r"^", text, re.M)]

        for m in FIG.finditer(text):
            rel = m.group("path")
            abspath = os.path.normpath(os.path.join(ROOT, "chapters", rel))
            attrs = m.group("attrs") or ""
            lab = LABEL.search(attrs)
            commented = any(a <= m.start() < b for a, b in spans)
            line = sum(1 for s in line_starts if s <= m.start())
            referenced.add(abspath)
            rows.append(
                dict(
                    kind="broken" if not os.path.exists(abspath) else "live",
                    ch=ch,
                    chfile=chfile,
                    line=line,
                    file=os.path.basename(rel),
                    src=os.path.relpath(abspath, os.path.join(ROOT, "local")),
                    label=lab.group(1) if lab else "",
                    cap=clean(m.group("cap")),
                    commented=commented,
                )
            )

    # files on disk that nothing references
    for p in sorted(glob.glob(os.path.join(ROOT, "chapters", "images", "ch*", "*"))):
        if not p.lower().endswith(EXT):
            continue
        if os.path.normpath(p) in referenced:
            continue
        rows.append(
            dict(
                kind="unused",
                ch=os.path.basename(os.path.dirname(p)),
                chfile="",
                line=0,
                file=os.path.basename(p),
                src=os.path.relpath(p, os.path.join(ROOT, "local")),
                label="",
                cap="",
                commented=False,
            )
        )

    # mark build groups: 2+ files in a chapter sharing a base name minus trailing digits
    groups = collections.defaultdict(list)
    for r in rows:
        stem = os.path.splitext(r["file"])[0]
        groups[(r["ch"], re.sub(r"-\d+$", "", stem))].append(r)
    for members in groups.values():
        if len(members) > 1:
            for r in members:
                r["build"] = True
    for r in rows:
        r.setdefault("build", False)
        r["id"] = f'{r["ch"]}/{r["file"]}'

    rows.sort(key=lambda r: (r["ch"], r["kind"] != "live", r["line"], r["file"]))

    counts = collections.Counter(r["kind"] for r in rows)
    n_build = sum(1 for r in rows if r["build"])

    body = [HEAD.replace("__DATA__", json.dumps(rows))]
    body.append(
        f"""<header>
<h1>Figure audit</h1>
<p class="sub">Every chapter figure next to its caption, filename, and label.
Check the box on anything where they disagree, then <b>Copy flagged</b> and paste the list back.</p>
<div class="stats">
  <span><b>{counts['live']}</b> referenced</span>
  <span><b>{counts['unused']}</b> unused files</span>
  <span><b>{counts['broken']}</b> broken paths</span>
  <span><b>{n_build}</b> in build groups</span>
</div>
<div class="bar">
  <input id="q" type="search" placeholder="filter by chapter, filename, label, or caption text&hellip;">
  <span class="filters">
    <button class="f on" data-f="all">all</button>
    <button class="f" data-f="build">build groups</button>
    <button class="f" data-f="part1">Part 1</button>
    <button class="f" data-f="unused">unused</button>
    <button class="f" data-f="broken">broken</button>
    <button class="f" data-f="flagged">flagged</button>
  </span>
  <button id="copy">Copy flagged</button>
  <button id="clear" class="ghost">Clear flags</button>
  <span id="shown" class="shown"></span>
</div>
</header>
<main id="list"></main>"""
    )
    body.append(TAIL)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(body))
    print(f"wrote {os.path.relpath(OUT, ROOT)}")
    print(f"  {counts['live']} referenced, {counts['unused']} unused, "
          f"{counts['broken']} broken, {n_build} in build groups")


HEAD = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figure audit — Human Neuroimaging with MRI</title>
<style>
:root{--bg:#fbfbfa;--fg:#1a1a19;--dim:#6b6b66;--line:#e2e2dd;--card:#fff;--accent:#8b1a1a;--warn:#b45309;--flag:#fff8e1}
@media (prefers-color-scheme:dark){:root{--bg:#161614;--fg:#eceae5;--dim:#9a978f;--line:#2e2c28;--card:#1e1d1a;--accent:#e07a5f;--warn:#d99a2b;--flag:#2a2418}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,-apple-system,"Segoe UI",system-ui,sans-serif}
header{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line);padding:18px 22px 12px}
h1{margin:0;font-size:20px;letter-spacing:-.01em}
.sub{margin:4px 0 10px;color:var(--dim);font-size:13px;max-width:70ch}
.stats{display:flex;gap:18px;flex-wrap:wrap;font-size:12.5px;color:var(--dim);margin-bottom:10px}
.stats b{color:var(--fg)}
.bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#q{flex:1 1 260px;min-width:200px;padding:7px 10px;border:1px solid var(--line);border-radius:7px;background:var(--card);color:var(--fg);font:inherit;font-size:13px}
button{padding:6px 11px;border:1px solid var(--line);border-radius:7px;background:var(--card);color:var(--fg);font:inherit;font-size:12.5px;cursor:pointer}
button:hover{border-color:var(--dim)}
.f.on{background:var(--accent);border-color:var(--accent);color:#fff}
.filters{display:flex;gap:5px;flex-wrap:wrap}
.ghost{color:var(--dim)}
.shown{color:var(--dim);font-size:12.5px;margin-left:auto}
main{padding:16px 22px 60px;max-width:1180px}
.chap{margin:26px 0 8px;font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--accent);letter-spacing:.08em;text-transform:uppercase}
.row{display:grid;grid-template-columns:auto 300px 1fr;gap:14px;align-items:start;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--card);margin-bottom:9px}
.row.flagged{background:var(--flag);border-color:var(--warn)}
.row img,.row video{width:100%;border-radius:6px;background:#0002;display:block}
.miss{width:100%;aspect-ratio:16/9;border:1px dashed var(--warn);border-radius:6px;display:grid;place-items:center;color:var(--warn);font-size:12px}
.meta{min-width:0}
.file{font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
.lab{font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim);word-break:break-all}
.cap{margin-top:7px;font-size:13.5px}
.cap.none{color:var(--dim);font-style:italic}
.tags{margin-top:7px;display:flex;gap:6px;flex-wrap:wrap}
.tag{font-size:11px;padding:2px 7px;border-radius:99px;border:1px solid var(--line);color:var(--dim)}
.tag.b{border-color:var(--warn);color:var(--warn)}
.src{color:var(--dim);font-size:11.5px;margin-top:6px;font-family:ui-monospace,Menlo,monospace}
input[type=checkbox]{width:17px;height:17px;margin-top:3px;cursor:pointer;accent-color:var(--accent)}
@media(max-width:760px){.row{grid-template-columns:auto 1fr}.row .thumb{grid-column:1/-1}}
</style></head><body>
<script id="data" type="application/json">__DATA__</script>"""

TAIL = """<script>
const ROWS = JSON.parse(document.getElementById('data').textContent);
const KEY = 'mri-figure-audit-flags';
let flags = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
let filter = 'all', q = '';
const list = document.getElementById('list');

function visible(r){
  if(filter==='build'   && !r.build) return false;
  if(filter==='part1'   && !/^ch0[1-4]$/.test(r.ch)) return false;
  if(filter==='unused'  && r.kind!=='unused') return false;
  if(filter==='broken'  && r.kind!=='broken') return false;
  if(filter==='flagged' && !flags.has(r.id)) return false;
  if(q){
    const hay = (r.ch+' '+r.file+' '+r.label+' '+r.cap+' '+r.chfile).toLowerCase();
    if(!hay.includes(q)) return false;
  }
  return true;
}

function media(r){
  if(r.kind==='broken') return '<div class="miss">file not found</div>';
  if(/\\.mp4$/i.test(r.file)) return `<video src="${r.src}" preload="metadata" muted controls></video>`;
  return `<img loading="lazy" src="${r.src}" alt="">`;
}

function render(){
  const rows = ROWS.filter(visible);
  let out = '', ch = null;
  for(const r of rows){
    if(r.ch !== ch){ ch = r.ch; out += `<div class="chap">${ch}</div>`; }
    const tags = [];
    if(r.build) tags.push('<span class="tag b">build group</span>');
    if(r.kind==='unused') tags.push('<span class="tag b">unused file</span>');
    if(r.kind==='broken') tags.push('<span class="tag b">broken path</span>');
    if(r.commented) tags.push('<span class="tag">commented out</span>');
    out += `<div class="row ${flags.has(r.id)?'flagged':''}" data-id="${r.id}">
      <input type="checkbox" ${flags.has(r.id)?'checked':''}>
      <div class="thumb">${media(r)}</div>
      <div class="meta">
        <div class="file">${r.file}</div>
        ${r.label?`<div class="lab">#${r.label}</div>`:''}
        <div class="cap ${r.cap?'':'none'}">${r.cap||'(no caption — not referenced by any chapter)'}</div>
        <div class="tags">${tags.join('')}</div>
        ${r.chfile?`<div class="src">${r.chfile}:${r.line}</div>`:''}
      </div></div>`;
  }
  list.innerHTML = out || '<p style="color:var(--dim)">Nothing matches.</p>';
  document.getElementById('shown').textContent = `${rows.length} shown · ${flags.size} flagged`;
}

list.addEventListener('change', e => {
  if(e.target.type!=='checkbox') return;
  const id = e.target.closest('.row').dataset.id;
  flags.has(id) ? flags.delete(id) : flags.add(id);
  localStorage.setItem(KEY, JSON.stringify([...flags]));
  render();
});
document.getElementById('q').addEventListener('input', e => { q = e.target.value.toLowerCase().trim(); render(); });
document.querySelectorAll('.f').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.f').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); filter = b.dataset.f; render();
}));
document.getElementById('copy').addEventListener('click', async () => {
  const picked = ROWS.filter(r => flags.has(r.id));
  if(!picked.length) return alert('Nothing flagged yet.');
  const md = picked.map(r =>
    `- \\`${r.ch}/${r.file}\\`${r.label?` (#${r.label})`:''}${r.chfile?` — ${r.chfile}:${r.line}`:' — unused'}\\n  caption: ${r.cap||'(none)'}`
  ).join('\\n');
  await navigator.clipboard.writeText(`Figures needing attention (${picked.length}):\\n\\n${md}\\n`);
  const b = document.getElementById('copy'); b.textContent = `Copied ${picked.length}`;
  setTimeout(()=>b.textContent='Copy flagged', 1600);
});
document.getElementById('clear').addEventListener('click', () => {
  if(!flags.size || !confirm(`Clear all ${flags.size} flags?`)) return;
  flags.clear(); localStorage.setItem(KEY,'[]'); render();
});
render();
</script></body></html>"""


if __name__ == "__main__":
    main()
