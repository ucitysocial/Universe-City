/*
 * Universe City public pages: the account actions in the site header.
 *
 * Each public page is static. It is served with Log in and Apply for residency.
 * This script asks the server one question: is this visitor logged in?
 * The server answers { signedIn: true } or { signedIn: false }.
 *
 * When the answer is true, the header shows Resident Portal and Log out.
 * When the answer is false, or no answer arrives, the page stays as it was served.
 * The server sends no account detail and this script writes none into the page.
 *
 * Log out is a form that sends a POST to /auth/logout. The server ends the session there.
 */
(function () {
  'use strict';

  var SESSION = '/api/session';
  var LOG_IN = '/login';
  var PORTAL = '/portal';
  var LOG_OUT = '/auth/logout';

  var undo = null; // A function while the header shows the logged in state.
  var asked = 0;   // The number of the latest question sent to the server.

  /*
   * The pages style the header actions as links. A form button is a different element,
   * so these rules repeat the page rules for a.cta and for the star menu links.
   * The founder page styles its action by class. That class is kept on the button.
   */
  var RULES = [
    'form.account-out{display:contents}',
    'nav .links form.account-out button{font-family:inherit;font-size:13.5px;font-weight:600;' +
      'line-height:inherit;letter-spacing:inherit;color:var(--ink);background:var(--paper);' +
      'border:0;border-radius:0;margin:0;width:auto;height:auto;padding:9px 16px;opacity:1;' +
      'white-space:nowrap;cursor:pointer;-webkit-appearance:none;appearance:none}',
    '@media(max-width:560px){nav .links form.account-out button{font-size:13px;padding:8px 12px}}',
    '@media(max-width:520px){nav .links form.account-out button{font-size:12px;padding:8px 9px}}',
    '.head-actions form.account-out button{font-family:inherit;line-height:inherit;border:0;' +
      'border-radius:0;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none}',
    'form.account-out-menu{display:none;margin:0}',
    'form.account-out-menu button{display:block;width:100%;margin:0;border:0;border-radius:0;' +
      'background:none;text-align:left;cursor:pointer;opacity:.82;' +
      '-webkit-appearance:none;appearance:none}',
    'form.account-out-menu button:hover{opacity:1}',
    /* The star menu shows the account entries on the same narrow screens as .menu-login. */
    '@media(max-width:372px){form.account-out-menu{display:block}}'
  ].join('');

  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i]);
  }

  function addRules() {
    if (document.getElementById('account-rules')) return;
    var style = document.createElement('style');
    style.id = 'account-rules';
    style.appendChild(document.createTextNode(RULES));
    document.head.appendChild(style);
  }

  function logOutForm(formClass, buttonClass) {
    var form = document.createElement('form');
    form.method = 'post';
    form.action = LOG_OUT;
    form.className = formClass;
    var button = document.createElement('button');
    button.type = 'submit';
    if (buttonClass) button.className = buttonClass;
    button.appendChild(document.createTextNode('Log out'));
    form.appendChild(button);
    return form;
  }

  /* The menu links differ by page in size and spacing. The button takes them from its neighbor. */
  function matchText(button, link) {
    if (!window.getComputedStyle) return;
    var from = window.getComputedStyle(link);
    each(['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'color',
          'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'], function (name) {
      if (from[name]) button.style[name] = from[name];
    });
  }

  function show() {
    if (undo) return;
    var steps = [];

    /* Every Log in link: the header, the star menu, and the page body. */
    each(document.querySelectorAll('a[href="' + LOG_IN + '"]'), function (link) {
      var text = link.textContent;
      if (text.replace(/\s+/g, ' ').replace(/^ | $/g, '') !== 'Log in') return;
      link.textContent = 'Resident Portal';
      link.setAttribute('href', PORTAL);
      steps.push(function () {
        link.textContent = text;
        link.setAttribute('href', LOG_IN);
      });
    });

    /* The header action. Log out takes the place of Apply for residency. */
    var apply = document.querySelector('nav a.cta[href="/apply"], header a.apply-link[href="/apply"]');
    if (apply && apply.parentNode) {
      var out = logOutForm('account-out', apply.className);
      apply.parentNode.replaceChild(out, apply);
      steps.push(function () {
        if (out.parentNode) out.parentNode.replaceChild(apply, out);
      });
    }

    /* The star menu: Log out goes under Resident Portal. */
    var menuLink = document.querySelector('#menu a.menu-login');
    if (menuLink && menuLink.parentNode) {
      var entry = logOutForm('account-out-menu', '');
      matchText(entry.firstChild, menuLink);
      menuLink.parentNode.insertBefore(entry, menuLink.nextSibling);
      steps.push(function () {
        if (entry.parentNode) entry.parentNode.removeChild(entry);
      });
    }

    addRules();
    undo = function () {
      for (var i = steps.length - 1; i >= 0; i--) steps[i]();
    };
  }

  function hide() {
    if (!undo) return;
    undo();
    undo = null;
  }

  function ask() {
    var mine = ++asked;
    fetch(SESSION, { credentials: 'same-origin', cache: 'no-store' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (body) {
        if (mine !== asked) return;
        if (body && body.signedIn === true) show(); else hide();
      })
      .catch(function () {
        if (mine === asked) hide();
      });
  }

  /*
   * Moving from a public page into the Resident Portal, the Log in page, or the application loads a different part of
   * the site. Until that page appears, a screen with five stars in the department colors covers the old page, so the
   * move reads as one step. The Back button brings the old page back without the screen.
   */
  var MOVES = /^\/(portal|login|signup|apply|reset)(\/|$|\?)/;
  var STAR = 'M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z';
  var COLORS = ['#5C0F1B', '#A07818', '#4A2A78', '#2A4B3C', '#160c0c'];
  var MOVE_RULES = [
    '#uc-move{position:fixed;inset:0;z-index:2147483000;background:#f4efe9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;opacity:0;transition:opacity .16s ease-out}',
    '#uc-move.on{opacity:1}',
    '#uc-move .uc-stars{display:flex;gap:10px}',
    '#uc-move svg{width:34px;height:34px;overflow:visible}',
    '#uc-move path{fill:transparent;stroke:#160c0c;stroke-width:1.6;stroke-linejoin:round;transform-origin:12px 12px;transform-box:view-box;animation:ucstar 2s ease-in-out infinite}',
    '@keyframes ucstar{0%,8%{fill:transparent;transform:scale(1)}22%{fill:var(--c);transform:scale(1.18)}36%,62%{fill:var(--c);transform:scale(1)}80%,100%{fill:transparent;transform:scale(1)}}',
    '@media (prefers-reduced-motion:reduce){#uc-move{transition:none}#uc-move path{animation:none;fill:var(--c)}}'
  ].join('');

  function cover() {
    if (document.getElementById('uc-move')) return;
    var style = document.createElement('style');
    style.id = 'uc-move-rules';
    style.appendChild(document.createTextNode(MOVE_RULES));
    document.head.appendChild(style);
    var box = document.createElement('div');
    box.id = 'uc-move';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-label', 'The next page is loading');
    var row = document.createElement('div');
    row.className = 'uc-stars';
    for (var i = 0; i < COLORS.length; i++) {
      var c = COLORS[i];
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', STAR);
      path.setAttribute('style', '--c:' + c + ';animation-delay:' + (i * 0.2) + 's');
      svg.appendChild(path);
      row.appendChild(svg);
    }
    box.appendChild(row);
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.className = 'on'; });
  }

  function uncover() {
    var box = document.getElementById('uc-move');
    if (box && box.parentNode) box.parentNode.removeChild(box);
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    var url;
    try { url = new URL(link.getAttribute('href'), location.href); } catch (e) { return; }
    if (url.origin !== location.origin || !MOVES.test(url.pathname + url.search)) return;
    cover();
  });
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form && form.getAttribute && form.getAttribute('action') === LOG_OUT) cover();
  });
  window.addEventListener('pageshow', function (event) { if (event.persisted) uncover(); });

  if (!window.fetch || !document.querySelectorAll) return;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ask);
  else ask();

  /* A page restored by the Back button is the old page. Ask again so the header matches the session. */
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) ask();
  });
})();
