from pathlib import Path
import re

root = Path('ucitysocial')
APP_BASE = 'https://deploy-preview-2--universecitystage.netlify.app'
APPLY_URL = APP_BASE + '/join'
LOGIN_URL = APP_BASE + '/login'

for p in root.glob('*.html'):
    s = p.read_text()
    s = re.sub(r'\s*<a href="(?:index\.html)?#trust">The trust</a>', '', s)
    s = re.sub(r'\s*<a href="#trust">The trust</a>', '', s)
    s = re.sub(r'\s*<a href="#">The trust</a>', '', s)
    s = s.replace('<a href="join.html" class="cta">See membership</a>', f'<a href="{APPLY_URL}" class="cta">Apply</a>')
    if 'Member sign in' not in s:
        s = s.replace('<a href="join.html">Membership</a>', f'<a href="join.html">Membership</a>\n    <a href="{LOGIN_URL}">Member sign in</a>')
    p.write_text(s)

p = root / 'index.html'
s = p.read_text()
founder_pat = re.compile(r'<!-- ABOUT TEASER -->\n<section class="about" id="about">.*?</section>\n\n', re.S)
m = founder_pat.search(s)
if not m:
    raise SystemExit('Founder teaser block not found')
founder_block = m.group(0)
s = s[:m.start()] + s[m.end():]
s = s.replace('<!-- 11 PRICING -->\n', '')
if '<!-- 4 DEPARTMENTS -->' not in s:
    raise SystemExit('Departments marker not found')
s = s.replace('<!-- 4 DEPARTMENTS -->', founder_block + '<!-- 4 DEPARTMENTS -->', 1)

dept_section = '''<!-- 4 DEPARTMENTS -->
<section class="deptcards" id="departments"><div class="w">
 <span class="k rv" style="color:var(--pa)">the departments</span>
 <h2 class="rv d1">Four departments. Forty-eight folders.</h2>
 <p class="lead rv d2 mt3" style="max-width:56ch">Choose a department to see all twelve folders and the job each folder gives your agent.</p>
 <div class="deptgrid stagger rv d2">
  <a class="deptcard" href="agency-assessment.html" style="--c:var(--pa)">
   <div class="dtop"><span class="roman">I</span><span class="count">12 FOLDERS</span></div>
   <h3>Agency Assessment</h3><p>Understand your current situation.</p>
   <div class="folderlist"><span class="one"><b>01</b>Time</span><span><b>02</b>Health</span><span><b>03</b>Language</span><span><b>04</b>Background</span><span><b>05</b>Identification</span><span><b>06</b>Finance</span><span><b>07</b>Legal</span><span><b>08</b>Mediation</span><span><b>09</b>Education</span><span><b>10</b>Employment</span><span><b>11</b>Regulation</span><span><b>12</b>Community</span></div>
   <div class="deep">Open all 12 folders &rarr;</div>
  </a>
  <a class="deptcard" href="housing-stability.html" style="--c:var(--hs)">
   <div class="dtop"><span class="roman">II</span><span class="count">12 FOLDERS</span></div>
   <h3>Housing Stability</h3><p>Manage your living environment.</p>
   <div class="folderlist"><span class="one"><b>01</b>Inventory</span><span><b>02</b>Storage</span><span><b>03</b>Sanitation</span><span><b>04</b>Organization</span><span><b>05</b>Information</span><span><b>06</b>Administration</span><span><b>07</b>Law</span><span><b>08</b>Privacy</span><span><b>09</b>Transportation</span><span><b>10</b>Maintenance</span><span><b>11</b>Technology</span><span><b>12</b>Communal Space</span></div>
   <div class="deep">Open all 12 folders &rarr;</div>
  </a>
  <a class="deptcard" href="career-development.html" style="--c:var(--cd)">
   <div class="dtop"><span class="roman">III</span><span class="count">12 FOLDERS</span></div>
   <h3>Career Development</h3><p>Expand your work options.</p>
   <div class="folderlist"><span class="one"><b>01</b>Salary</span><span><b>02</b>Schedule</span><span><b>03</b>Skill</span><span><b>04</b>Scope</span><span><b>05</b>Integrity</span><span><b>06</b>Professionalism</span><span><b>07</b>Resources</span><span><b>08</b>KPIs</span><span><b>09</b>Advancement</span><span><b>10</b>Leadership</span><span><b>11</b>Info Technology</span><span><b>12</b>Networking</span></div>
   <div class="deep">Open all 12 folders &rarr;</div>
  </a>
  <a class="deptcard" href="life-management.html" style="--c:var(--lm)">
   <div class="dtop"><span class="roman">IV</span><span class="count">12 FOLDERS</span></div>
   <h3>Life Management</h3><p>Set your priorities.</p>
   <div class="folderlist"><span class="one"><b>01</b>Standards</span><span><b>02</b>Survival</span><span><b>03</b>Perception</span><span><b>04</b>Instinct</span><span><b>05</b>Identity</span><span><b>06</b>Ethics</span><span><b>07</b>Equilibrium</span><span><b>08</b>Boundary</span><span><b>09</b>Discernment</span><span><b>10</b>Prioritization</span><span><b>11</b>Systems</span><span><b>12</b>Socializing</span></div>
   <div class="deep">Open all 12 folders &rarr;</div>
  </a>
 </div>
</div></section>

<!-- 5 DECISION ROOM -->'''
s, n = re.subn(r'<!-- 4 DEPARTMENTS -->.*?<!-- 5 DECISION ROOM -->', dept_section, s, flags=re.S)
if n != 1:
    raise SystemExit(f'Department section replacement count={n}')

card_css = '''
/* ===== 4 DEPARTMENTS — clickable cards ===== */
.deptcards{padding:var(--s5) 0;background:var(--paper);border-bottom:2px solid var(--ink)}
.deptcards h2{max-width:16ch}
.deptgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,24px);margin-top:var(--s4)}
@media(max-width:860px){.deptgrid{grid-template-columns:1fr}}
.deptcard{display:flex;flex-direction:column;min-height:100%;padding:clamp(20px,2.4vw,30px);background:var(--paper);border:2px solid var(--ink);border-top:8px solid var(--c);color:var(--ink);text-decoration:none;box-shadow:7px 7px 0 var(--ink);transition:transform .16s ease,box-shadow .16s ease,background .2s ease}
.deptcard:hover{transform:translate(-2px,-2px);box-shadow:10px 10px 0 var(--ink);background:#fffaf5}
.deptcard:focus-visible{outline:3px solid var(--c);outline-offset:5px}
.deptcard .dtop{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:var(--s2)}
.deptcard .roman{font-family:var(--record);font-size:clamp(34px,4vw,54px);line-height:.8;color:var(--c)}
.deptcard .count{font-family:var(--record);font-size:14px;letter-spacing:.18em;color:var(--dim)}
.deptcard h3{font-size:clamp(24px,2.3vw,34px)}
.deptcard>p{margin-top:6px;color:#57433e}
.folderlist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin-top:var(--s3);border-top:1px solid var(--rule)}
@media(max-width:500px){.folderlist{grid-template-columns:1fr}}
.folderlist span{display:flex;gap:9px;align-items:baseline;padding:8px 6px;border-bottom:1px solid var(--rule);font-size:13px;line-height:1.25}
.folderlist span:nth-child(odd){border-right:1px solid var(--rule)}
@media(max-width:500px){.folderlist span:nth-child(odd){border-right:0}}
.folderlist b{font-family:var(--record);font-weight:400;letter-spacing:.08em;color:var(--dim);min-width:21px}
.folderlist .one{font-weight:700;color:var(--c)}
.folderlist .one b{color:var(--c)}
.deptcard .deep{margin-top:auto;padding-top:var(--s3);font-size:14px;font-weight:700;color:var(--c)}
'''
anchor = '/* ===== 4 DEPARTMENTS — bands ===== */'
if anchor not in s:
    raise SystemExit('Department CSS anchor missing')
s = s.replace(anchor, card_css + '\n' + anchor, 1)

s, n = re.subn(r'<!-- TRUST -->\n<section class="trustsec" id="trust">.*?</section>\n\n', '', s, flags=re.S)
if n != 1:
    raise SystemExit(f'Trust section removal count={n}')
s = re.sub(r'\s*<div class="c"><div class="n">12%</div><h3>Membership revenue to the trust</h3>.*?</div>', '', s, flags=re.S)
s = re.sub(r'\s*<li><b>02</b><span><b[^>]*>The books are published every quarter\.</b>.*?</li>', '', s, flags=re.S)
s = s.replace('$12 a week starts with four active folders', '$12 starts with four active folders')
s = s.replace('$12 a week. One membership.', '$12. One membership.')
s = s.replace("['#start','$12 a week']", "['#start','$12']")
s = s.replace(",['#trust','The trust']", '')
s = re.sub(r'/\* ---------- trust calculator ---------- \*/.*?(?=/\* ---------- portrait slideshow ---------- \*/)', '', s, flags=re.S)
s = s.replace('<div class="btns rv d3"><a href="join.html" class="btn">See membership</a></div>', f'<div class="btns rv d3"><a href="{APPLY_URL}" class="btn">Begin application</a><a href="join.html" class="btn o">See membership</a></div>', 1)
p.write_text(s)

p = root / 'founder.html'
s = p.read_text()
s = s.replace('<a href="index.html" class="back rv">&larr; Universe City</a><span class="k rv">why this exists</span>', '<a href="index.html" class="founder-back rv">&larr; Back to main page</a><span class="k rv">why this exists</span>')
founder_back_css = '''
.founder-back{display:inline-block;margin-bottom:var(--s3);padding:11px 16px;background:var(--paper);color:var(--ink);border:2px solid var(--ink);box-shadow:4px 4px 0 var(--pa);text-decoration:none;font-size:13.5px;font-weight:700}
.founder-back:hover{transform:translate(-1px,-1px);box-shadow:6px 6px 0 var(--pa)}
'''
s = s.replace('/* text colour must not inherit from a dark section above */', founder_back_css + '\n/* text colour must not inherit from a dark section above */', 1)
s = s.replace('<div><b>12%</b><span>Of every dollar to the trust</span></div>', '<div><b>2018</b><span>Year Universe City started</span></div>')
s = s.replace('$12 a week starts with four active folders', '$12 starts with four active folders')
s = s.replace('<div class="btns rv d2"><a href="join.html" class="btn">See membership</a></div>', f'<div class="btns rv d2"><a href="{APPLY_URL}" class="btn">Begin application</a><a href="{LOGIN_URL}" class="btn o">Member sign in</a></div>')
p.write_text(s)

p = root / 'join.html'
s = p.read_text()
s = s.replace('Universe City membership is $12 a week and starts with Time, Inventory, Salary, and Standards.', 'Universe City membership is $12 and starts with Time, Inventory, Salary, and Standards.')
s = s.replace('<h1 class="rv d1">$12 a week.</h1>', '<h1 class="rv d1">$12.</h1>')
s = s.replace('<p class="rv d3 mt3" style="max-width:50ch;color:rgba(244,239,233,.7)">The service is still being built. Accounts and payment are not open on this site yet.</p>', '<p class="rv d3 mt3" style="max-width:50ch;color:rgba(244,239,233,.7)">Read how membership works here, then continue to the application or sign in to an existing member account.</p>')
s = s.replace('<div class="jgo rv d2">\n  <a href="index.html#system" class="solid">See starting folders &rarr;</a>\n  <a href="index.html#departments" class="ghost">Browse departments</a>\n </div>', f'<div class="jgo rv d2">\n  <a href="{APPLY_URL}" class="solid">Begin application &rarr;</a>\n  <a href="{LOGIN_URL}" class="ghost">Member sign in</a>\n </div>')
s = re.sub(r'\s*<p class="jnote muted rv d3">Twelve percent of membership revenue.*?</p>', '<p class="jnote muted rv d3">The application creates your account and file. Existing members can sign in directly.</p>', s, flags=re.S)
p.write_text(s)

for p in root.glob('*.html'):
    s = p.read_text()
    s = re.sub(r'\s*<a href="index\.html#trust">The trust</a>', '', s)
    s = re.sub(r'\s*<a href="#trust">The trust</a>', '', s)
    s = s.replace('<div><div class="lbl">OPEN BOOKS</div>\n  <a href="index.html#business">How it operates</a><a href="join.html">Membership</a></div>', f'<div><div class="lbl">ACCESS</div>\n  <a href="index.html#business">How it operates</a><a href="join.html">Membership</a><a href="{APPLY_URL}">Apply</a><a href="{LOGIN_URL}">Member sign in</a></div>')
    p.write_text(s)

alltext = '\n'.join(p.read_text() for p in root.glob('*.html'))
for term in ['$12 a week', '$12/week', 'weekly payment contributes $1.44', 'The trust</a>', 'Membership revenue to the trust', 'community trust', 'WHAT THE TRUST HOLDS AT SCALE']:
    if term.lower() in alltext.lower():
        raise SystemExit(f'Forbidden public text remains: {term}')
home = (root/'index.html').read_text()
assert home.index('<!-- ABOUT TEASER -->') < home.index('<!-- 4 DEPARTMENTS -->')
assert 'id="zwheel"' not in home
assert 'class="deptcard"' in home
assert 'Open all 12 folders' in home
assert 'id="trust"' not in home
assert 'Back to main page' in (root/'founder.html').read_text()
join = (root/'join.html').read_text()
assert 'Begin application' in join and 'Member sign in' in join
print('Requested public-site structure pass verified.')
