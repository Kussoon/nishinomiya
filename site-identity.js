(() => {
  const style = document.createElement('style');
  style.textContent = `
    .city-site-identity{
      position:fixed;z-index:2000;top:calc(6px + env(safe-area-inset-top));right:9px;
      display:flex;align-items:center;min-height:25px;padding:4px 9px;
      border:1px solid #bdb1dc;border-radius:999px;background:#f8f5ffed;
      box-shadow:0 1px 5px #39286a24;color:#51407f;text-decoration:none;
      font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;
      font-size:10px;font-weight:900;letter-spacing:.02em;backdrop-filter:blur(4px)
    }
    .city-site-identity::before{content:"●";margin-right:4px;color:#7c68b6;font-size:8px}
    .city-global-links{
      display:flex;flex-wrap:wrap;justify-content:center;gap:5px 12px;
      max-width:680px;margin:10px auto 2px;padding:8px;
      color:#656d7d;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;
      font-size:10px;line-height:1.5;text-align:center
    }
    .city-global-links a{color:inherit;text-decoration:underline;text-underline-offset:2px}
    .city-global-links--standalone{padding-bottom:max(12px,env(safe-area-inset-bottom))}
  `;
  document.head.append(style);

  if (!/^\/nishinomiya\/(?:index\.html)?$/.test(location.pathname)) {
    const badge = document.createElement('a');
    badge.className = 'city-site-identity';
    badge.href = '/nishinomiya/';
    badge.setAttribute('aria-label', '西宮市トップへ');
    badge.textContent = '西宮市 町名記憶ゲーム';
    document.body.append(badge);
  }

  const createGlobalLinks = () => {
    const nav = document.createElement('nav');
    nav.className = 'city-global-links';
    nav.setAttribute('aria-label', 'サイト共通案内');
    nav.innerHTML = '<a href="/about/">このサイトについて</a><a href="/privacy/">プライバシー</a><a href="/sources/">データ出典</a><a href="/terms/">利用上の注意</a>';
    return nav;
  };

  const footers = [...document.querySelectorAll('footer')];
  if (footers.length) {
    footers.forEach(footer => footer.prepend(createGlobalLinks()));
  } else {
    const host = document.querySelector('main') || document.querySelector('.app') || document.body;
    const nav = createGlobalLinks();
    nav.classList.add('city-global-links--standalone');
    host.append(nav);
  }

  document.querySelectorAll('a,button').forEach(element => {
    const text = element.textContent.trim();
    if (!/^(← )?(ゲームトップへ|トップページ)$/.test(text)) return;
    element.textContent = text.startsWith('←') ? '← 西宮市トップへ' : '西宮市トップへ';
  });
})();
