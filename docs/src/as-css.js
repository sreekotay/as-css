(() => { // as-CSS Inline CSS scoping - inspired by https://github.com/gnat/css-scope-inline
  let as = window.as ||= {}; as.css||={}; let aw = as.css._css||={}; if (aw.uid) return;
  if (!document.querySelector('style[data-as-css-defaults]')) { // Add default styles for as-style elements
    const def = document.createElement('style'); def.setAttribute('data-as-css-defaults', '');
    def.textContent = 'as-style { display: none !important; }'; document.head.prepend(def);
  } 
  aw.uid = 1; aw.queued = 0; aw.namedStyles = {}; aw.strongStyles = new Set(); aw.breakpoints ||= { 
    'xs-gt':'(min-width:480px)', 'sm-gt':'(min-width:640px)', 'md-gt':'(min-width:768px)', 'lg-gt':'(min-width:1024px)', 'xl-gt':'(min-width:1280px)', 'xx-gt':'(min-width:1536px)', 
    'xs-lt':'(max-width:479px)', 'sm-lt':'(max-width:639px)', 'md-lt':'(max-width:767px)', 'lg-lt':'(max-width:1023px)', 'xl-lt':'(max-width:1279px)', 'xx-lt':'(max-width:1535px)' 
  }
  const ANIM_KW = new Set([ 'none','paused','running','forwards','backwards','both','infinite',
                            'linear','ease','ease-in','ease-out','ease-in-out', 'step-start','step-end' ]);
  const BP_RE = /@(?:media|container)\s((?:xs|sm|md|lg|xl|xx)-(?:lt|gt))(?=[^\w-])/g, SCOPE_RE = /(^|[^\\])([&*])(?![=\]])/g, HAS_SCOPE_RE = /[&*]/;
  const QUOTE_SAFE_RE = /(^|[^\\])([&*])(?!=)(?![^"]*"[^"]*(?:"[^"]*"[^"]*)*$|[^']*'[^']*(?:'[^']*'[^']*)*$)/g, QUOTE_TEST_RE = /["']/;
  as.css.resetAnimations = (el, selector = '*') => { const els = [el, ...el.querySelectorAll(selector)];
     els.forEach(el => { let p=el.style.animation; el.style.animation = 'none'; el.offsetHeight; el.style.animation = p; })};
  function splitSelectors(sel) { 
    if (sel.indexOf('(')===-1 && sel.indexOf('\\')===-1) return sel.split(',').map(s => s.trim());
    let out = [], start = 0, depth = 0, ch;
    for (let i=0; i<sel.length; i++) { ch = sel[i]; if (ch === '\\') i++;  // skip escaped character
                                       else if (ch === '(') depth++; else if (ch === ')') depth--;
                                       else if (ch === ',' && depth === 0) { out.push(sel.slice(start, i).trim()); start = i + 1; } } 
    out.push(sel.slice(start).trim()); return out;
  }
  function rewriteRules(rules, scope, scopeId) {  
    for (const r of rules)
      if (r.type === CSSRule.STYLE_RULE) {
        const style = r.style;
        r.selectorText = splitSelectors(r.selectorText).map(s => { 
          const st = s.trim(); if (HAS_SCOPE_RE.test(st)) {
            if (!QUOTE_TEST_RE.test(st)) return st.replace(SCOPE_RE, '$1' + scope); // Conservative: avoid transforming selectors with quotes
            else return st.replace(QUOTE_SAFE_RE, '$1' + scope); // Safe fallback: replace & and * with scope, but avoid quoted content
          }
          return (`${scope} ${st}`).replace(/\s+::/, '::'); // Default to descendant scoping for consistency - use & for explicit container references
        }).join(', ');
        if (style.animationName) style.animationName = style.animationName.split(',').map(name => `${scopeId}-${name.trim()}`).join(',');
        if (style.animation) style.animation = style.animation.split(',').map(anim => {
          return anim.trim().replace(/^(\S+)/, (match, name) => (ANIM_KW.has(name) || name.includes('(')) ? name : `${scopeId}-${name}`);
        }).join(', ');
      } else if (r.type === CSSRule.KEYFRAMES_RULE && !r.name.startsWith('var(')) r.name = `${scopeId}-${r.name}`;
      else if (r.type === 25 || 'cssRules' in r) rewriteRules(r.cssRules, scope, scopeId); // 25 = CSSRule.LAYER_BLOCK_RULE
  }
  function addScope(styleEl, parentEl, scope, newCSS) {
    if (styleEl.tagName !== 'STYLE') styleEl = (s => (s.textContent = styleEl.textContent, [...styleEl.attributes].forEach(a => s.setAttribute(a.name, a.value)), styleEl.replaceWith(s), s))(document.createElement('style'));
    const css = newCSS || styleEl.textContent, scopeId = scope; let fullScope = '.' + scope;
    const processedCSS = css.replace(BP_RE, (match, k) => {const t = match.startsWith('@media') ? '@media' : '@container'; return t + ' ' + (aw.breakpoints[k] || k); });
    styleEl.textContent = processedCSS;
    if (parentEl !== document.head && !parentEl.classList.contains(scopeId)) parentEl.classList.add(scopeId);
    if (styleEl.hasAttribute('strong')) { styleEl.parentNode.classList.add('as-strong'); fullScope = fullScope + '.as-strong'; }
    styleEl.setAttribute('as-css', scopeId);
    try {
      if (!styleEl.sheet) { styleEl.offsetHeight; styleEl.setAttribute('as-css', ''); debugger; schedule(); return; } // Re-queue if sheet not ready
      const { cssRules } = styleEl.sheet;
      rewriteRules(cssRules, fullScope, scopeId);
      if (!styleEl.hasAttribute('dynamic')) styleEl.textContent = Array.from(cssRules).map(r => r.cssText).join('\n');
    } catch(e) { console.warn('Scoped CSS: rule blocked', e.message, e); }
  }
  function replaceCSS (styleEl, newCSS) {
    if (styleEl.tagName !== 'AS-STYLE' && styleEl.tagName !== 'STYLE') styleEl = styleEl?.parentNode;
    if (!styleEl?.parentNode || (styleEl?.tagName !== 'AS-STYLE' && styleEl?.tagName !== 'STYLE')) {console.error('replaceCSS: no styleEl or parentNode'); return;}          
    let scopeId = styleEl.getAttribute('as-css'); if (scopeId) addScope(styleEl, styleEl.parentNode, scopeId, newCSS); // Use stored scope ID
  }; as.css.replace = replaceCSS;
  function assignNamedStyles(split,node) { split.forEach(s => { s=s.trim();  let n = aw.namedStyles[s] && aw.namedStyles[s].split(' '); 
                                           if (n?.length) node.classList.add(...n); else console.error('Shared-scoped css does NOT exist', s); });}
  function processCSS (node) {  //======== main function to process css blocks ============
    let name = node.getAttribute('as-name'), scope = aw.namedStyles[name] || 'as--' + aw.uid++, parentEl = node.parentNode;
    if (name) { if (aw.namedStyles[name]) { assignNamedStyles(name.split(' '), parentEl); node.remove(); return; } //return if already defined
                if (node.hasAttribute('strong')) aw.strongStyles.add(name);
                aw.namedStyles[name] = scope + (aw.strongStyles.has(name) ? ' as-strong' : ''); document.head.appendChild(node); } 
    addScope(node, parentEl, scope);
    node.setAttribute('as-css', scope);
    if (node.hasAttribute('dynamic')) (aw.dynamicObserver ||= new MutationObserver(handleDynamic)).observe(document.documentElement, { characterData: true, childList: true, subtree: true });
  }
  function processDynamic(styleEl)  { if (styleEl._processing) return; styleEl._processing = true; replaceCSS(styleEl, styleEl.textContent); queueMicrotask(() => styleEl._processing = false); }
  function handleDynamic(mutations) { for (const {target, type} of mutations) 
                                        if ((type === 'characterData' && target.nodeType === 3 && (target.parentNode?.nodeName === 'STYLE' || target.parentNode?.nodeName === 'AS-STYLE') && target.parentNode?.hasAttribute('dynamic')) ||
                                            (type === 'childList' && (target.nodeName === 'STYLE' || target.nodeName === 'AS-STYLE') && target.hasAttribute('dynamic'))) processDynamic(target); }
  function flush() { 
    aw.queued = 0; aw.mainObserver.disconnect(); 
    document.querySelectorAll('style[as-css=""], as-style:not([as-css]), as-style[as-css=""], [as-class]').forEach(e=>{
      if (e.tagName==='STYLE' || e.tagName==='AS-STYLE') processCSS(e);
      else {assignNamedStyles(e.getAttribute('as-class').split(' '), e); e.removeAttribute('as-class');} 
    })
    aw.mainObserver.observe(document.documentElement, {childList:true, subtree:true});
  }
  function schedule() { aw.queued ||= Promise.resolve().then(flush); };
  (aw.mainObserver = new MutationObserver(schedule)).observe(document.documentElement, {childList:true, subtree:true});
  flush();
})(); 