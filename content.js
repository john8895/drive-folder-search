(() => {
  const WIDGET_ID = 'dfs-widget';
  let currentFolderId = null;
  let currentFolderName = null;

  function getFolderIdFromUrl() {
    const match = window.location.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  function getFolderName() {
    // Drive 的資料夾標題在 breadcrumb 或 document title
    // document.title 格式: "資料夾名稱 - Google 雲端硬碟"
    const title = document.title.replace(/ - Google (雲端硬碟|Drive)$/, '');
    return title || null;
  }

  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    widget.innerHTML = `
      <div class="dfs-header">
        <span class="dfs-icon">&#128193;</span>
        <span class="dfs-label">搜尋此目錄</span>
        <button class="dfs-close" title="收起">&times;</button>
      </div>
      <div class="dfs-folder-name" id="dfs-folder-name"></div>
      <div class="dfs-search-row">
        <input type="text" id="dfs-input" placeholder="輸入關鍵字..." />
        <button id="dfs-search-btn">搜尋</button>
      </div>
    `;
    document.body.appendChild(widget);

    // 事件綁定
    document.getElementById('dfs-search-btn').addEventListener('click', doSearch);
    document.getElementById('dfs-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
    widget.querySelector('.dfs-close').addEventListener('click', () => {
      widget.classList.add('dfs-collapsed');
    });
    widget.addEventListener('click', (e) => {
      if (widget.classList.contains('dfs-collapsed')) {
        widget.classList.remove('dfs-collapsed');
        e.stopPropagation();
      }
    });
  }

  function doSearch() {
    const input = document.getElementById('dfs-input');
    const keyword = input.value.trim();
    if (!keyword) return;
    if (!currentFolderId) return;

    const url = `https://drive.google.com/drive/search?q=parent:${currentFolderId}+${encodeURIComponent(keyword)}`;
    window.location.href = url;
  }

  function updateWidget() {
    const folderId = getFolderIdFromUrl();
    const widget = document.getElementById(WIDGET_ID);

    if (!folderId) {
      // 不在資料夾頁面，隱藏
      if (widget) widget.style.display = 'none';
      currentFolderId = null;
      currentFolderName = null;
      return;
    }

    currentFolderId = folderId;
    currentFolderName = getFolderName();

    createWidget();

    const w = document.getElementById(WIDGET_ID);
    w.style.display = '';
    w.classList.remove('dfs-collapsed');

    const nameEl = document.getElementById('dfs-folder-name');
    if (nameEl) {
      nameEl.textContent = currentFolderName || '目前資料夾';
    }

    // 清空上次搜尋
    const input = document.getElementById('dfs-input');
    if (input) input.value = '';
  }

  // Drive 是 SPA，用 MutationObserver 偵測路由變化
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // 等 title 更新
      setTimeout(updateWidget, 500);
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  // 初始載入
  setTimeout(updateWidget, 1000);
})();
