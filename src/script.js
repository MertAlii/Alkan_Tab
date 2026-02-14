const searchConfig = {
    engines: {
        google: {
            url: 'https://www.google.com/search?q=',
            name: 'Google',
            icon: `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/150px-Google_%22G%22_logo.svg.png" alt="Google" width="24" height="24">`
        },
        duckduckgo: {
            url: 'https://duckduckgo.com/?q=',
            name: 'DuckDuckGo',
            icon: `<img src="https://upload.wikimedia.org/wikipedia/en/9/90/The_DuckDuckGo_Duck.png" alt="DuckDuckGo" width="24" height="24">`
        },
        bing: {
            url: 'https://www.bing.com/search?q=',
            name: 'Bing',
            icon: `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Bing_Fluent_Logo.svg/150px-Bing_Fluent_Logo.svg.png" alt="Bing" width="24" height="24">`
        }
    },
    default: 'google'
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const settingsBtn = document.getElementById('settingsBtn');
    // Modal Elements
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');

    // Ensure modal is hidden on load
    if (settingsModal) settingsModal.classList.remove('visible');
    if (modalOverlay) modalOverlay.classList.remove('visible');


    // New Dropdown Elements
    const currentEngineBtn = document.getElementById('currentEngineBtn');
    const engineDropdown = document.getElementById('engineDropdown');
    const engineList = document.querySelector('.engine-list');
    const engineItems = document.querySelectorAll('.engine-item');

    const suggestionsContainer = document.getElementById('suggestionsContainer');

    // Shortcuts Elements
    const shortcutsNav = document.getElementById('shortcutsNav'); // Nav container
    const shortcutsList = document.getElementById('shortcutsList');
    const shortcutsManageList = document.getElementById('shortcutsManageList');
    const newShortcutName = document.getElementById('newShortcutName');
    const newShortcutUrl = document.getElementById('newShortcutUrl');
    const addShortcutBtn = document.getElementById('addShortcutBtn');
    const displayOptionCards = document.querySelectorAll('.display-option-card');

    // Default Shortcuts
    const defaultShortcuts = [
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'YouTube', url: 'https://www.youtube.com' },
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'Twitter', url: 'https://twitter.com' }
    ];

    // Load Shortcuts & Preferences
    let myShortcuts = JSON.parse(localStorage.getItem('myShortcuts'));
    if (!myShortcuts) {
        myShortcuts = defaultShortcuts;
        localStorage.setItem('myShortcuts', JSON.stringify(myShortcuts));
    }

    let displayMode = localStorage.getItem('shortcutDisplayMode') || 'both';
    updateDisplayOptionsUI(displayMode);

    // Load saved engine
    let currentEngineKey = localStorage.getItem('searchEngine') || searchConfig.default;
    updateEngineUI(currentEngineKey);
    renderShortcuts();
    renderManageShortcuts();

    // Shortcuts Logic
    function renderShortcuts() {
        shortcutsList.innerHTML = '';

        // Hide/Show logic
        if (myShortcuts.length === 0) {
            shortcutsNav.classList.add('hidden');
            return;
        } else {
            shortcutsNav.classList.remove('hidden');
        }

        myShortcuts.forEach(shortcut => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = shortcut.url;
            a.className = 'nav-link';

            // Get domain for favicon
            let domain = '';
            try {
                domain = new URL(shortcut.url).hostname;
            } catch (e) {
                // If invalid URL, use the string as is, hoping it's a domain
                domain = shortcut.url.replace(/^https?:\/\//, '').split('/')[0];
            }

            // Try Google first (As requested)
            const googleFavicon = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(shortcut.url)}`;
            const ddgFavicon = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

            const imgTag = `<img src="${googleFavicon}" alt="${shortcut.name}" onerror="this.src='${ddgFavicon}'; this.onerror=null;">`;

            // Render based on mode
            if (displayMode === 'both') {
                a.classList.remove('icon-only');
                a.innerHTML = `${imgTag} ${shortcut.name}`;
            } else if (displayMode === 'icon') {
                a.classList.add('icon-only');
                a.innerHTML = `${imgTag}`;
                a.title = shortcut.name; // Add tooltip
            } else { // text only
                a.classList.remove('icon-only');
                a.textContent = shortcut.name;
            }

            li.appendChild(a);
            shortcutsList.appendChild(li);
        });
    }





    function renderManageShortcuts() {
        shortcutsManageList.innerHTML = '';
        myShortcuts.forEach((shortcut, index) => {
            const div = document.createElement('div');
            div.className = 'shortcut-manage-item';
            div.innerHTML = `
                <span>${shortcut.name}</span>
                <button class="delete-shortcut-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            shortcutsManageList.appendChild(div);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeShortcut(index);
            });
        });
    }

    function addShortcut() {
        const name = newShortcutName.value.trim();
        let url = newShortcutUrl.value.trim();

        if (name && url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            myShortcuts.push({ name, url });
            saveShortcuts();
            newShortcutName.value = '';
            newShortcutUrl.value = '';
        }
    }

    function removeShortcut(index) {
        myShortcuts.splice(index, 1);
        saveShortcuts();
    }

    function saveShortcuts() {
        localStorage.setItem('myShortcuts', JSON.stringify(myShortcuts));
        renderShortcuts();
        renderManageShortcuts();
    }

    addShortcutBtn.addEventListener('click', addShortcut);

    // Search History Management
    function getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }

    function addToHistory(query) {
        let history = getSearchHistory();
        // Remove if exists (to move to top)
        history = history.filter(item => item !== query);
        // Add to beginning
        history.unshift(query);
        // Limit to 20
        history = history.slice(0, 20);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    function removeFromHistory(query) {
        let history = getSearchHistory();
        history = history.filter(item => item !== query);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        // Refresh suggestions if open
        if (searchInput.value) {
            showSuggestions(searchInput.value);
        }
    }

    // Suggestions Logic
    async function showSuggestions(query) {
        if (!query) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        const history = getSearchHistory();
        const historyMatches = history.filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

        let allSuggestions = [];

        // 1. History items
        historyMatches.forEach(item => {
            allSuggestions.push({ text: item, type: 'history' });
        });

        // 2. Fetch from Google Suggest API (More reliable than DDG)
        try {
            const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                // Google returns: ["query", ["sugg1", "sugg2", ...]]
                if (data && Array.isArray(data[1])) {
                    const apiSuggestions = data[1].slice(0, 5);
                    apiSuggestions.forEach(item => {
                        // Check if item is not null/undefined
                        if (item && !allSuggestions.some(s => s.text === item)) {
                            allSuggestions.push({ text: item, type: 'api' });
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Suggestion fetch failed:', e);
        }

        renderSuggestions(allSuggestions);
    }

    function renderSuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.classList.remove('active');
            // Show shortcuts again
            if (shortcutsNav) shortcutsNav.classList.remove('hidden');
            return;
        }

        // Hide shortcuts when suggestions are shown
        if (shortcutsNav) shortcutsNav.classList.add('hidden');

        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';

            // Icon logic
            let iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'; // Default search

            if (suggestion.type === 'history') {
                iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
            } else if (suggestion.type === 'plugin') {
                iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
            } else if (suggestion.type === 'translation') {
                iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><globe cx="12" cy="12" r="2"></globe><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
            }

            const iconSpan = document.createElement('span');
            iconSpan.className = 'suggestion-icon';
            iconSpan.innerHTML = iconHtml;

            const textSpan = document.createElement('span');
            textSpan.className = 'suggestion-text';
            textSpan.textContent = suggestion.text;

            div.appendChild(iconSpan);
            div.appendChild(textSpan);

            if (suggestion.type === 'history') {
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-history-btn';
                delBtn.innerHTML = '&times;'; // Simple x
                delBtn.title = 'Remove from history';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    removeFromHistory(suggestion.text);
                };
                div.appendChild(delBtn);
            }

            div.addEventListener('click', () => {
                if (suggestion.type === 'plugin') {
                    executePlugin(suggestion.plugin, '');
                } else if (suggestion.type === 'translation') {
                    navigator.clipboard.writeText(suggestion.text).then(() => {
                        searchInput.value = suggestion.text;
                    });
                } else {
                    performSearch(suggestion.text);
                }
            });

            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.style.display = 'block';
        suggestionsContainer.classList.add('active');

        // Apply selected class if any
        if (selectedSuggestionIndex > -1 && suggestions.length > selectedSuggestionIndex) {
            suggestionsContainer.children[selectedSuggestionIndex].classList.add('selected');
        }
    }

    // --- PLUGIN SYSTEM ---
    const extensionsList = document.getElementById('extensionsList');
    // Custom Plugin Elements
    const newPluginName = document.getElementById('newPluginName');
    const newPluginTrigger = document.getElementById('newPluginTrigger');
    const newPluginUrl = document.getElementById('newPluginUrl');
    const addPluginBtn = document.getElementById('addPluginBtn');

    // Built-in Plugins
    const builtInPlugins = [
        {
            id: 'youtube',
            name: 'YouTube Search',
            description: 'YouTube\'da arama yapmak için "@y" veya "@youtube" kullanın.',
            triggers: ['@youtube', '@y'],
            enabled: true,
            icon: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube" width="24" height="24">',
            execute: (query) => {
                const searchLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                window.location.href = searchLink;
            }
        },
        {
            id: 'translator',
            name: 'Google Translate',
            description: 'Çeviri için "@t" veya "@translate" kullanın (örn: "@t en:tr hello").',
            triggers: ['@translate', '@t'],
            enabled: true,
            icon: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1024px-Google_Translate_logo.svg.png" alt="Translate" width="24" height="24">',
            execute: (query) => {
                // query format: "en:tr hello" or "hello"
                let sl = 'auto';
                let tl = 'tr';
                let text = query;

                // Check for lang pattern like "en:tr text"
                const match = query.match(/^([a-z]{2}):([a-z]{2})\s+(.*)/);
                if (match) {
                    sl = match[1];
                    tl = match[2];
                    text = match[3];
                }

                const transLink = `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(text)}`;
                window.location.href = transLink;
            }
        }
    ];

    // Load Custom Plugins
    let customPlugins = [];
    try {
        customPlugins = JSON.parse(localStorage.getItem('customPlugins') || '[]');
        if (!Array.isArray(customPlugins)) customPlugins = [];
    } catch (e) {
        console.error("Failed to load custom plugins", e);
        customPlugins = [];
    }

    let savedPlugins = {};
    try {
        savedPlugins = JSON.parse(localStorage.getItem('plugins') || '{}');
    } catch (e) {
        savedPlugins = {};
    }

    // Helper to get all plugins
    function getAllPlugins() {
        return [...builtInPlugins, ...customPlugins];
    }

    // Apply saved enabled state
    builtInPlugins.forEach(p => {
        if (savedPlugins.hasOwnProperty(p.id)) {
            p.enabled = savedPlugins[p.id];
        }
    });
    // Custom plugins manage their own enabled state in their object, but let's sync if needed. 
    // For simplicity, custom plugins are always enabled unless we add toggle for them (which we will).

    function savePlugins() {
        const state = {};
        builtInPlugins.forEach(p => {
            state[p.id] = p.enabled;
        });
        localStorage.setItem('plugins', JSON.stringify(state));
        localStorage.setItem('customPlugins', JSON.stringify(customPlugins));
    }

    function addCustomPlugin() {
        const name = newPluginName.value.trim();
        const trigger = newPluginTrigger.value.trim();
        const url = newPluginUrl.value.trim();

        if (name && trigger && url) {
            const newPlugin = {
                id: 'custom-' + Date.now(),
                name: name,
                description: `Özel eklenti: ${trigger}`,
                triggers: [trigger],
                enabled: true,
                isCustom: true, // Marker
                urlTemplate: url, // Store URL
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>', // Generic icon
                execute: function (query) {
                    // Simple replacement of query
                    // Warn: This function is recreated on load because JSON doesn't store functions.
                    // We need a way to handle execution.
                }
            };
            customPlugins.push(newPlugin);
            savePlugins();
            renderExtensions();
            newPluginName.value = '';
            newPluginTrigger.value = '';
            newPluginUrl.value = '';
        }
    }

    addPluginBtn.addEventListener('click', addCustomPlugin);


    function renderExtensions() {
        if (!extensionsList) return;
        extensionsList.innerHTML = '';

        getAllPlugins().forEach(plugin => {
            const div = document.createElement('div');
            div.className = 'extension-card';

            let deleteBtnHtml = '';
            if (plugin.isCustom) {
                deleteBtnHtml = `<button class="delete-shortcut-btn" style="margin-left:10px;" data-id="${plugin.id}">Sil</button>`;
            }

            div.innerHTML = `
                <div class="extension-info">
                    <span class="extension-name">${plugin.name}</span>
                    <span class="extension-desc">${plugin.description}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <label class="switch">
                        <input type="checkbox" ${plugin.enabled ? 'checked' : ''} data-id="${plugin.id}">
                        <span class="slider round"></span>
                    </label>
                    ${deleteBtnHtml}
                </div>
            `;
            extensionsList.appendChild(div);
        });

        // Add Listeners
        extensionsList.querySelectorAll('input[type="checkbox"]').forEach(box => {
            box.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const all = getAllPlugins();
                const plugin = all.find(p => p.id === id);
                if (plugin) {
                    plugin.enabled = e.target.checked;
                    // IF custom, we need to update the object in customPlugins array directly
                    if (plugin.isCustom) {
                        const idx = customPlugins.findIndex(p => p.id === id);
                        if (idx !== -1) customPlugins[idx].enabled = e.target.checked;
                    }
                    savePlugins();
                }
            });
        });

        extensionsList.querySelectorAll('.delete-shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                customPlugins = customPlugins.filter(p => p.id !== id);
                savePlugins();
                renderExtensions();
            });
        });
    }

    renderExtensions();

    // Execute logic wrapper for all plugins
    function executePlugin(plugin, query) {
        let targetUrl = plugin.urlTemplate || ''; // Safety fallback

        if (plugin.isCustom) {
            if (!targetUrl) {
                console.error("Plugin URL template is missing!");
                return;
            }

            if (!query) {
                // If query is empty, and template has %s, remove %s to get base URL
                if (targetUrl.includes('%s')) {
                    targetUrl = targetUrl.replace('%s', '');
                }
            } else {
                // Otherwise, perform replacement as usual
                if (targetUrl.includes('%s')) {
                    targetUrl = targetUrl.replace('%s', encodeURIComponent(query));
                } else {
                    targetUrl = targetUrl + encodeURIComponent(query);
                }
            }

            if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
            window.location.href = targetUrl;
        } else {
            if (typeof plugin.execute === 'function') {
                plugin.execute(query);
            }
        }
    }

    function performSearch(query) {
        if (query) {
            addToHistory(query);

            // Check for Plugins
            const parts = query.split(' ');
            const trigger = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');

            const all = getAllPlugins();
            const activePlugin = all.find(p => p.enabled && p.triggers.includes(trigger));

            if (activePlugin) {
                // Execute Plugin
                executePlugin(activePlugin, args);
                return;
            }

            // Normal Search
            const searchUrl = searchConfig.engines[currentEngineKey].url + encodeURIComponent(query);
            window.location.href = searchUrl;
        }
    }

    // Keyboard Navigation State
    let selectedSuggestionIndex = -1;
    let currentSuggestions = []; // To track what's on screen

    // Input Events
    searchInput.addEventListener('input', async (e) => {
        const val = e.target.value.trim();
        const parts = val.split(' ');
        const trigger = parts[0].toLowerCase();

        selectedSuggestionIndex = -1; // Reset selection on typing

        // Plugin Autocomplete
        if (val.startsWith('@') && parts.length === 1) {
            const all = getAllPlugins();
            const matches = all.filter(p => p.enabled && p.triggers.some(t => t.startsWith(trigger)));

            const suggestions = matches.map(p => ({
                text: `${p.triggers[0]} `, // Add space for convenience
                type: 'plugin',
                desc: p.name,
                icon: p.icon
            }));
            currentSuggestions = suggestions; // Store for keyboard nav
            renderSuggestions(suggestions);
            return;
        }

        // Icon Switching Logic
        const all = getAllPlugins();
        const activePlugin = all.find(p => p.enabled && p.triggers.includes(trigger));

        if (activePlugin) {
            currentEngineBtn.innerHTML = activePlugin.icon;
        } else {
            // Restore default engine icon
            currentEngineBtn.innerHTML = searchConfig.engines[currentEngineKey].icon;
        }

        // Live Translation Logic
        if (activePlugin && activePlugin.id === 'translator' && parts.length > 1) {
            const textToTranslate = parts.slice(1).join(' ');
            if (textToTranslate.length > 1) {
                // Parse lang if present
                let sl = 'auto';
                let tl = 'tr';
                let text = textToTranslate;

                const match = textToTranslate.match(/^([a-z]{2}):([a-z]{2})\s+(.*)/);
                if (match) {
                    sl = match[1];
                    tl = match[2];
                    text = match[3];
                }

                try {
                    // Using Google Translate API (unofficial free endpoint)
                    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
                    if (res.ok) {
                        const data = await res.json();
                        // data[0][0][0] usually contains the translation
                        if (data && data[0] && data[0][0] && data[0][0][0]) {
                            const translatedText = data[0][0][0];
                            // Show translation as a suggestion
                            const transSuggestion = [{
                                text: translatedText,
                                type: 'translation',
                                source: text
                            }];
                            currentSuggestions = transSuggestion; // Store for keyboard nav
                            renderSuggestions(transSuggestion);
                            return; // Skip normal suggestions
                        }
                    }
                } catch (err) {
                    console.error('Translation failed', err);
                }
            }
        }

        showSuggestions(val);
    });

    // Keyboard Navigation
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = document.querySelectorAll('.suggestion-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent cursor moving to end
            if (suggestions.length > 0) {
                selectedSuggestionIndex++;
                if (selectedSuggestionIndex >= suggestions.length) selectedSuggestionIndex = 0;
                updateSelection(suggestions);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (suggestions.length > 0) {
                selectedSuggestionIndex--;
                if (selectedSuggestionIndex < 0) selectedSuggestionIndex = suggestions.length - 1;
                updateSelection(suggestions);
            }
        } else if (e.key === 'Enter') {
            if (selectedSuggestionIndex > -1 && suggestions.length > 0) {
                e.preventDefault();
                suggestions[selectedSuggestionIndex].click();
            } else {
                // Trigger search if no suggestion selected
                performSearch(searchInput.value.trim());
            }
        }
    });

    function updateSelection(suggestions) {
        suggestions.forEach((el, index) => {
            if (index === selectedSuggestionIndex) {
                el.classList.add('selected');
                // Scroll to view if needed
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.classList.remove('selected');
            }
        });
    }

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target) && !engineDropdown.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.classList.remove('active');
            if (shortcutsNav) shortcutsNav.classList.remove('hidden'); // Show shortcuts
        }

        // Close dropdown
        if (!engineDropdown.contains(e.target)) {
            engineList.classList.remove('visible');
        }

        // Close modal
        if (e.target === modalOverlay) {
            toggleModal();
        }
    });

    // Focus focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            showSuggestions(searchInput.value.trim());
        }
    });

    // Modal Toggles (Renamed from Sidebar Toggles)
    function toggleModal() {
        settingsModal.classList.toggle('visible');
        modalOverlay.classList.toggle('visible');
    }

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal();
    });

    closeModalBtn.addEventListener('click', toggleModal);
    modalOverlay.addEventListener('click', toggleModal);

    // Dropdown Toggle (Search Bar)
    currentEngineBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        engineList.classList.toggle('visible');
    });

    // Close logic
    document.addEventListener('click', (e) => {
        if (!engineDropdown.contains(e.target)) {
            engineList.classList.remove('visible');
        }
    });

    // Handle Engine Selection (Sidebar)
    document.querySelectorAll('.engine-option-card').forEach(card => {
        card.addEventListener('click', () => {
            const key = card.getAttribute('data-engine');
            setEngine(key);
        });
    });

    // Handle Engine Selection (Dropdown)
    engineItems.forEach(item => {
        item.addEventListener('click', () => {
            const key = item.getAttribute('data-engine');
            setEngine(key);
            engineList.classList.remove('visible');
        });
    });

    function setEngine(key) {
        if (searchConfig.engines[key]) {
            currentEngineKey = key;
            localStorage.setItem('searchEngine', key);
            updateEngineUI(key);
        }
    }

    function updateEngineUI(key) {
        // Update main logo
        currentEngineBtn.innerHTML = searchConfig.engines[key].icon;

        // Update sidebar active state
        document.querySelectorAll('.engine-option-card').forEach(card => {
            if (card.getAttribute('data-engine') === key) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update placeholder
        const engineName = searchConfig.engines[key].name;
        searchInput.placeholder = `${engineName} ile ara...`;
    }

    searchInput.focus();

    // Clear History
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Arama geçmişini silmek istediğinize emin misiniz?')) {
                localStorage.removeItem('searchHistory');
                alert('Geçmiş temizlendi!');
            }
        });
    }

    // Auto-focus search on typing
    document.addEventListener('keydown', (e) => {
        // Ignore if focus is already on an input or textarea
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        // Ignore special keys (Ctrl, Alt, Meta, Shift, F-keys, etc.)
        if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;

        // Focus and proceed
        searchInput.focus();
    });

    // Handle Display Selection
    displayOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.getAttribute('data-mode');
            setDisplayMode(mode);
        });
    });

    function setDisplayMode(mode) {
        displayMode = mode;
        localStorage.setItem('shortcutDisplayMode', mode);
        updateDisplayOptionsUI(mode);
        renderShortcuts();
    }

    function updateDisplayOptionsUI(mode) {
        displayOptionCards.forEach(card => {
            if (card.getAttribute('data-mode') === mode) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Theme Logic
    const themeOptionCards = document.querySelectorAll('.theme-option-card');
    let currentTheme = localStorage.getItem('theme') || 'system';

    // Auto-apply system theme if no preference
    applyTheme(currentTheme);
    updateThemeUI(currentTheme);

    themeOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        updateThemeUI(theme);
    }

    function applyTheme(theme) {
        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    function updateThemeUI(theme) {
        themeOptionCards.forEach(card => {
            if (card.getAttribute('data-theme') === theme) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });

});
