document.addEventListener('DOMContentLoaded', () => {

    // Permission helper for row actions
    function getTraceId(opName) {
        const mapping = {
            "編輯用戶": 3, "编辑用户": 3,
            "查看詳情": 17, "查看详情": 17, "详情": 17,
            "額度修改": 9, "额度修改": 9, "修改余额": 9,
            "資金明細": 7, "资金明细": 7,
            "注單明細": 8, "注单明细": 8,
            "修改密碼": 35, "修改密码": 35,
            
            // 下級相關 (對應 trace 6: 返点设定)
            "下級會員": 6, "下级会员": 6,
            "下級報表": 6, "下级报表": 6,
            "下級注單": 6, "下级注单": 6,

            "支付層級": 4, "支付层级": 4,
            "交易設定": 10, "交易设定": 10,
            "代理变更": 11, "代理變更": 11, "变更代理": 11,
            "第三方游戏": 15, "第三方遊戲": 15,
            "积分修改": 16, "積分修改": 16, "积分调整": 16,
            "稽核记录": 18, "稽核紀錄": 18,
            "回访备注": 21,
            "备注": 21,
            "隐藏资金明细": 22, "隱藏資金明細": 22,
            "快速登录变更": 25, "快速登錄變更": 25,
            "谷歌验证码": 31, "谷歌驗證碼": 31,
            "链上地址": 33, "鏈上地址": 33,
            "额度修改(链上充值)": 34,
            "赔率设置": 38, "賠率設置": 38,
            "校验用户任务": 45,
            "编辑标签": 47, "編輯標籤": 47,
            "用户标签编辑记录": 48, "編輯標籤紀錄": 48,
            "编辑提款信息": 3, // Assuming edit withdraw maps to general edit or specific one
            "体育返水": null // No specific permission known, map to null to always show
        };
        return mapping[opName] || null;
    }

    function shouldShowOp(opName) {
        const traceId = getTraceId(opName);
        if (traceId === null) return true; // Show by default if not mapped
        return localStorage.getItem('perm-' + traceId) !== 'false';
    }

    function hasPerm(traceId) {
        let perm = localStorage.getItem('perm-' + traceId) !== 'false';
        // Override logic: if trace 17 (查看会员详情) or trace 3 (修改会员) is checked,
        // bypass specific permissions for certain detailed fields
        const detailFields = [4, 6, 7, 17, 21, 47];
        if (detailFields.includes(traceId)) {
            const has17 = localStorage.getItem('perm-17') !== 'false';
            const has3 = localStorage.getItem('perm-3') !== 'false';
            if (has17 || has3) {
                return true;
            }
        }
        return perm;
    }

    function renderCompactActionMenu() {
        const globalMenu = document.getElementById('globalCompactActionMenu');
        if (!globalMenu) return;
        const compactActionItems = [
            "编辑用户", "详情", "资金明细", "注单明细", "体育返水",
            "---",
            "编辑提款信息", "修改余额", "积分调整", "变更代理", "第三方游戏",
            "稽核记录", "备注", "回访备注", "隐藏资金明细", "校验用户任务",
            "链上地址", "额度修改(链上充值)", "编辑标签", "用户标签编辑记录"
        ];
        
        let filteredItems = compactActionItems.filter(item => item === '---' || shouldShowOp(item));
        filteredItems = filteredItems.filter((item, idx, arr) => {
            if (item === '---') {
                if (idx === 0 || idx === arr.length - 1) return false;
                if (arr[idx - 1] === '---') return false;
            }
            return true;
        });

        globalMenu.innerHTML = '<ul style="list-style:none; padding:0; margin:0;">' + 
            filteredItems.map(item => {
                if (item === '---') return `<li style="height:1px;background-color:#e5e7eb;margin:4px 0;"></li>`;
                return `<li class="compact-menu-item" style="display:block; padding: 8px 16px; font-size: 13px; color: #475569; text-align: left; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f1f5f9';this.style.color='#0f172a'" onmouseout="this.style.backgroundColor='transparent';this.style.color='#475569'">${item}</li>`;
            }).join('') + '</ul>';
    }

    // Listen to permission changes in sidebar
    document.querySelectorAll('.permission-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (typeof renderTable === 'function') renderTable();
            renderCompactActionMenu();
            
            // Real-time toggle for trace 20 (Contact Info)
            if (e.target.getAttribute('data-trace') === '20') {
                const isChecked = e.target.checked;
                const detailsContactInfoCard = document.getElementById('detailsContactInfoCard');
                if (detailsContactInfoCard) {
                    detailsContactInfoCard.style.display = isChecked ? '' : 'none';
                }
                const editContactInfoCard = document.getElementById('editContactInfoCard');
                if (editContactInfoCard) {
                    editContactInfoCard.style.display = isChecked ? '' : 'none';
                }
            }
            
            // Real-time toggle for trace 37 (Real Name)
            if (e.target.getAttribute('data-trace') === '37') {
                const isChecked = e.target.checked;
                const detailsRealName = document.getElementById('detailsRealName');
                if (detailsRealName) {
                    const rawVal = detailsRealName.getAttribute('data-val');
                    detailsRealName.textContent = isChecked ? (rawVal && rawVal !== '-' ? rawVal : '-') : window.maskRealName(rawVal);
                }
                const editFormRealName = document.getElementById('editFormRealName');
                if (editFormRealName) {
                    const rawVal = editFormRealName.getAttribute('data-val');
                    if (isChecked) {
                        editFormRealName.value = (rawVal && rawVal !== '-') ? rawVal : '';
                        editFormRealName.disabled = false;
                    } else {
                        editFormRealName.value = window.maskRealName(rawVal);
                        editFormRealName.disabled = true;
                    }
                }
            }
        });
    });

    // Drawer Elements
    const openBtn = document.getElementById('openAdvancedFilter');
    const closeBtn = document.getElementById('closeAdvancedFilter');
    const drawer = document.getElementById('advancedDrawer');
    const overlay = document.getElementById('overlay');
    const btnApply = document.getElementById('btnApply');
    const btnClearDrawer = document.getElementById('btnClearDrawer');

    // Filter Controls (Dynamic custom select instances)
    const dropdownStatus = document.getElementById('dropdownStatus');
    const dropdownLevel = document.getElementById('dropdownLevel');
    const dropdownVip = document.getElementById('dropdownVip');
    const dropdownOther = document.getElementById('dropdownOther');
    const dropdownTagsSearch = document.getElementById('dropdownTagsSearch');
    const dropdownDeviceType = document.getElementById('dropdownDeviceType');
    const dropdownCountry = document.getElementById('dropdownCountry');
    const inputAccount = document.getElementById('inputAccount');

    // Account Type Dropdown Controls
    const accountTypeSelected = document.getElementById('accountTypeSelected');
    const accountTypeMenu = document.getElementById('accountTypeMenu');
    const accountTypeText = document.getElementById('accountTypeText');
    let currentAccountType = 'exact'; // Default type: exact

    // Toggle Account Type Dropdown
    if (accountTypeSelected && accountTypeMenu) {
        accountTypeSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            accountTypeMenu.classList.toggle('show');
        });

        // Handle account type selection
        accountTypeMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                accountTypeMenu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                item.classList.add('active');
                
                const value = item.getAttribute('data-value');
                currentAccountType = value;
                
                const selectedText = item.querySelector('span').textContent;
                if (accountTypeText) accountTypeText.textContent = selectedText;

                // Change placeholder and clear value
                if (inputAccount) {
                    if (value === 'exact') {
                        inputAccount.placeholder = '請輸入精確帳號';
                    } else if (value === 'fuzzy') {
                        inputAccount.placeholder = '請輸入模糊帳號關鍵字';
                    } else if (value === 'multi') {
                        inputAccount.placeholder = "帐号以';'隔开，上限限制 50 个帐号";
                    } else {
                        inputAccount.placeholder = `請輸入${selectedText}`;
                    }
                    inputAccount.value = '';
                }
                
                accountTypeMenu.classList.remove('show');
            });
        });
    }

    // Toggle for Filter Test Accounts
    const filterTestAccountsToggle = document.getElementById('filterTestAccountsToggle');
    if (filterTestAccountsToggle) {
        filterTestAccountsToggle.addEventListener('change', () => {
            updateFilters();
            renderTable();
        });
    }

    // Helper: Close all dropdown menus
    function closeAllDropdowns() {
        document.querySelectorAll('.select-options').forEach(el => el.classList.remove('show'));
        if (typeof accountTypeMenu !== 'undefined' && accountTypeMenu) accountTypeMenu.classList.remove('show');
        const colToggle = document.getElementById('columnToggleDropdown');
        if (colToggle) colToggle.classList.remove('show');
        const batchMenu = document.getElementById('batchOperationsMenu');
        if (batchMenu) batchMenu.classList.remove('show');
        const exportMenu = document.getElementById('exportDataMenu');
        if (exportMenu) exportMenu.classList.remove('show');
        const basicFieldsDropdown = document.getElementById('basicFieldsDropdown');
        if (basicFieldsDropdown) basicFieldsDropdown.style.display = 'none';
    }

    // Close Dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-single') && 
            !e.target.closest('.custom-select-multi') && 
            !e.target.closest('.account-type-dropdown') &&
            !e.target.closest('.column-toggle-container') &&
            !e.target.closest('.batch-dropdown-container') &&
            !e.target.closest('.export-dropdown-container') &&
            !e.target.closest('.basic-fields-toggle-container')) {
            closeAllDropdowns();
        }
    });

    // Basic Fields Dropdown Toggler
    const btnFilterFieldsToggle = document.getElementById('btnFilterFieldsToggle');
    const basicFieldsDropdown = document.getElementById('basicFieldsDropdown');
    if (btnFilterFieldsToggle && basicFieldsDropdown) {
        btnFilterFieldsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = basicFieldsDropdown.style.display === 'block';
            closeAllDropdowns();
            if (!isOpen) {
                basicFieldsDropdown.style.display = 'block';
            }
        });

        basicFieldsDropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const fieldName = e.target.getAttribute('data-field');
                const fieldElement = document.querySelector(`#filterRow [data-field="${fieldName}"]`);
                if (fieldElement) {
                    fieldElement.style.display = e.target.checked ? '' : 'none';
                }
            });
        });
    }

    // Batch Operations Dropdown Toggler
    const btnBatchOperations = document.getElementById('btnBatchOperations');
    const batchOperationsMenu = document.getElementById('batchOperationsMenu');
    if (btnBatchOperations && batchOperationsMenu) {
        btnBatchOperations.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = batchOperationsMenu.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                batchOperationsMenu.classList.add('show');
            }
        });

        batchOperationsMenu.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                alert(`觸發操作：${li.textContent.trim()}`);
                batchOperationsMenu.classList.remove('show');
            });
        });
    }

    // Export Data Dropdown Toggler
    const btnExportData = document.getElementById('btnExportData');
    const exportDataMenu = document.getElementById('exportDataMenu');
    if (btnExportData && exportDataMenu) {
        btnExportData.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = exportDataMenu.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                exportDataMenu.classList.add('show');
            }
        });

        exportDataMenu.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                alert(`觸發操作：${li.textContent.trim()}`);
                exportDataMenu.classList.remove('show');
            });
        });
    }

    // Custom Dropdown single-select initializer
    function initSingleSelect(element, onChange) {
        const selected = element.querySelector('.select-selected');
        const selectedValSpan = element.querySelector('.selected-val');
        const optionsList = element.querySelector('.select-options');
        
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = optionsList.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                optionsList.classList.add('show');
            }
        });

        optionsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                optionsList.querySelectorAll('li').forEach(l => l.classList.remove('active'));
                li.classList.add('active');
                selectedValSpan.textContent = li.textContent.trim();
                optionsList.classList.remove('show');
                if (onChange) onChange(li.getAttribute('data-value'));
            });
        });
    }

    // Custom Dropdown multi-select initializer
    function initMultiSelect(element, onChange) {
        const selected = element.querySelector('.select-selected');
        const selectedValSpan = element.querySelector('.selected-val');
        const optionsList = element.querySelector('.select-options');

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = optionsList.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                optionsList.classList.add('show');
            }
        });

        optionsList.querySelectorAll('li').forEach(li => {
            if (li.classList.contains('search-input-li')) {
                // Keep dropdown open when clicking input
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                const searchInput = li.querySelector('input[type="text"]');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const val = e.target.value.trim().toLowerCase();
                        optionsList.querySelectorAll('li:not(.search-input-li)').forEach(item => {
                            const text = item.textContent.toLowerCase();
                            if (text.includes(val)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                }
                return; // skip standard checkbox logic
            }

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                const checkbox = li.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                li.classList.toggle('selected', checkbox.checked);
                
                updateDisplay();
                if (onChange) onChange();
            });
        });

        function updateDisplay() {
            const selectedItems = [];
            optionsList.querySelectorAll('li.selected').forEach(li => {
                selectedItems.push(li.getAttribute('data-value'));
            });

            if (selectedItems.length === 0) {
                selectedValSpan.textContent = '請選擇';
            } else if (selectedItems.length === 1) {
                selectedValSpan.textContent = selectedItems[0];
            } else {
                let displayText = selectedItems[0];
                let shownCount = 1;
                for (let i = 1; i < selectedItems.length; i++) {
                    if ((displayText + "、" + selectedItems[i]).length > 10) {
                        break;
                    }
                    displayText += "、" + selectedItems[i];
                    shownCount++;
                }
                
                if (shownCount < selectedItems.length) {
                    selectedValSpan.textContent = `${displayText} + ${selectedItems.length - shownCount}`;
                } else {
                    selectedValSpan.textContent = displayText;
                }
            }
        }
        
        // Initial run
        updateDisplay();
    }

    // Custom selections state
    let selectedStatusVal = '';
    let selectedLevelVal = '';
    let selectedDeviceTypeVal = '';
    let selectedCountryVal = '';
    let selectedBirthdayOuterVal = '';
    
    const dropdownBirthdayOuter = document.getElementById('dropdownBirthdayOuter');
    if (dropdownBirthdayOuter) {
        initSingleSelect(dropdownBirthdayOuter, (val) => {
            selectedBirthdayOuterVal = val;
        });
    }
    
    if (typeof dropdownStatus !== 'undefined' && dropdownStatus) {
        initSingleSelect(dropdownStatus, (val) => {
            selectedStatusVal = val;
        });
    }

    if (typeof dropdownLevel !== 'undefined' && dropdownLevel) {
        initSingleSelect(dropdownLevel, (val) => {
            selectedLevelVal = val;
        });
    }

    if (typeof dropdownDeviceType !== 'undefined' && dropdownDeviceType) {
        initSingleSelect(dropdownDeviceType, (val) => {
            selectedDeviceTypeVal = val;
        });
    }

    if (typeof dropdownCountry !== 'undefined' && dropdownCountry) {
        initSingleSelect(dropdownCountry, (val) => {
            selectedCountryVal = val;
        });
    }

    if (typeof dropdownVip !== 'undefined' && dropdownVip) {
        initMultiSelect(dropdownVip, () => {
        });
    }

    if (typeof dropdownOther !== 'undefined' && dropdownOther) {
        initMultiSelect(dropdownOther, () => {
        });
    }

    if (typeof dropdownTagsSearch !== 'undefined' && dropdownTagsSearch) {
        initMultiSelect(dropdownTagsSearch, () => {
        });
    }

    // Advanced Filter Controls
    const selectBirthday = document.getElementById('selectBirthday');
    const inputDateStart = document.getElementById('inputDateStart');
    const inputDateEnd = document.getElementById('inputDateEnd');
    const inputQuickLogin = document.getElementById('inputQuickLogin') || { value: "" };
    const inputUid = document.getElementById('inputUid') || { value: "" };
    const inputInviteCode = document.getElementById('inputInviteCode') || { value: "" };
    const inputNickname = document.getElementById('inputNickname') || { value: "" };
    const inputRealName = document.getElementById('inputRealName') || { value: "" };
    const inputBankCard = document.getElementById('inputBankCard');
    const inputOfflineDays = document.getElementById('inputOfflineDays');
    const inputIp = document.getElementById('inputIp');
    const inputDeposit = document.getElementById('inputDeposit');

    // Outer fields
    const inputDateStartOuter = document.getElementById('inputDateStartOuter');
    const inputDateEndOuter = document.getElementById('inputDateEndOuter');
    const inputBankCardOuter = document.getElementById('inputBankCardOuter');
    const inputOfflineDaysOuter = document.getElementById('inputOfflineDaysOuter');
    const inputIpOuter = document.getElementById('inputIpOuter');
    const inputDepositOuter = document.getElementById('inputDepositOuter');

    // Actions & Containers
    const btnSearch = document.getElementById('btnSearch');
    const btnReset = document.getElementById('btnReset');
    const btnClearAll = document.getElementById('btnClearAll');
    const filterTagsContainer = document.getElementById('filterTagsContainer');
    const userTableBody = document.getElementById('userTableBody');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const advancedBadge = document.getElementById('advancedBadge');

    // Drawer state toggle
    function openDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('active');
        const columnsDrawer = document.getElementById('columnsDrawer');
        if (columnsDrawer) columnsDrawer.classList.remove('active');
        const userEditDrawer = document.getElementById('userEditDrawer');
        if (userEditDrawer) userEditDrawer.classList.remove('active');
        const agentChangeRecordDrawer = document.getElementById('agentChangeRecordDrawer');
        if (agentChangeRecordDrawer) agentChangeRecordDrawer.classList.remove('active');
        const userDetailsDrawer = document.getElementById('userDetailsDrawer');
        if (userDetailsDrawer) {
            userDetailsDrawer.classList.remove('active');
            const expandPanel = document.getElementById('detailsExpandPanel');
            setTimeout(() => {
                userDetailsDrawer.style.width = '960px';
                if (expandPanel) expandPanel.style.display = 'none';
            }, 300);
        }
        
        if (overlay) overlay.classList.remove('active');
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    document.getElementById('btnColumnsDrawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('btnAgentChangeRecordClose')?.addEventListener('click', closeDrawer);

    // Table Mode & Pagination States
    let currentTableMode = 'nested'; // 'nested' or 'compact'
    let currentPage = 1;
    let pageSize = 20;

    // Sorting State
    let currentSortColumn = '';
    let currentSortDirection = ''; // 'asc' or 'desc'

    // Pinning State
    let pinnedColumnIds = [];
    let tempPinnedColumnIds = [];
    
    // Nested Visibility State
    const nestedColumnsConfig = [
        { id: 'online', label: '在线' },
        { id: 'avatar', label: '头像' },
        { id: 'memberInfo', label: '会员信息' },
        { id: 'levelTeam', label: '层级&团队' },
        { id: 'creditLimit', label: '信用 & 额度' },
        { id: 'depositWithdraw', label: '存提款', requirePerm: 7 },
        { id: 'tags', label: '标签' },
        { id: 'status', label: '状态' },
        { id: 'dateInfo', label: '日期信息' },
        { id: 'remark', label: '备注', requirePerm: 21 }
    ];
    let nestedColumnVisibility = {};
    let tempNestedColumnVisibility = {};
    let nestedPinnedColumnIds = [];
    let tempNestedPinnedColumnIds = [];
    nestedColumnsConfig.forEach(col => { nestedColumnVisibility[col.id] = true; });

    // Compact Visibility State
    let compactColumnVisibility = {};
    let tempCompactColumnVisibility = {};
    let nestedDropdownHtml = '';
    // --- Data State Rendering Helper ---
    function renderDataState(val, type = 'text') {
        if (val === '-' || val === null || val === undefined || val === '' || val === '無數據') {
            if (type === 'phone') {
                return `<span class="tag-unbound">未驗證</span>`;
            }
            return `<span class="data-empty">-</span>`;
        }
        if (val === '未綁定' || val === '未驗證') {
            return `<span class="tag-unbound">${val}</span>`;
        }
        if (val === '無權限') {
            return `<span class="tag-no-permission" title="無權限"><i class="ph-fill ph-lock"></i></span>`;
        }
        if (val === 'NaN-NaN-NaN' || val === '解析異常') {
            return `<span class="tag-parse-error" title="原數據異常，無法正確解析">${val === 'NaN-NaN-NaN' ? '解析異常' : val}</span>`;
        }
        
        // Formats
        if (type === 'bankCard' || type === 'masked') {
            return `<span class="status-bound"><span class="data-masked">${val}</span></span>`;
        }
        if (type === 'longText') {
            return `<span class="text-truncate" title="${val}">${val}</span>`;
        }
        if (type === 'copyable') {
            return `<span class="copyable-text" onclick="alert('已複製：' + '${val}')" title="點擊複製">${val}<i class="ph-bold ph-copy copy-icon"></i></span>`;
        }
        if (type === 'ip') {
            return `<a href="#" class="ip-link" data-ip="${val}" style="color: var(--primary-color); text-decoration: none;">${val}</a> <i class="ph ph-copy copy-ip-btn" data-ip="${val}" style="cursor: pointer; color: var(--text-muted);" title="複製IP"></i>`;
        }
    
        return val;
    }

    window.maskRealName = function(name) {
        if (!name || name === '-' || name === '未填寫' || name === '***') return '-';
        return name.charAt(0) + '**';
    };

    window.maskIp = function(ip) {
        if (!ip || ip === '-' || typeof ip !== 'string') return '***.***.***.***';
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.*.*`;
        }
        return '***.***.***.***';
    };

    window.maskPhone = function(phone) {
        if (!phone || phone === '-' || phone === '未驗證' || phone === '未填寫') return phone;
        phone = String(phone);
        if (phone.length <= 4) return '**' + phone;
        return '**' + phone.substring(phone.length - 4);
    };

    window.maskEmail = function(email) {
        if (!email || email === '-') return '-';
        email = String(email);
        const parts = email.split('@');
        if (parts.length !== 2) return window.maskMiddle(email);
        const username = parts[0];
        const domain = parts[1];
        if (username.length <= 2) return username + '**@' + domain;
        return username.substring(0, 2) + '**@' + domain;
    };

    window.maskMiddle = function(str) {
        if (!str || str === '-') return '-';
        str = String(str);
        if (str.length <= 4) return str.substring(0, 1) + '***' + str.substring(str.length - 1);
        return str.substring(0, 2) + '***' + str.substring(str.length - 2);
    };

    window.getPhoneStatusHtml = function(phone) {
        if (phone === '審核中') return '<span style="color: #ef4444; font-weight: 600;">審核中</span>';
        if (phone === '待重新綁定') return '<span style="color: #f59e0b; font-weight: 500;">待重新綁定</span>';
        if (phone && phone !== '-' && phone !== '未驗證' && phone !== '末綁定' && phone !== '未綁定') {
            return '<span style="color: #16a34a; font-weight: 500;">已驗證</span>';
        }
        return '<span style="color: #94a3b8;">未驗證</span>';
    }

    const compactColumnsConfig = [
        { id: 'uid', group: '基本', label: '用户ID', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="uid">${renderDataState(user.uid, 'copyable')}</td>` },
        { id: 'account', group: '基本', label: '会员名', checkboxIndex: 3, render: (user) => `<td data-col="account"><a href="#" class="cell-username user-detail-link" data-uid="${user.uid}">${renderDataState(user.account, 'copyable')}</a></td>` },
        { id: 'online', group: '状态', label: '在线', checkboxIndex: 1, render: (user) => {
            const isOnline = user.offlineDays === 0;
            const isDisabled = user.status === '停用' || user.status === '冻结';
            
            const badgeBg = isOnline ? '#dcfce7' : '#f1f5f9';
            const badgeColor = isOnline ? '#16a34a' : '#64748b';
            const dotColor = isOnline ? '#10b981' : '#9ca3af';
            
            const statusBadge = `
                <div style="display: inline-flex; align-items: center; gap: 4px; background: ${badgeBg}; padding: 2px 8px; border-radius: 12px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span>
                    <span style="color: ${badgeColor}; font-size: 12px; font-weight: 500;">${isOnline ? '在线' : '离线'}</span>
                </div>
            `;
            
            let buttonsHtml = `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px;">${statusBadge}`;
            if (!isDisabled) {
                buttonsHtml += `<a href="#" class="op-link btn-action-disable" style="font-size: 12px; padding: 4px 8px; background: #ef4444; color: white; border-radius: 4px; text-decoration: none;" onclick="window.showConfirmModal('確定要停用此會員嗎？', function(){ window.handleDisableUser('${user.uid}'); }); return false;">停用</a>`;
            }
            if (isOnline) {
                buttonsHtml += `<a href="#" class="op-link btn-action-kick" style="font-size: 12px; padding: 4px 8px; background: #f59e0b; color: white; border-radius: 4px; text-decoration: none;" onclick="window.showConfirmModal('確定要將此會員踢下線嗎？', function(){ window.handleKickOfflineUser('${user.uid}'); }); return false;">踢下线</a>`;
            }
            buttonsHtml += `</div>`;
            return `<td data-col="online">${buttonsHtml}</td>`;
        } },
        { id: 'status', group: '状态', label: '状态', checkboxIndex: 1, render: (user) => {
            let color = '#333';
            if (user.status === '正常') color = '#16a34a'; // Green
            else if (user.status === '冻结') color = '#3b82f6'; // Blue
            else if (user.status === '停用') color = '#ef4444'; // Red
            else if (user.status === '待审核' || user.status === '待審核') color = '#f59e0b'; // Orange
            return `<td data-col="status"><span style="color: ${color}; font-weight: 500;">${user.status}</span></td>`;
        } },
        { id: 'avatar', group: '状态', label: '头像', checkboxIndex: 2, render: (user) => `<td data-col="avatar"><div class="avatar-cell" style="width:24px;height:24px;border-radius:50%;background:#3b82f6;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;margin:0 auto;">${user.account.charAt(0).toLowerCase()}</div></td>` },
        { id: 'realName', group: '账号', label: '真实姓名', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="realName">${hasPerm(37) ? renderDataState(user.realName) : window.maskRealName(user.realName)}</td>` },
        { id: 'nickname', group: '账号', label: '昵称', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="nickname">${(user.nickname && user.nickname !== '-') ? user.nickname : renderDataState(user.account)}</td>` },
        { id: 'agentId', group: '会员信息（详细）', label: '代理', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="agentId">${renderDataState(user.agentId)}</td>` },
        { id: 'inviter', group: '会员信息（详细）', label: '邀请人', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="inviter">${renderDataState(user.inviter)}</td>` },
        { id: 'registerMode', group: '会员信息（详细）', label: '注册模式', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="registerMode">${user.registerMode || '一般注册'}</td>` },
        { id: 'phone', group: '会员信息（详细）', label: '手机号', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="phone">${hasPerm(85) ? (user.phone !== '未驗證' && user.phone !== '末綁定' && user.phone !== '-' ? user.phone : getPhoneStatusHtml(user.phone)) : window.maskPhone(user.phone)}</td>` },
        { id: 'deviceType', group: '会员信息（详细）', label: '设备类型', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="deviceType">${renderDataState(user.deviceType)}</td>` },
        { id: 'currency', group: '会员信息（详细）', label: '用户币别', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="currency"><span style="color: #ef4444;">${user.currency || 'BRL'}</span></td>` },
        { id: 'country', group: '会员信息（详细）', label: '国家', checkboxIndex: 3, render: (user) => `<td class="cell-val" data-col="country"><span style="color: #ef4444;">${user.country || '巴西'}</span></td>` },
        { id: 'payLevel', group: '等级 & 团队', label: '支付层级', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="payLevel">${hasPerm(4) ? (user.payLevel || '默认层') : '***'}</td>` },
        { id: 'growth', group: '等级 & 团队', label: '成长值', sortable: true, checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="growth">${user.growth || 0}</td>` },
        { id: 'level', group: '等级 & 团队', label: '等级', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="level">${user.level || '默认层'}</td>` },
        { id: 'accountType', group: '等级 & 团队', label: '账号类型', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="accountType">${user.accountType || '普通账号'}</td>` },
        { id: 'userType', group: '等级 & 团队', label: '会员类型', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="userType">${user.userType || '代理会员'}</td>` },
        { id: 'inviteCode', group: '等级 & 团队', label: '邀请码', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="inviteCode">${user.inviteCode || ''}</td>` },
        { id: 'directTeam', group: '等级 & 团队', label: '直属下级/团队数', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="directTeam"><a href="#" class="subordinate-link" style="color: var(--primary-color); text-decoration: underline;" data-uid="${user.uid}">${hasPerm(6) ? (user.directTeam || '0/0') : '*/*'}</a></td>` },
        { id: 'vipLevel', group: '等级 & 团队', label: 'VIP等级', checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="vipLevel">${user.vipLevel || 0}</td>` },
        { id: 'vipGrowth', group: '等级 & 团队', label: 'VIP成长值', sortable: true, checkboxIndex: 4, render: (user) => `<td class="cell-val" data-col="vipGrowth">${user.vipGrowth || 0}</td>` },
        { id: 'creditValue', group: '信用 & 额度', label: '信用值', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-val" data-col="creditValue">${hasPerm(7) ? (user.creditValue || 0) : '***'}</td>` },
        { id: 'availableCredit', group: '信用 & 额度', label: '可用额度', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-val" data-col="availableCredit">${user.availableCredit || '59,711.53'}</td>` },
        { id: 'commissionBal', group: '信用 & 额度', label: '佣金余额', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-money ${hasPerm(7) && user.commissionBal > 0 ? 'positive' : ''}" data-col="commissionBal">${hasPerm(7) ? (user.commissionBal > 0 ? user.commissionBal : '0.00') : '***'}</td>` },
        { id: 'balanceBuy', group: '信用 & 额度', label: '余额宝', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-money ${user.balanceBuy > 0 ? 'highlight' : ''}" data-col="balanceBuy">${user.balanceBuy > 0 ? user.balanceBuy : '0.00'}</td>` },
        { id: 'arrears', group: '信用 & 额度', label: '欠款', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-money ${hasPerm(7) && user.arrears === '0' ? 'negative' : ''}" style="color:${hasPerm(7) && user.arrears === '0' ? '#ef4444' : 'inherit'};" data-col="arrears">${hasPerm(7) ? renderDataState(user.arrears || '0.00') : '***'}</td>` },
        { id: 'interest', group: '信用 & 额度', label: '余额宝利息', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-val" data-col="interest">${user.interest || '0.00'}</td>` },
        { id: 'thirdBal', group: '信用 & 额度', label: '三方余额', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-val" data-col="thirdBal"><div style="display:flex;align-items:center;">${user.thirdBal > 0 ? user.thirdBal : '0.00'} <i class="ph ph-arrows-clockwise refresh-icon-compact" data-uid="${user.uid}" title="刷新余额"></i></div></td>` },
        { id: 'points', group: '信用 & 额度', label: '会员积分', sortable: true, checkboxIndex: 5, render: (user) => `<td class="cell-val" data-col="points">${user.points || '0.00'}</td>` },
        { id: 'deposit', group: '存提款', label: '存款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-money ${user.deposit > 0 ? 'highlight' : ''}" data-col="deposit">${user.deposit > 0 ? user.deposit : '0.00'}</td>` },
        { id: 'withdraw', group: '存提款', label: '提款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-money" data-col="withdraw">${user.withdraw > 0 ? user.withdraw : '0.00'}</td>` },
        { id: 'depositCount', group: '存提款', label: '存款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="depositCount">${user.depositCount || 0}</td>` },
        { id: 'withdrawCount', group: '存提款', label: '提款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="withdrawCount">${user.withdrawCount || 0}</td>` },
        { id: 'adminAdd', group: '存提款', label: '后台加款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminAdd">${user.adminAdd || '50,000.00'}</td>` },
        { id: 'adminDeduct', group: '存提款', label: '后台扣款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminDeduct">${user.adminDeduct || '0.00'}</td>` },
        { id: 'adminActivityAdd', group: '存提款', label: '后台活动加款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminActivityAdd">${user.adminActivityAdd || '0.00'}</td>` },
        { id: 'adminAddCount', group: '存提款', label: '后台加款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminAddCount">${user.adminAddCount || 1}</td>` },
        { id: 'adminDeductCount', group: '存提款', label: '后台扣款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminDeductCount">${user.adminDeductCount || 0}</td>` },
        { id: 'adminActivityAddCount', group: '存提款', label: '后台活动加款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="adminActivityAddCount">${user.adminActivityAddCount || 0}</td>` },
        { id: 'quickDeposit', group: '存提款', label: '免提直充充值总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="quickDeposit">${user.quickDeposit || '0.00'}</td>` },
        { id: 'quickDepositCount', group: '存提款', label: '免提直充充值次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="quickDepositCount">${user.quickDepositCount || 0}</td>` },
        { id: 'quickWithdraw', group: '存提款', label: '免提直充提款总额', sortable: true, checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="quickWithdraw">${user.quickWithdraw || '0.00'}</td>` },
        { id: 'quickWithdrawCount', group: '存提款', label: '免提直充提款次数', checkboxIndex: 6, requirePerm: 7, render: (user) => `<td class="cell-val" data-col="quickWithdrawCount">${user.quickWithdrawCount || 0}</td>` },
        { id: 'tags', group: '其他', label: '标签', checkboxIndex: 7, render: (user) => {
            const tagStyles = {
                '正常': 'tag-blue',
                'VIP 客戶': 'tag-blue',
                'VIP': 'tag-blue',
                '活躍': 'tag-green',
                '高頻交易': 'tag-green',
                '大戶': 'tag-purple',
                '高消費': 'tag-purple',
                '異常風險': 'tag-red'
            };

            let riskIndicatorHtml = '';
            let currentTags = user.tags;
            let visibleCount = currentTags.length;
            let showGradientMore = false;
            let showGrayMore = false;

            // Mock Scenarios based on uid for demonstration
            if (user.uid === "1239361225") {
                // Scenario 1
                riskIndicatorHtml = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-right: 8px;">
                        <div class="tag-more-container">
                            <div style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
                                <i class="ph-fill ph-warning" style="color: #dc2626; font-size: 14px;"></i>
                                <div style="position: absolute; top: 0; right: 0; width: 6px; height: 6px; background-color: #dc2626; border-radius: 50%; border: 1px solid #fff;"></div>
                            </div>
                            <div class="tag-tooltip">
                                <span class="user-custom-tag tag-red"><i class="ph-fill ph-warning-circle" style="margin-right: 4px; font-size: 13px;"></i>異常風險</span>
                            </div>
                        </div>
                        <div style="width: 1px; height: 16px; background-color: #e2e8f0;"></div>
                    </div>
                `;
                visibleCount = 3;
                showGradientMore = true;
            } else if (user.uid === "1239361224") {
                // Scenario 2
                visibleCount = 2;
                showGrayMore = true;
            }

            let renderedTags = [];
            for (let i = 0; i < currentTags.length; i++) {
                if (i < visibleCount) {
                    renderedTags.push(currentTags[i]);
                } else if (!showGradientMore && !showGrayMore) {
                    renderedTags.push(currentTags[i]);
                }
            }
            
            let tagsOutput = renderedTags.map(tag => {
                let styleClass = tagStyles[tag] || 'tag-grey';
                if (tag === '異常風險') {
                    return `<span class="user-custom-tag ${styleClass}"><i class="ph-fill ph-warning-circle" style="margin-right: 4px; font-size: 13px;"></i>${tag}</span>`;
                }
                return `<span class="user-custom-tag ${styleClass}">${tag}</span>`;
            }).join('');

            let tooltipHtml = '';
            if (showGradientMore || showGrayMore) {
                let hiddenTagsHtml = currentTags.slice(visibleCount).map(tag => {
                    let styleClass = tagStyles[tag] || 'tag-grey';
                    if (tag === '異常風險') {
                        return `<span class="user-custom-tag ${styleClass}"><i class="ph-fill ph-warning-circle" style="margin-right: 4px; font-size: 13px;"></i>${tag}</span>`;
                    }
                    return `<span class="user-custom-tag ${styleClass}">${tag}</span>`;
                }).join('');
                tooltipHtml = `<div class="tag-tooltip">${hiddenTagsHtml}</div>`;
            }

            if (showGradientMore) {
                let fourthTag = currentTags[visibleCount] || '標籤...';
                let hiddenCount = currentTags.length - visibleCount;
                tagsOutput += `
                    <div class="tag-more-container" style="position: relative; display: flex; align-items: center; margin-left: 0px;">
                        <span class="user-custom-tag tag-grey" style="color: #cbd5e1; border-color: #f8fafc; padding-right: 20px;">${fourthTag}</span>
                        <div style="width: 32px; height: 100%; background: linear-gradient(to right, transparent, #fff 70%); position: absolute; left: 16px; top: 0; z-index: 1; pointer-events: none;"></div>
                        <span class="user-custom-tag" style="background-color: #fff; color: #2563eb; border: 1px solid #bfdbfe; font-weight: 500; position: absolute; right: 0; z-index: 2; padding: 2px 6px; margin-right: -4px;">+${hiddenCount}</span>
                        ${tooltipHtml}
                    </div>
                `;
            } else if (showGrayMore) {
                let hiddenCount = user.tags.length - visibleCount;
                tagsOutput += `<div class="tag-more-container"><span class="user-custom-tag tag-grey" style="padding: 2px 6px; font-weight: 500;">+${hiddenCount}</span>${tooltipHtml}</div>`;
            }

            return `<td data-col="tags">
                <div style="display:flex; align-items: center;">
                    ${riskIndicatorHtml}
                    <div style="display:flex; gap:4px; flex-wrap:${currentTableMode === 'compact' ? 'nowrap' : 'wrap'}; align-items: center;">
                        ${tagsOutput}
                    </div>
                </div>
            </td>`;
        } },

        { id: 'date', group: '日期信息', label: '新增时间', sortable: true, checkboxIndex: 9, render: (user) => `<td class="cell-val" data-col="date">${user.date || '28-08-18 01:17'}</td>` },
        { id: 'lastLogin', group: '日期信息', label: '最后登录', sortable: true, checkboxIndex: 9, render: (user) => `<td class="cell-val" data-col="lastLogin">${user.lastLogin || '今日 01:22:56'}</td>` },
        { id: 'offlineDays', group: '日期信息', label: '离开天数', sortable: true, checkboxIndex: 9, render: (user) => `<td class="cell-val" data-col="offlineDays">${user.offlineDays !== undefined ? user.offlineDays : 0}天</td>` },
        { id: 'ip', group: '日期信息', label: '当前登录IP', checkboxIndex: 9, render: (user) => `<td class="cell-val" data-col="ip"><div class="ip-row" style="display: flex; align-items: center; gap: 4px;">${hasPerm(17) ? renderDataState(user.ip || '54.150.111.152', 'ip') : window.maskIp(user.ip)}</div></td>` },
        { id: 'regIp', group: '日期信息', label: '注册 IP', checkboxIndex: 9, render: (user) => `<td class="cell-val" data-col="regIp"><div class="ip-row" style="display: flex; align-items: center; gap: 4px;">${hasPerm(17) ? renderDataState(user.regIp || '54.150.111.152', 'ip') : window.maskIp(user.regIp)}</div></td>` },
        { id: 'remark', group: '备注', label: '备注', checkboxIndex: 10, requirePerm: 21, render: (user) => `<td class="cell-val" data-col="remark">${user.remark}</td>` },
        { id: 'followRemark', group: '备注', label: '回访备注', checkboxIndex: 10, requirePerm: 21, render: (user) => `<td class="cell-val" data-col="followRemark">${user.followRemark}</td>` },
        { id: 'action', group: '操作', label: '操作', render: (user) => {
            return `<td class="sticky-col-right" data-col="action" style="overflow:visible;text-align:center;vertical-align:middle;">
                <div class="compact-action-container" style="display:inline-flex;align-items:center;justify-content:center;">
                    <i class="ph ph-dots-three compact-action-icon" data-uid="${user.uid}" style="cursor:pointer;padding:4px;font-size:24px;color:#6b7280;line-height:1;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#6b7280'"></i>
                </div>
            </td>`;
        } }
    ];
    compactColumnsConfig.forEach(col => { compactColumnVisibility[col.id] = true; });

    // Elements for Table Mode & Pagination
    const btnModeNested = document.getElementById('btnModeNested');
    const btnModeCompact = document.getElementById('btnModeCompact');
    const modeDescriptionText = document.getElementById('modeDescriptionText');
    const modeNoticeText = document.getElementById('modeNoticeText');
    const userTable = document.getElementById('userTable');
    const userTableHeader = document.getElementById('userTableHeader');
    
    const selectPageSize = document.getElementById('selectPageSize');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const pageNumbersList = document.getElementById('pageNumbersList');
    const inputJumpPage = document.getElementById('inputJumpPage');

    // Handle Table Mode Toggle
    function setTableMode(mode) {
        currentTableMode = mode;
        if (mode === 'nested') {
            if (btnModeNested) btnModeNested.classList.add('active');
            if (btnModeCompact) btnModeCompact.classList.remove('active');
            if (modeDescriptionText) modeDescriptionText.textContent = '巢狀結構：分組整合屬性，減少表格欄位寬度';
            if (modeNoticeText) modeNoticeText.innerHTML = '<strong>巢狀模式</strong>：將欄位屬性垂直分組組合，畫面精簡展示。點擊切換為壓縮模式可展開所有獨立列進行橫向比對。';
            if (userTable) userTable.classList.remove('compact-mode-table');
        } else {
            if (btnModeCompact) btnModeCompact.classList.add('active');
            if (btnModeNested) btnModeNested.classList.remove('active');
            if (modeDescriptionText) modeDescriptionText.textContent = '壓縮結構：扁平化所有屬性，適合橫向數據比對';
            if (modeNoticeText) modeNoticeText.innerHTML = '<strong>壓縮模式</strong>：所有欄位變成獨立的列，標題只出現在最上方一次，數據按行排列，方便橫向比對，類似 Excel 的視圖。';
            if (userTable) userTable.classList.add('compact-mode-table');
        }
        currentPage = 1;
        renderTable();
    }

    if (btnModeNested) btnModeNested.addEventListener('click', () => setTableMode('nested'));
    if (btnModeCompact) btnModeCompact.addEventListener('click', () => setTableMode('compact'));

    // Handle Page Size Change
    if (selectPageSize) {
        selectPageSize.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10);
            currentPage = 1;
            renderTable();
        });
    }

    // Handle Prev / Next Page Click
    if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }

    if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            currentPage++;
            renderTable();
        });
    }

    // Handle Jump Page Input
    if (inputJumpPage) {
        inputJumpPage.addEventListener('change', (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            currentPage = val;
            renderTable();
        });
        inputJumpPage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                currentPage = val;
                renderTable();
            }
        });
    }

    // Comprehensive Mock Users Database (50 Users for pagination demonstration)
    const baseMockUsers = [
        { uid: "1239361225", account: "mingv0717001", realName: "李小明", nickname: "", agentId: "dl", inviter: "-", registerMode: "一般註冊", phone: "末綁定", payLevel: "默認層", growth: 0, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "-", directTeam: "0/0", vipLevel: 0, vipGrowth: 0, creditValue: 0, availableCredit: 0, commissionBal: 0, balanceBuy: 0, arrears: "-", interest: 0, thirdBal: 0, points: 0, deposit: 0, withdraw: 0, withdrawPre: "-", adminDeduct: "-", depositCount: 0, withdrawCount: 0, tags: ["VIP 客戶", "高頻交易", "大戶", "標籤四", "標籤五", "標籤六"], status: "正常", date: "2023-01-01 12:00:00", lastLogin: "2023-01-10 15:30:00", offlineDays: 9, ip: "192.168.1.1", remark: "-", followRemark: "-", note: "-", deviceType: "iOS" },
        { uid: "1239361224", account: "albertvn021", realName: "黃大維", nickname: "阿布", agentId: "nnest123556", inviter: "nnest123556", registerMode: "一般註冊", phone: "未驗證", payLevel: "默認層", growth: 0, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "06077790", directTeam: "0/0", vipLevel: 0, vipGrowth: 0, creditValue: 0, availableCredit: 0, commissionBal: 0, balanceBuy: 0, arrears: "-", interest: 0, thirdBal: 0, points: 0, deposit: 0, withdraw: 0, withdrawPre: "-", adminDeduct: "-", depositCount: 0, withdrawCount: 0, tags: ["異常風險", "VIP 客戶", "標籤三", "標籤四", "標籤五"], status: "停用", date: "2023-01-02 10:00:00", lastLogin: "2023-01-11 09:20:00", offlineDays: 9, ip: "192.168.1.2", remark: "-", followRemark: "-", note: "-", deviceType: "Android" },
        { uid: "1239361223", account: "vip_king", realName: "李娜", realNameAudited: true, birthdayAudited: true, nickname: "鄭姐", agentId: "AG888", inviter: "nnest123556", registerMode: "一般註冊", phone: "13812348888", payLevel: "默認層", growth: 1250, level: "鑽石會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "INV02", directTeam: "12/8", vipLevel: 3, vipGrowth: 6800, creditValue: 500, availableCredit: 2000, commissionBal: 680, balanceBuy: 8750, arrears: "0", interest: 120, thirdBal: 320, points: 450, deposit: 3200, withdraw: 1500, withdrawPre: "-", adminDeduct: "-", depositCount: 8, withdrawCount: 4, tags: ["正常", "活躍", "高消費", "標籤四", "標籤五"], status: "正常", date: "2023-01-05 14:15:00", lastLogin: "2023-01-15 18:45:00", offlineDays: 0, ip: "192.168.1.3", remark: "-", followRemark: "-", note: "-", deviceType: "PC" },
        { uid: "1239361226", account: "test_user_1", realName: "王大明", nickname: "王大", agentId: "dl", inviter: "nnest123556", registerMode: "後台新增", phone: "0912345678", payLevel: "默認層", growth: 0, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "CODE100", directTeam: "0/0", vipLevel: 0, vipGrowth: 0, creditValue: 500, availableCredit: 0, commissionBal: 0, balanceBuy: 0, arrears: "0", interest: 0, thirdBal: 150, points: 0, deposit: 0, withdraw: 0, withdrawPre: "-", adminDeduct: "-", depositCount: 0, withdrawCount: 0, tags: ["新註冊"], status: "停用", date: "2023-02-01 10:00:00", lastLogin: "2023-03-01 15:30:00", offlineDays: 30, ip: "192.168.2.10", remark: "大戶需關注", followRemark: "-", note: "-", deviceType: "H5" },
        { uid: "1239361227", account: "test_user_2", realName: "林小華", nickname: "", agentId: "AG888", inviter: "-", registerMode: "一般註冊", phone: "0987654321", payLevel: "默認層", growth: 150, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "-", directTeam: "1/1", vipLevel: 1, vipGrowth: 50, creditValue: 0, availableCredit: 1000, commissionBal: 15, balanceBuy: 300, arrears: "0", interest: 2, thirdBal: 0, points: 25, deposit: 2000, withdraw: 500, withdrawPre: "-", adminDeduct: "-", depositCount: 1, withdrawCount: 1, tags: ["新註冊"], status: "停用", date: "2023-02-02 10:00:00", lastLogin: "2023-03-02 15:30:00", offlineDays: 1, ip: "192.168.1.100", remark: "-", followRemark: "-", note: "-", deviceType: null },
        { uid: "1239361228", account: "test_user_3", realName: "周思齊", nickname: "Alice", agentId: "nnest123556", inviter: "nnest123556", registerMode: "一般註冊", phone: "13912341002", payLevel: "默認層", growth: 300, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "CODE102", directTeam: "2/2", vipLevel: 2, vipGrowth: 100, creditValue: 500, availableCredit: 2000, commissionBal: 30, balanceBuy: 600, arrears: "0", interest: 4, thirdBal: 0, points: 50, deposit: 4000, withdraw: 1000, withdrawPre: "-", adminDeduct: "-", depositCount: 2, withdrawCount: 2, tags: ["新註冊"], status: "正常", date: "2023-02-03 10:00:00", lastLogin: "2023-03-03 15:30:00", offlineDays: 2, ip: "192.168.2.12", remark: "-", followRemark: "-", note: "-", deviceType: "Android" },
        { uid: "1239361229", account: "test_user_4", realName: "陳大文", nickname: "", agentId: "dl", inviter: "-", registerMode: "一般註冊", phone: "未綁定", payLevel: "默認層", growth: 450, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "-", directTeam: "3/0", vipLevel: 3, vipGrowth: 150, creditValue: 0, availableCredit: 3000, commissionBal: 45, balanceBuy: 900, arrears: "0", interest: 6, thirdBal: 0, points: 75, deposit: 6000, withdraw: 1500, withdrawPre: "-", adminDeduct: "-", depositCount: 3, withdrawCount: 3, tags: ["新註冊"], status: "冻结", date: "2023-02-04 10:00:00", lastLogin: "2023-03-04 15:30:00", offlineDays: 3, ip: "192.168.2.13", remark: "這是一段非常長非常長非常長的備註，用來測試單行截斷與懸停提示的效果是否正常運作。", followRemark: "-", note: "-", deviceType: "" },
        { uid: "1239361230", account: "test_user_5", realName: "許大茂", nickname: "小明", agentId: "AG888", inviter: "nnest123556", registerMode: "後台新增", phone: "13912341004", payLevel: "默認層", growth: 600, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "CODE104", directTeam: "4/1", vipLevel: 0, vipGrowth: 200, creditValue: 500, availableCredit: 4000, commissionBal: 60, balanceBuy: 1200, arrears: "0", interest: 8, thirdBal: 150, points: 100, deposit: 8000, withdraw: 2000, withdrawPre: "-", adminDeduct: "-", depositCount: 4, withdrawCount: 4, tags: ["新註冊"], status: "冻结", date: "2023-02-05 10:00:00", lastLogin: "2023-03-05 15:30:00", offlineDays: 4, ip: "192.168.2.14", remark: "-", followRemark: "-", note: "-" },
        { uid: "1239361231", account: "test_user_6", realName: "陳阿明", nickname: "", agentId: "ag123", inviter: "-", registerMode: "一般註冊", phone: "待重新綁定", payLevel: "默認層", growth: 750, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "-", directTeam: "0/2", vipLevel: 1, vipGrowth: 250, creditValue: 0, availableCredit: 5000, commissionBal: 75, balanceBuy: 1500, arrears: "0", interest: 10, thirdBal: 0, points: 125, deposit: 10000, withdraw: 2500, withdrawPre: "-", adminDeduct: "-", depositCount: 5, withdrawCount: 5, tags: ["正常", "活躍"], status: "正常", date: "2023-02-06 10:00:00", lastLogin: "2023-03-06 15:30:00", offlineDays: 5, ip: "192.168.2.15", remark: "-", followRemark: "-", note: "-" },
        { uid: "1239361232", account: "test_user_7", realName: "陳大文", nickname: "SuperAdmin", agentId: "dl", inviter: "nnest123556", registerMode: "一般註冊", phone: "審核中", payLevel: "默認層", growth: 900, level: "普通會員", accountType: "普通帳號", userType: "代理會員", inviteCode: "CODE106", directTeam: "1/0", vipLevel: 2, vipGrowth: 300, creditValue: 500, availableCredit: 6000, commissionBal: 90, balanceBuy: 1800, arrears: "0", interest: 12, thirdBal: 0, points: 150, deposit: 12000, withdraw: 3000, withdrawPre: "-", adminDeduct: "-", depositCount: 6, withdrawCount: 0, tags: ["新註冊"], status: "冻结", date: "2023-02-07 10:00:00", lastLogin: "2023-03-07 15:30:00", offlineDays: 6, ip: "192.168.2.16", remark: "-", followRemark: "-", note: "-" }
    ];

    // Generate 200 items to ensure pagination works smoothly with up to 100 items per page
    const mockUsers = [];
    for (let i = 0; i < 20; i++) {
        baseMockUsers.forEach((user, index) => {
            const num = (i * 10) + index + 1;
            const newUid = (parseInt(user.uid, 10) + i * 100).toString();
            const newAccount = i === 0 ? user.account : `${user.account}_${i}`;
            
            // Dynamic ratio for tags
            let dynamicTags = [];
            let r = Math.random() * 100;
            if (i === 0) {
                // Keep the first 10 items exact to baseMockUsers to guarantee the initial page view has the exact ones
                dynamicTags = user.tags;
            } else {
                if (r < 75) {
                    dynamicTags = ["新註冊"];
                } else if (r < 90) {
                    dynamicTags = ["正常", "活躍"];
                } else if (r < 97) {
                    dynamicTags = ["大戶", "VIP 客戶"];
                } else {
                    dynamicTags = ["異常風險", "VIP 客戶"];
                }
            }

            mockUsers.push({
                ...user,
                uid: newUid,
                account: newAccount,
                tags: dynamicTags,
                nickname: user.nickname ? (i === 0 ? user.nickname : `${user.nickname}${i}`) : '',
                offlineDays: (user.offlineDays + i) % 15,
                other: index % 2 === 0 ? "未充值玩家" : "測試帳號",
                vip: index % 3 === 0 ? "钻石会员" : index % 3 === 1 ? "黄金会员" : "白银会员",
                level: index % 3 === 0 ? "VIP會員" : index % 3 === 1 ? "黃金會員" : "普通會員",
                email: `user${num}@example.com`,
                qq: `12345${num}`,
                wechat: `wx_${newAccount}`,
                zalo: `zalo_${newAccount}`,
                whatsapp: `+123456789${num % 10}`,
                telegram: `@tg_${newAccount}`,
                facebook: `fb_${newAccount}`,
                birthday: `199${num % 10}-0${(num % 9) + 1}-1${num % 9}`,
                withdrawAccounts: index % 2 === 0 ? [
                    { type: '銀行卡', account: '622202******1234', bank: '中國工商銀行 / CNY', address: '北京市朝陽區分行', status: '正常' },
                    { type: 'USDT (TRC20)', account: 'TXYZ******7890', bank: 'USDT / USDT', address: '-', status: '正常' }
                ] : [
                    { type: '銀行卡', account: '621700******5678', bank: '中國建設銀行 / CNY', address: '上海市浦東新區分行', status: '正常' }
                ],
                agentChangeRecords: (index + i) % 4 !== 0 ? [
                    { preAgent: 'd1', postAgent: 'aaaaaa1', operator: 'Wayne_test', time: '2026-08-11 09:25:24' },
                    { preAgent: 'd0', postAgent: 'd1', operator: 'admin', time: '2026-08-10 10:15:00' }
                ] : []
            });
        });
    }
    window.mockUsers = mockUsers;

    // Helper: Get active selections from multi-select
    function getMultiSelectValues(element) {
        if (!element) return [];
        const values = [];
        element.querySelectorAll('.select-options li.selected').forEach(li => {
            values.push(li.getAttribute('data-value'));
        });
        return values;
    }

    // Helper: Reset single select UI to specific value
    function setSingleSelectValue(element, val, text) {
        const selectedValSpan = element.querySelector('.selected-val');
        const optionsList = element.querySelector('.select-options');
        
        optionsList.querySelectorAll('li').forEach(li => {
            if (li.getAttribute('data-value') === val) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
        selectedValSpan.textContent = text;
    }

    // Helper: Clear multi select choices
    function clearMultiSelectValue(element) {
        const selectedValSpan = element.querySelector('.selected-val');
        const optionsList = element.querySelector('.select-options');
        
        optionsList.querySelectorAll('li').forEach(li => {
            li.classList.remove('selected');
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });
        selectedValSpan.textContent = '請選擇';
    }

    // Read form values and update Tags & Badge count
    function updateFilters() {
        const tagsContainer = document.getElementById('filterTagsContainer');
        const inputAccount = document.getElementById('inputAccount');
        
        if (!tagsContainer) return;
        
        const tags = [];
        let advancedCount = 0;

        // 1. Status
        if (selectedStatusVal) {
            tags.push({ key: 'status', label: `狀態: ${selectedStatusVal}`, type: 'single-custom', element: dropdownStatus, defaultValue: '', defaultText: '所有', valueVarSetter: (v) => selectedStatusVal = v });
        }
        // 2. Level
        if (selectedLevelVal) {
            tags.push({ key: 'level', label: `層級: ${selectedLevelVal}`, type: 'single-custom', element: dropdownLevel, defaultValue: '', defaultText: '全部', valueVarSetter: (v) => selectedLevelVal = v });
        }
        if (typeof selectedDeviceTypeVal !== 'undefined' && selectedDeviceTypeVal) {
            tags.push({ key: 'deviceType', label: `設備類型: ${selectedDeviceTypeVal}`, type: 'single-custom', element: dropdownDeviceType, defaultValue: '', defaultText: '全部設備類型', valueVarSetter: (v) => selectedDeviceTypeVal = v });
        }
        if (typeof selectedCountryVal !== 'undefined' && selectedCountryVal) {
            tags.push({ key: 'country', label: `國家: ${selectedCountryVal}`, type: 'single-custom', element: dropdownCountry, defaultValue: '', defaultText: '請選擇國家', valueVarSetter: (v) => selectedCountryVal = v });
        }
        // 3. VIP (Multiple Select)
        const selectedVips = getMultiSelectValues(dropdownVip);
        if (selectedVips.length > 0) {
            tags.push({ key: 'vip', label: `等級: ${selectedVips.join(', ')}`, type: 'multi-custom', element: dropdownVip });
        }
        // 4. Other
        const selectedOthers = getMultiSelectValues(dropdownOther);
        if (selectedOthers.length > 0) {
            tags.push({ key: 'other', label: `其他: ${selectedOthers.join(', ')}`, type: 'multi-custom', element: dropdownOther });
        }
        
        // 4.5 Tags Search
        const selectedTags = getMultiSelectValues(dropdownTagsSearch);
        if (selectedTags.length > 0) {
            tags.push({ key: 'tagsSearch', label: `標籤: ${selectedTags.join(', ')}`, type: 'multi-custom', element: dropdownTagsSearch });
        }
        // 5. Account
        if (inputAccount && inputAccount.value.trim()) {
            let labelPrefix = '帳號';
            if (currentAccountType === 'exact') labelPrefix = '帳號(精確)';
            if (currentAccountType === 'fuzzy') labelPrefix = '帳號(模糊)';
            if (currentAccountType === 'multi') labelPrefix = '帳號(多筆)';
            
            tags.push({ key: 'account', label: `${labelPrefix}: ${inputAccount.value.trim()}`, type: 'input', element: inputAccount });
        }

        // 6. Dynamic Filters
        const dynamicFilters = document.querySelectorAll('.dynamic-filter-tag');
        dynamicFilters.forEach((filter, index) => {
            const input = filter.querySelector('.dynamic-filter-input');
            const labelEl = filter.querySelector('.dynamic-filter-label');
            const val = input.value.trim();
            if (val) {
                const clone = labelEl.cloneNode(true);
                const badge = clone.querySelector('.type-badge');
                if (badge) badge.remove();
                const labelText = clone.textContent.trim();
                
                tags.push({
                    key: 'dynamic_' + index,
                    label: `${labelText}: ${val}`,
                    type: 'dynamic',
                    element: filter,
                    clearFunc: () => filter.remove()
                });
            }
        });
        
        // 6. Test Accounts Toggle
        if (filterTestAccountsToggle && filterTestAccountsToggle.checked) {
            tags.push({ key: 'filterTestAccounts', label: `過濾測試賬號`, type: 'checkbox', element: filterTestAccountsToggle });
        }

        // Advanced filter fields
        if (selectBirthday.value) {
            tags.push({ key: 'birthday', label: `生日: ${selectBirthday.value}`, type: 'native-select', element: selectBirthday });
            advancedCount++;
        }
        if (inputDateStart.value || inputDateEnd.value) {
            const startStr = inputDateStart.value ? inputDateStart.value.replace('T', ' ') : '??';
            const endStr = inputDateEnd.value ? inputDateEnd.value.replace('T', ' ') : '??';
            tags.push({ 
                key: 'dateRange', 
                label: `時間: ${startStr} ~ ${endStr}`, 
                type: 'inputs',
                elements: [inputDateStart, inputDateEnd] 
            });
            advancedCount++;
        }
        const inputAgentId = document.getElementById('inputAgentId');
        if (inputAgentId && inputAgentId.value.trim()) {
            tags.push({ key: 'agentId', label: `代理Id: ${inputAgentId.value.trim()}`, type: 'input', element: inputAgentId });
            advancedCount++;
        }
        const inputVipLevel = document.getElementById('inputVipLevel');
        if (inputVipLevel && inputVipLevel.value.trim()) {
            tags.push({ key: 'vipLevel', label: `VIP等級: ${inputVipLevel.value.trim()}`, type: 'input', element: inputVipLevel });
            advancedCount++;
        }
        if (inputQuickLogin.value.trim()) {
            tags.push({ key: 'quickLogin', label: `快速登入: ${inputQuickLogin.value.trim()}`, type: 'input', element: inputQuickLogin });
            advancedCount++;
        }
        if (inputUid.value.trim()) {
            tags.push({ key: 'uid', label: `UID: ${inputUid.value.trim()}`, type: 'input', element: inputUid });
            advancedCount++;
        }
        if (inputInviteCode.value.trim()) {
            tags.push({ key: 'inviteCode', label: `邀請碼: ${inputInviteCode.value.trim()}`, type: 'input', element: inputInviteCode });
            advancedCount++;
        }
        if (inputNickname.value.trim()) {
            tags.push({ key: 'nickname', label: `暱稱: ${inputNickname.value.trim()}`, type: 'input', element: inputNickname });
            advancedCount++;
        }
        if (inputRealName.value.trim()) {
            tags.push({ key: 'realName', label: `姓名: ${inputRealName.value.trim()}`, type: 'input', element: inputRealName });
            advancedCount++;
        }
        if (inputBankCard.value.trim()) {
            tags.push({ key: 'bankCard', label: `銀行卡末碼: *${inputBankCard.value.trim()}`, type: 'input', element: inputBankCard });
            advancedCount++;
        }
        if (inputOfflineDays.value.trim()) {
            tags.push({ key: 'offlineDays', label: `未登入天數 > ${inputOfflineDays.value.trim()}`, type: 'input', element: inputOfflineDays });
            advancedCount++;
        }
        if (inputIp.value.trim()) {
            tags.push({ key: 'ip', label: `IP: ${inputIp.value.trim()}`, type: 'input', element: inputIp });
            advancedCount++;
        }
        if (inputDeposit.value.trim()) {
            tags.push({ key: 'deposit', label: `存款 > $${inputDeposit.value.trim()}`, type: 'input', element: inputDeposit });
            advancedCount++;
        }

        // Outer fields processing
        const inputAgentIdOuter = document.getElementById('inputAgentIdOuter');
        if (inputAgentIdOuter && inputAgentIdOuter.value.trim()) {
            tags.push({ key: 'agentIdOuter', label: `代理Id: ${inputAgentIdOuter.value.trim()}`, type: 'input', element: inputAgentIdOuter });
        }
        const inputVipLevelOuter = document.getElementById('inputVipLevelOuter');
        if (inputVipLevelOuter && inputVipLevelOuter.value.trim()) {
            tags.push({ key: 'vipLevelOuter', label: `VIP等級: ${inputVipLevelOuter.value.trim()}`, type: 'input', element: inputVipLevelOuter });
        }
        if (selectedBirthdayOuterVal) {
            tags.push({ key: 'birthdayOuter', label: `生日: ${selectedBirthdayOuterVal}月`, type: 'single-custom', element: dropdownBirthdayOuter, defaultValue: '', defaultText: '全部', valueVarSetter: (v) => selectedBirthdayOuterVal = v });
        }
        if (inputDateStartOuter && inputDateEndOuter && (inputDateStartOuter.value || inputDateEndOuter.value)) {
            const startStr = inputDateStartOuter.value ? inputDateStartOuter.value.replace('T', ' ') : '??';
            const endStr = inputDateEndOuter.value ? inputDateEndOuter.value.replace('T', ' ') : '??';
            tags.push({ 
                key: 'dateRangeOuter', 
                label: `新增時間: ${startStr} ~ ${endStr}`, 
                type: 'inputs',
                elements: [inputDateStartOuter, inputDateEndOuter] 
            });
        }
        const inputPromoterAccount = document.getElementById('inputPromoterAccount');
        if (inputPromoterAccount && inputPromoterAccount.value.trim()) {
            tags.push({ key: 'promoterAccount', label: `推廣人帳號: ${inputPromoterAccount.value.trim()}`, type: 'input', element: inputPromoterAccount });
        }
        if (inputBankCardOuter && inputBankCardOuter.value.trim()) {
            tags.push({ key: 'bankCardOuter', label: `綁定銀行卡: ${inputBankCardOuter.value.trim()}`, type: 'input', element: inputBankCardOuter });
        }
        if (inputOfflineDaysOuter && inputOfflineDaysOuter.value.trim()) {
            tags.push({ key: 'offlineDaysOuter', label: `未登入天數 > ${inputOfflineDaysOuter.value.trim()}`, type: 'input', element: inputOfflineDaysOuter });
        }
        if (inputIpOuter && inputIpOuter.value.trim()) {
            tags.push({ key: 'ipOuter', label: `登入 IP: ${inputIpOuter.value.trim()}`, type: 'input', element: inputIpOuter });
        }
        if (inputDepositOuter && inputDepositOuter.value.trim()) {
            tags.push({ key: 'depositOuter', label: `存款大於 $${inputDepositOuter.value.trim()}`, type: 'input', element: inputDepositOuter });
        }

        // Render badge count
        advancedBadge.textContent = advancedCount;

        // Render tags
        filterTagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'filter-tag';
            div.textContent = tag.label + ' ';
            
            const closeIcon = document.createElement('i');
            closeIcon.className = 'ph ph-x';
            closeIcon.addEventListener('click', () => {
                // Clear the target fields
                if (tag.type === 'single-custom') {
                    setSingleSelectValue(tag.element, tag.defaultValue, tag.defaultText);
                    tag.valueVarSetter(tag.defaultValue);
                } else if (tag.type === 'multi-custom') {
                    clearMultiSelectValue(tag.element);
                } else if (tag.type === 'inputs') {
                    tag.elements.forEach(el => el.value = '');
                } else if (tag.type === 'native-select') {
                    tag.element.value = '';
                } else if (tag.type === 'checkbox') {
                    tag.element.checked = false;
                } else {
                    tag.element.value = '';
                }
                currentPage = 1;
                updateFilters();
                renderTable();
            });
            
            div.appendChild(closeIcon);
            filterTagsContainer.appendChild(div);
        });
    }

    // Reset all filters
    function clearAllFilters() {
        setSingleSelectValue(dropdownStatus, '', '所有');
        selectedStatusVal = '';
        
        if (filterTestAccountsToggle) filterTestAccountsToggle.checked = false;
        
        setSingleSelectValue(dropdownLevel, '', '全部');
        selectedLevelVal = '';

        clearMultiSelectValue(dropdownVip);
        clearMultiSelectValue(dropdownOther);
        clearMultiSelectValue(dropdownTagsSearch);
        
        const inputAccount = document.getElementById('inputAccount');
        if (inputAccount) inputAccount.value = '';
        // Reset advanced
        const inputAgentId = document.getElementById('inputAgentId');
        if (inputAgentId) inputAgentId.value = '';
        const inputVipLevel = document.getElementById('inputVipLevel');
        if (inputVipLevel) inputVipLevel.value = '';
        selectBirthday.value = '';
        inputDateStart.value = '';
        inputDateEnd.value = '';
        inputQuickLogin.value = '';
        inputUid.value = '';
        inputInviteCode.value = '';
        inputNickname.value = '';
        inputRealName.value = '';
        inputBankCard.value = '';
        inputOfflineDays.value = '';
        inputIp.value = '';
        inputDeposit.value = '';

        // Reset outer fields
        const inputAgentIdOuter = document.getElementById('inputAgentIdOuter');
        if (inputAgentIdOuter) inputAgentIdOuter.value = '';
        const inputVipLevelOuter = document.getElementById('inputVipLevelOuter');
        if (inputVipLevelOuter) inputVipLevelOuter.value = '';
        
        if (dropdownBirthdayOuter) {
            setSingleSelectValue(dropdownBirthdayOuter, '', '全部');
            selectedBirthdayOuterVal = '';
        }
        if (inputDateStartOuter) inputDateStartOuter.value = '';
        if (inputDateEndOuter) inputDateEndOuter.value = '';
        if (inputBankCardOuter) inputBankCardOuter.value = '';
        if (inputOfflineDaysOuter) inputOfflineDaysOuter.value = '';
        if (inputIpOuter) inputIpOuter.value = '';
        if (inputDepositOuter) inputDepositOuter.value = '';

        currentPage = 1;
        updateFilters();
        renderTable();
    }

    if (btnClearAll) btnClearAll.addEventListener('click', clearAllFilters);
    if (btnReset) btnReset.addEventListener('click', clearAllFilters);
    if (btnClearDrawer) btnClearDrawer.addEventListener('click', () => {
        // Only clear advanced fields
        selectBirthday.value = '';
        inputDateStart.value = '';
        inputDateEnd.value = '';
        inputQuickLogin.value = '';
        inputUid.value = '';
        inputInviteCode.value = '';
        inputNickname.value = '';
        inputRealName.value = '';
        inputBankCard.value = '';
        inputOfflineDays.value = '';
        inputIp.value = '';
        inputDeposit.value = '';
        
        currentPage = 1;
        updateFilters();
        renderTable();
    });

    window.openUserDetailsDrawer = function(uid) {
        const userDetailsDrawer = document.getElementById('userDetailsDrawer');
        if (!userDetailsDrawer) return;
        const user = mockUsers.find(u => u.uid === uid) || mockUsers[0];
        
        const getAuditButtons = (isAudited, field = '') => {
            const resetBtn = hasPerm(27) ? `<button class="btn btn-sm btn-outline btn-warning" onclick="handleResetAction(this, '${uid}', '${field}')" style="padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-left: 8px; cursor: pointer; border: 1px solid #f59e0b; color: #f59e0b; background: transparent;">重置</button>` : '';
            return `<span class="audit-buttons-container" style="display: flex; align-items: center; justify-content: center;">
                ${isAudited ? 
                    `<span style="color: #64748b; font-size: 12px;">已審核</span>` :
                    `<button class="btn btn-sm" onclick="handleAuditAction(this, '已通過審核')" style="padding: 2px 8px; font-size: 12px; background: transparent; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 4px; margin-right: 8px; cursor: pointer;">通過</button>
                     <button class="btn btn-sm" onclick="handleAuditAction(this, '已拒絕審核')" style="padding: 2px 8px; font-size: 12px; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; cursor: pointer;">拒絕</button>`
                }
                ${resetBtn}
            </span>`;
        };

        // Header
        const avatar = document.getElementById('detailsHeaderAvatar');
        if (avatar) avatar.textContent = user.account.charAt(0).toUpperCase();
        
        const accountSpan = document.getElementById('detailsHeaderAccount');
        if (accountSpan) accountSpan.textContent = user.account;
        
        const typeSpan = document.getElementById('detailsHeaderUserType');
        if (typeSpan) typeSpan.textContent = user.userType || '代理會員';
        
        const levelSpan = document.getElementById('detailsHeaderUserLevel');
        if (levelSpan) levelSpan.textContent = user.level || '普通會員';
        
        const statusBadge = document.getElementById('detailsHeaderStatusBadge');
        if (statusBadge) {
            if (user.status === '正常') {
                statusBadge.style.backgroundColor = '#dcfce7';
                statusBadge.style.color = '#16a34a';
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #16a34a;"></div>目前狀態：正常`;
            } else if (user.status === '停用') {
                statusBadge.style.backgroundColor = '#fee2e2';
                statusBadge.style.color = '#dc2626';
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #dc2626;"></div>目前狀態：停用`;
            } else {
                statusBadge.style.backgroundColor = '#fef3c7';
                statusBadge.style.color = '#d97706';
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #d97706;"></div>目前狀態：${user.status}`;
            }
        }
        
        // Tab 1: 會員信息
        
        // 1. 基本資料
        const setHtml = (id, val, isLink = false) => {
            const el = document.getElementById(id);
            if (el) {
                if (val === undefined || val === null || val === '') {
                    el.innerHTML = '-';
                } else {
                    el.innerHTML = val;
                }
            }
        };

        const viewAvatarIcon = document.getElementById('viewAvatarIcon');
        if (viewAvatarIcon) {
            viewAvatarIcon.className = 'ph ph-user';
            // Custom avatar logic can go here
        }

        setHtml('viewNickname', (user.nickname && user.nickname !== '-') ? user.nickname : renderDataState(user.account));
        setHtml('viewAccount', user.account);
        setHtml('viewRealName', hasPerm(37) ? (user.realName && user.realName !== '-' ? user.realName : '-') : window.maskRealName(user.realName));
        setHtml('viewBirthday', user.birthday || '1995-08-18');

        // 2. 聯絡與地址資訊
        setHtml('viewPhoneCode', user.phoneCode || '+55');
        setHtml('viewPhone', hasPerm(85) ? (user.phone !== '未驗證' && user.phone !== '末綁定' && user.phone !== '-' ? user.phone : (user.phone || '-')) : window.maskPhone(user.phone));
        setHtml('viewEmail', hasPerm(86) ? (user.email || `${user.account}@example.com`) : window.maskEmail(user.email || `${user.account}@example.com`));
        setHtml('viewAddress', user.address || '-');
        setHtml('viewProvince', user.province || '-');
        setHtml('viewCity', user.city || '-');
        setHtml('viewZipcode', user.zipcode || '-');

        // 3. 社群與通訊軟體
        setHtml('viewQQ', hasPerm(87) ? (user.qq || '88392019') : window.maskMiddle(user.qq || '88392019'));
        setHtml('viewWechat', hasPerm(88) ? (user.wechat || `wx_${user.account}`) : window.maskMiddle(user.wechat || `wx_${user.account}`));
        
        const zVal = user.zalo || (user.phone !== '-' ? `+84${user.phone.substring(2)}` : '-');
        setHtml('viewZalo', hasPerm(89) ? zVal : window.maskMiddle(zVal));
        
        const fbVal = user.facebook || `fb.me/${user.account}`;
        setHtml('viewFacebook', hasPerm(90) ? fbVal : window.maskMiddle(fbVal));
        
        const wVal = user.whatsapp || (user.phone !== '-' ? `+84${user.phone.substring(2)}` : '-');
        setHtml('viewWhatsapp', hasPerm(91) ? wVal : window.maskMiddle(wVal));
        
        const tgVal = user.telegram || `@${user.account}_tg`;
        setHtml('viewTelegram', hasPerm(92) ? tgVal : window.maskMiddle(tgVal));

        // 4. 備註資訊
        setHtml('viewRemark', user.remark && user.remark !== '-' ? user.remark : '暫無備註');
        setHtml('viewReturnRemark', user.returnRemark || '暫無回訪備註');


        
        // Tab 2: 提現信息
        const withdrawTbody = document.getElementById('viewWithdrawTableBody');
        const emptyDiv = document.getElementById('viewWithdrawEmpty');
        if (withdrawTbody && emptyDiv) {
            if (user.withdrawAccounts && user.withdrawAccounts.length > 0) {
                emptyDiv.style.display = 'none';
                withdrawTbody.innerHTML = user.withdrawAccounts.map(acc => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 16px; color: #475569;">${acc.type}</td>
                        <td style="padding: 16px; font-family: monospace; color: #334155;">${acc.account}</td>
                        <td style="padding: 16px; color: #475569;">${acc.bank}</td>
                        <td style="padding: 16px; color: #475569;">${acc.address || '-'}</td>
                    </tr>
                `).join('');
            } else {
                emptyDiv.style.display = 'block';
                withdrawTbody.innerHTML = '';
            }
        }

        // Tab 3: 登入與註冊紀錄
        // Login Data
        setHtml('viewLoginIp', `54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i>`);
        setHtml('viewLoginTime', '2026-07-28 16:30:42');
        setHtml('viewLoginDevice', `ee5868d85af7f68cf088a6780ff8882a <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i>`);
        setHtml('viewLoginIpCount', '4,703');
        setHtml('viewLoginDeviceCount', '28');

        // Reg Data
        setHtml('viewRegIp', `54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i>`);
        setHtml('viewRegTime', '-');
        setHtml('viewRegDevice', `ee5868d85af7f68cf088a6780ff8882a <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i>`);
        setHtml('viewRegIpCount', '3,412');
        setHtml('viewRegDeviceCount', '18');

        // Default open the first tab
        const basicTabBtn = document.querySelector('.user-details-tab-item[data-target="detailsBasic"]');
        if (basicTabBtn) basicTabBtn.click();

        userDetailsDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
    };

    
    window.openDetailedContentDrawer = function(e, type) {
        e.preventDefault();
        const userDetailsDrawer = document.getElementById('userDetailsDrawer');
        const expandPanel = document.getElementById('detailsExpandPanel');
        const contentDiv = document.getElementById('detailsExpandContent');
        
        if (!userDetailsDrawer || !expandPanel || !contentDiv) return;
        
        // Expand width
        userDetailsDrawer.style.maxWidth = '100vw'; // allow full width on small screens
        userDetailsDrawer.style.width = '1660px'; // 960 + 700
        expandPanel.style.display = 'flex';
        
        // Render table
        if (type === 'ip' || type === 'reg_ip') {
            const isReg = type === 'reg_ip';
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">${isReg ? '註冊用戶' : '登錄用戶'}</th>
                            <th style="padding: 12px 16px; font-weight: 600;">${isReg ? '註冊時間' : '最後登錄詳情'}</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP信息</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['megan002', 'player_888', 'vip_king99', 'lucky_star7', 'test_user_01', 'dragon_99', 'win_master'].map((u, i) => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 16px;">${u}</td>
                                <td style="padding: 16px; font-family: monospace;">2026-07-28<br>${String(16 - i).padStart(2, '0')}:${String(30 - i*2).padStart(2, '0')}:${String(42 + i*3).padStart(2, '0')}</td>
                                <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                                <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo,<br>Tokyo</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (type === 'device' || type === 'reg_device') {
            const isReg = type === 'reg_device';
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">${isReg ? '註冊用戶' : '登錄用戶'}</th>
                            <th style="padding: 12px 16px; font-weight: 600;">${isReg ? '註冊時間' : '最後登錄詳情'}</th>
                            <th style="padding: 12px 16px; font-weight: 600;">設備號</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['megan002', 'player_888', 'test_user_01', 'win_master'].map((u, i) => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 16px;">${u}</td>
                                <td style="padding: 16px; font-family: monospace;">2026-07-28<br>${String(16 - i).padStart(2, '0')}:${String(30 - i*2).padStart(2, '0')}:${String(42 + i*3).padStart(2, '0')}</td>
                                <td style="padding: 16px; font-family: monospace; color: #475569; word-break: break-all;">ee5868d85af7f68cf088a6780ff8882a <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (false) {
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">登錄用戶</th>
                            <th style="padding: 12px 16px; font-weight: 600;">最後登錄詳情</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP信息</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['megan002', 'player_888', 'vip_king99', 'lucky_star7', 'test_user_01', 'dragon_99', 'win_master'].map((u, i) => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 16px;">${u}</td>
                                <td style="padding: 16px; font-family: monospace;">2026-07-28<br>${String(16 - i).padStart(2, '0')}:${String(30 - i*2).padStart(2, '0')}:${String(42 + i*3).padStart(2, '0')}</td>
                                <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                                <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo,<br>Tokyo</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (type === 'device') {
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">登錄用戶</th>
                            <th style="padding: 12px 16px; font-weight: 600;">註冊時間</th>
                            <th style="padding: 12px 16px; font-weight: 600;">設備號</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP信息</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">megan002</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10<br>10:12:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo,<br>Tokyo</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">sub_acc_01</td>
                            <td style="padding: 16px; font-family: monospace;">2026-06-12<br>09:15:30</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Osaka</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">sub_acc_02</td>
                            <td style="padding: 16px; font-family: monospace;">2026-06-18<br>11:04:12</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">sub_acc_03</td>
                            <td style="padding: 16px; font-family: monospace;">2026-07-01<br>16:45:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan,<br>Yokohama</td>
                        </tr>
                    </tbody>
                </table>
            `;
        } else if (type === 'reg_ip') {
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">登錄</th>
                            <th style="padding: 12px 16px; font-weight: 600;">註冊時間</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">megan002</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10 10:12:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">reg_bot_01</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10 10:14:20</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">reg_bot_02</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10 10:15:11</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">user_japan_1</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-09 18:30:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                        </tr>
                    </tbody>
                </table>
            `;
        } else if (type === 'reg_device') {
            contentDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px 16px; font-weight: 600;">登錄</th>
                            <th style="padding: 12px 16px; font-weight: 600;">註冊時間</th>
                            <th style="padding: 12px 16px; font-weight: 600;">設備號</th>
                            <th style="padding: 12px 16px; font-weight: 600;">IP信息</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">megan002</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10<br>10:12:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> 日本東京都<br>東京</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">clone_device_01</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10<br>10:20:00</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> 日本東京都<br>東京</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">clone_device_02</td>
                            <td style="padding: 16px; font-family: monospace;">2026-05-10<br>10:22:45</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">ee5868d85af7f68cf088a... <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> 日本東京都<br>東京</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    };

    const btnDetailsExpandClose = document.getElementById('btnDetailsExpandClose');
    if (btnDetailsExpandClose) {
        btnDetailsExpandClose.addEventListener('click', () => {
            const userDetailsDrawer = document.getElementById('userDetailsDrawer');
            const expandPanel = document.getElementById('detailsExpandPanel');
            if (userDetailsDrawer) userDetailsDrawer.style.width = '960px';
            if (expandPanel) {
                setTimeout(() => { 
                    expandPanel.style.display = 'none'; 
                    userDetailsDrawer.style.maxWidth = '90vw';
                }, 300);
            }
            
            const rowIp = document.getElementById('rowIpLoginCount');
            const rowDevice = document.getElementById('rowDeviceLoginCount');
            const btnIp = document.getElementById('btnIpExpand');
            const btnDevice = document.getElementById('btnDeviceExpand');
            const hintIp = document.getElementById('hintIpExpand');
            const hintDevice = document.getElementById('hintDeviceExpand');
            if (rowIp) { rowIp.style.background = 'transparent'; rowIp.style.borderColor = 'transparent'; }
            if (rowDevice) { rowDevice.style.background = 'transparent'; rowDevice.style.borderColor = 'transparent'; }
            if (btnIp) btnIp.style.display = 'none';
            if (btnDevice) btnDevice.style.display = 'none';
            if (hintIp) hintIp.style.display = 'block';
            if (hintDevice) hintDevice.style.display = 'block';
        });
    }

    // When the user details drawer is closed entirely, we should also reset the width
    const btnUserDetailsCloseOrig = document.getElementById('btnUserDetailsClose');
    if (btnUserDetailsCloseOrig) {
        btnUserDetailsCloseOrig.addEventListener('click', () => {
             const userDetailsDrawer = document.getElementById('userDetailsDrawer');
             const expandPanel = document.getElementById('detailsExpandPanel');
             if (userDetailsDrawer) {
                 userDetailsDrawer.classList.remove('active');
                 // Reset after animation
                 setTimeout(() => {
                     userDetailsDrawer.style.width = '960px';
                     if (expandPanel) expandPanel.style.display = 'none';
                 }, 300);
             }
        });
    }


    window.openAgentChangeRecordDrawer = function(uid) {
        const agentChangeRecordDrawer = document.getElementById('agentChangeRecordDrawer');
        if (!agentChangeRecordDrawer) return;
        
        let recordsHtml = '';
        if (uid) {
            const user = mockUsers.find(u => u.uid === uid);
            if (user && user.agentChangeRecords && user.agentChangeRecords.length > 0) {
                recordsHtml = `
                <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--card-bg);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); background-color: var(--bg-color); color: var(--text-secondary);">
                                <th style="padding: 16px 12px; font-weight: 500; white-space: nowrap;">變更前代理</th>
                                <th style="padding: 16px 12px; font-weight: 500; white-space: nowrap;">變更後代理</th>
                                <th style="padding: 16px 12px; font-weight: 500; white-space: nowrap;">操作者</th>
                                <th style="padding: 16px 12px; font-weight: 500; white-space: nowrap;">操作時間</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${user.agentChangeRecords.map(record => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 16px 12px; white-space: nowrap;">
                                    <span style="background-color: rgba(128, 128, 128, 0.15); color: var(--text-color); padding: 4px 8px; border-radius: 6px; font-size: 13px; font-family: monospace;">${record.preAgent}</span>
                                </td>
                                <td style="padding: 16px 12px; white-space: nowrap;">
                                    <span style="background-color: rgba(128, 128, 128, 0.15); color: var(--text-color); padding: 4px 8px; border-radius: 6px; font-size: 13px; font-family: monospace;">${record.postAgent}</span>
                                </td>
                                <td style="padding: 16px 12px; white-space: nowrap;">
                                    <span style="background-color: rgba(128, 128, 128, 0.15); color: var(--text-color); padding: 4px 8px; border-radius: 6px; font-size: 13px; font-family: monospace;">${record.operator}</span>
                                </td>
                                <td style="padding: 16px 12px; white-space: nowrap;">
                                    <span style="background-color: rgba(128, 128, 128, 0.15); color: var(--text-color); padding: 4px 8px; border-radius: 6px; font-size: 13px; font-family: monospace;">${record.time}</span>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            } else {
                recordsHtml = '<div style="text-align: center; color: var(--text-muted); padding-top: 100px;">無變更紀錄</div>';
            }
        } else {
            recordsHtml = '<div style="text-align: center; color: var(--text-muted); padding-top: 100px;">無變更紀錄</div>';
        }
        
        const drawerContent = agentChangeRecordDrawer.querySelector('.drawer-content');
        if (drawerContent) {
            drawerContent.innerHTML = recordsHtml;
        }

        agentChangeRecordDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
    };

    // Render Table Data & Headers
    function renderTable() {
        window.renderTable = renderTable;
        if (!userTableBody) return;
        const selectedVips = getMultiSelectValues(dropdownVip);
        const selectedOthers = getMultiSelectValues(dropdownOther);
        const inputAccount = document.getElementById('inputAccount');
        const accountVal = inputAccount ? inputAccount.value.trim().toLowerCase() : '';

        // Advanced filter values
        const selectBirthdayOuter = document.getElementById('selectBirthdayOuter');
        const inputDateStartOuter = document.getElementById('inputDateStartOuter');
        const inputDateEndOuter = document.getElementById('inputDateEndOuter');
        const inputBankCardOuter = document.getElementById('inputBankCardOuter');
        const inputOfflineDaysOuter = document.getElementById('inputOfflineDaysOuter');
        const inputIpOuter = document.getElementById('inputIpOuter');
        const inputDepositOuter = document.getElementById('inputDepositOuter');

        const birthdayVal = (selectBirthday ? selectBirthday.value : '') || (selectBirthdayOuter ? selectBirthdayOuter.value : '');
        const dateStartVal = (inputDateStart ? inputDateStart.value : '') || (inputDateStartOuter ? inputDateStartOuter.value : '');
        const dateEndVal = (inputDateEnd ? inputDateEnd.value : '') || (inputDateEndOuter ? inputDateEndOuter.value : '');
        const quickLoginVal = inputQuickLogin ? inputQuickLogin.value.trim() : '';
        const uidVal = inputUid ? inputUid.value.trim() : '';
        const inviteCodeVal = inputInviteCode ? inputInviteCode.value.trim() : '';
        const nicknameVal = inputNickname ? inputNickname.value.trim().toLowerCase() : '';
        const realNameVal = inputRealName ? inputRealName.value.trim() : '';
        const inputAgentIdOuter = document.getElementById('inputAgentIdOuter');
        const inputAgentId = document.getElementById('inputAgentId');
        const agentIdVal = (inputAgentId ? inputAgentId.value.trim() : '') || (inputAgentIdOuter ? inputAgentIdOuter.value.trim() : '');
        const inputVipLevelOuter = document.getElementById('inputVipLevelOuter');
        const inputVipLevel = document.getElementById('inputVipLevel');
        const vipLevelVal = (inputVipLevel ? inputVipLevel.value.trim() : '') || (inputVipLevelOuter ? inputVipLevelOuter.value.trim() : '');
        const bankCardVal = inputBankCard ? inputBankCard.value.trim() : '';
        const offlineDaysVal = inputOfflineDays && inputOfflineDays.value.trim() !== '' ? parseInt(inputOfflineDays.value.trim(), 10) : NaN;
        const ipVal = inputIp ? inputIp.value.trim() : '';
        const depositVal = inputDeposit && inputDeposit.value.trim() !== '' ? parseFloat(inputDeposit.value.trim()) : NaN;

        // Perform Filtering
        const filtered = mockUsers.filter(user => {
            if (selectedStatusVal && user.status !== selectedStatusVal) return false;
            if (selectedLevelVal && user.level !== selectedLevelVal) return false;
            if (selectedVips.length > 0 && !selectedVips.includes(user.vip)) return false;
            if (selectedOthers.length > 0 && !selectedOthers.includes(user.other)) return false;
            
            // Account filter
            if (accountVal) {
                if (currentAccountType === 'exact') {
                    if (user.account.toLowerCase() !== accountVal) return false;
                } else if (currentAccountType === 'fuzzy') {
                    if (!user.account.toLowerCase().includes(accountVal)) return false;
                } else if (currentAccountType === 'multi') {
                    const accounts = accountVal.split(';').map(a => a.trim()).filter(Boolean);
                    if (accounts.length > 0 && !accounts.some(acc => user.account.toLowerCase() === acc)) return false;
                } else if (currentAccountType === 'quickLogin') {
                    if (!user.quickLogin || !user.quickLogin.toLowerCase().includes(accountVal)) return false;
                } else if (currentAccountType === 'uid') {
                    if (!user.uid || !user.uid.toLowerCase().includes(accountVal)) return false;
                } else if (currentAccountType === 'inviteCode') {
                    if (!user.inviteCode || !user.inviteCode.toLowerCase().includes(accountVal)) return false;
                } else if (currentAccountType === 'nickname') {
                    if (!user.nickname || !user.nickname.toLowerCase().includes(accountVal)) return false;
                } else if (currentAccountType === 'realName') {
                    if (!user.realName || !user.realName.toLowerCase().includes(accountVal)) return false;
                } else {
                    if (user[currentAccountType] && !user[currentAccountType].toLowerCase().includes(accountVal)) return false;
                }
            }

            // Advanced Filters
            const formattedDateStart = dateStartVal ? dateStartVal.replace('T', ' ') : '';
            const formattedDateEnd = dateEndVal ? dateEndVal.replace('T', ' ') : '';
            if (birthdayVal && user.birthday !== birthdayVal) return false;
            if (formattedDateStart && user.date < formattedDateStart) return false;
            if (formattedDateEnd && user.date > formattedDateEnd) return false;
            if (quickLoginVal && user.quickLogin !== quickLoginVal) return false;
            if (uidVal && user.uid !== uidVal) return false;
            if (inviteCodeVal && user.inviteCode !== inviteCodeVal) return false;
            if (nicknameVal && !user.nickname.toLowerCase().includes(nicknameVal)) return false;
            if (realNameVal && !user.realName.includes(realNameVal)) return false;
            if (agentIdVal && user.agentId !== agentIdVal) return false;
            if (vipLevelVal && user.vipLevel !== undefined && user.vipLevel.toString() !== vipLevelVal) return false;
            if (bankCardVal && !user.bankCard.includes(bankCardVal)) return false;
            if (!isNaN(offlineDaysVal) && user.offlineDays <= offlineDaysVal) return false;
            if (ipVal && !user.ip.includes(ipVal)) return false;
            if (!isNaN(depositVal) && user.deposit <= depositVal) return false;

            return true;
        });

        // Sorting Logic
        if (currentSortColumn) {
            filtered.sort((a, b) => {
                let valA = a[currentSortColumn];
                let valB = b[currentSortColumn];
                
                // Handle numeric conversion for arrears (e.g. "-" or numbers)
                if (currentSortColumn === 'arrears') {
                    valA = valA === '-' ? 0 : parseFloat(valA) || 0;
                    valB = valB === '-' ? 0 : parseFloat(valB) || 0;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    // Try to parse as numbers if possible
                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        valA = numA;
                        valB = numB;
                    }
                }

                if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Calculate Pagination Slicing
        const totalCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);
        const pagedUsers = filtered.slice(startIndex, endIndex);

        // Update Total Count & Pagination Controls
        const totalCountSpan = document.getElementById('totalCount');
        if (totalCountSpan) totalCountSpan.textContent = totalCount;

        if (btnPrevPage) btnPrevPage.disabled = (currentPage === 1);
        if (btnNextPage) btnNextPage.disabled = (currentPage === totalPages || totalPages === 0);
        if (inputJumpPage) {
            inputJumpPage.value = currentPage;
            inputJumpPage.max = totalPages;
        }

        // Render Page Numbers (Compact mode)
        if (pageNumbersList) {
            pageNumbersList.textContent = `${currentPage} / ${totalPages}`;
        }

        // Helper for Sort Icons
        function getSortBtn(col) {
            const isActive = currentSortColumn === col;
            const isAsc = isActive && currentSortDirection === 'asc';
            const isDesc = isActive && currentSortDirection === 'desc';
            return `<button type="button" class="sort-btn ${isAsc ? 'active-asc' : ''} ${isDesc ? 'active-desc' : ''}" data-sort="${col}">
                <i class="ph-fill ph-caret-${isDesc ? 'down' : 'up'}"></i>
            </button>`;
        }

        // Render Table Headers according to Table Mode
        if (userTableHeader) {
            if (currentTableMode === 'nested') {
                let nestedHeaderHtml = `<th width="40" style="text-align: center;"><input type="checkbox" id="selectAllCheckbox"></th>`;
                nestedColumnsConfig.forEach(col => {
                    let canShow = true;
                    if (col.id === 'depositWithdraw' && !hasPerm(7)) canShow = false;
                    if (col.id === 'remark' && !hasPerm(21)) canShow = false;
                    
                    if (nestedColumnVisibility[col.id] && canShow) {
                        nestedHeaderHtml += `<th>${col.label}</th>`;
                    }
                });
                nestedHeaderHtml += `<th style="text-align: center; width: 1%; white-space: nowrap; padding-right: 16px;">
                    <button type="button" class="btn-custom-columns-header btn-header-columns-toggle" title="自訂欄位">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                            <rect x="9" y="3" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </button>
                </th>`;
                userTableHeader.innerHTML = `<tr class="header-group-row">${nestedHeaderHtml}</tr>`;
            } else {
                // Compact Mode: 2-tier Headers with dynamic groups and pinning
                const pinned = [];
                const unpinned = [];
                
                const visibleColumnsConfig = compactColumnsConfig.filter(col => compactColumnVisibility[col.id] && (!col.requirePerm || hasPerm(col.requirePerm)));
                
                visibleColumnsConfig.forEach(col => {
                    if (pinnedColumnIds.includes(col.id)) {
                        pinned.push(col);
                    } else {
                        unpinned.push(col);
                    }
                });

                let groupRowHtml = `<th class="header-group sticky-col sticky-col-1" rowspan="2" width="40" style="left:0; z-index:12;"><input type="checkbox" id="selectAllCheckboxCompact"></th>`;
                let subRowHtml = ``;

                let currentLeft = 40; // Starts after checkbox

                // Pinned headers span both rows (rowspan="2")
                pinned.forEach(col => {
                    groupRowHtml += `<th class="header-group sticky-col" rowspan="2" style="left:${currentLeft}px; min-width:110px; z-index:12;" data-col="${col.id}">
                        <div style="display:flex;align-items:center;white-space:nowrap;justify-content:space-between;">
                            <div style="display:flex;align-items:center;">
                                <span>${col.label}</span>
                                ${col.sortable ? getSortBtn(col.id) : ''}
                            </div>
                            <i class="ph ph-push-pin icon-pin active" data-id="${col.id}" title="取消釘選"></i>
                        </div>
                    </th>`;
                    currentLeft += 110;
                });

                // Action header (fixed on the right) with Image 2 Icon
                const actionCol = visibleColumnsConfig.find(col => col.id === 'action');
                let actionHeaderHtml = '';
                if (actionCol) {
                    actionHeaderHtml = `<th class="header-group sticky-col-right" rowspan="2" data-col="action" style="min-width: 60px; z-index:12;">
                        <div style="display:flex;align-items:center;white-space:nowrap;justify-content:center;">
                            <button type="button" class="btn-custom-columns-header btn-header-columns-toggle" title="自訂欄位">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <rect x="3" y="3" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                    <rect x="9" y="3" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                            </button>
                        </div>
                    </th>`;
                }

                // Unpinned headers grouped sequentially
                let currentGroup = '';
                let groupColSpan = 0;
                
                const unpinnedWithoutAction = unpinned.filter(col => col.id !== 'action');
                unpinnedWithoutAction.forEach(col => {
                    if (col.group !== currentGroup) {
                        if (currentGroup !== '') {
                            groupRowHtml += `<th class="header-group" colspan="${groupColSpan}">${currentGroup}</th>`;
                        }
                        currentGroup = col.group;
                        groupColSpan = 1;
                    } else {
                        groupColSpan++;
                    }

                    subRowHtml += `<th class="header-sub" data-col="${col.id}">
                        <div style="display:flex;align-items:center;white-space:nowrap;justify-content:space-between;">
                            <div style="display:flex;align-items:center;">
                                <span>${col.label}</span>
                                ${col.sortable ? getSortBtn(col.id) : ''}
                            </div>
                            <i class="ph ph-push-pin icon-pin" data-id="${col.id}" title="釘選欄位"></i>
                        </div>
                    </th>`;
                });

                if (currentGroup !== '') {
                    groupRowHtml += `<th class="header-group" colspan="${groupColSpan}">${currentGroup}</th>`;
                }

                if (actionHeaderHtml) {
                    groupRowHtml += actionHeaderHtml;
                }

                userTableHeader.innerHTML = `
                    <tr class="header-group-row">${groupRowHtml}</tr>
                    <tr class="header-sub-row">${subRowHtml}</tr>
                `;
            }
        }

        // Render Table Body
        // Render Table Body Loading State (Skeleton)
        let skeletonHtml = '';
        const skeletonRowsCount = Math.min(pageSize, 10);
        
        for (let i = 0; i < skeletonRowsCount; i++) {
            if (currentTableMode === 'nested') {
                skeletonHtml += `<tr>`;
                skeletonHtml += `<td style="text-align: center; padding: 16px 8px;"><div class="skeleton-box skeleton-text-short" style="height: 14px; margin: 0 auto; display: block; max-width: 20px;"></div></td>`;
                if (nestedColumnVisibility['online']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-short" style="margin:0 auto; display: block;"></div></td>`;
                if (nestedColumnVisibility['avatar']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-avatar"></div></td>`;
                if (nestedColumnVisibility['memberInfo']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['levelTeam']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['creditLimit']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['depositWithdraw']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['tags']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['status']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-short" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['dateInfo']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                if (nestedColumnVisibility['remark']) skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; display: block;"></div><div class="skeleton-box skeleton-text-long" style="display: block;"></div></td>`;
                skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box skeleton-text-medium" style="margin-bottom:8px; margin: 0 auto; display: block;"></div><div class="skeleton-box skeleton-text-short" style="margin: 0 auto; display: block;"></div></td>`;
                skeletonHtml += `</tr>`;
            } else {
                skeletonHtml += `<tr>`;
                const visibleColumnsConfig = compactColumnsConfig.filter(col => compactColumnVisibility[col.id]);
                skeletonHtml += `<td class="sticky-col sticky-col-1" style="left:0; padding: 16px 8px;"><div class="skeleton-box skeleton-text-short" style="height: 14px; margin: 0 auto; display: block; max-width: 20px;"></div></td>`;
                let currentLeft = 40;
                
                visibleColumnsConfig.forEach((col, idx) => {
                     let w = (idx % 2 === 0) ? 'skeleton-text-medium' : 'skeleton-text-long';
                     let isPinned = pinnedColumnIds.includes(col.id);
                     if (isPinned) {
                         skeletonHtml += `<td class="sticky-col" style="left:${currentLeft}px; min-width:110px; padding: 16px 8px;"><div class="skeleton-box ${w}" style="display: block;"></div></td>`;
                         currentLeft += 110;
                     } else {
                         skeletonHtml += `<td style="padding: 16px 8px;"><div class="skeleton-box ${w}" style="display: block;"></div></td>`;
                     }
                });
                skeletonHtml += `</tr>`;
            }
        }
        userTableBody.innerHTML = skeletonHtml;

        if (window.renderTableTimeout) clearTimeout(window.renderTableTimeout);
        window.renderTableTimeout = setTimeout(() => {
            userTableBody.innerHTML = '';
            if (pagedUsers.length === 0) {
                userTableBody.innerHTML = `<tr><td colspan="${colspanForLoading}" style="text-align: center; color: var(--text-muted); padding: 32px 0;">無符合篩選條件的會員資料</td></tr>`;
                applyColumnVisibility();
                return;
            }

            pagedUsers.forEach(user => {
            const tr = document.createElement('tr');
            


            if (currentTableMode === 'nested') {
                // Nested Mode Layout
                let nestedRowHtml = `<td style="text-align: center;"><input type="checkbox" class="user-checkbox"></td>`;

                if (nestedColumnVisibility['online']) {
                    const isOnline = user.offlineDays === 0;
                    const isDisabled = user.status === '停用' || user.status === '冻结';
                    
                    const badgeBg = isOnline ? '#dcfce7' : '#f1f5f9';
                    const badgeColor = isOnline ? '#16a34a' : '#64748b';
                    const dotColor = isOnline ? '#10b981' : '#9ca3af';
                    
                    const statusBadge = `
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: ${badgeBg}; padding: 2px 10px; border-radius: 12px;">
                            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span>
                            <span style="color: ${badgeColor}; font-size: 12px; font-weight: 500;">${isOnline ? '在线' : '离线'}</span>
                        </div>
                    `;
                    
                    let actionsHtml = '';
                    if (!isDisabled) {
                        actionsHtml += `<a href="#" class="op-link btn-action-disable" style="font-size: 12px; padding: 4px 12px; background: #ef4444; color: white; border-radius: 4px; text-decoration: none; text-align: center;" onclick="window.showConfirmModal('確定要停用此會員嗎？', function(){ window.handleDisableUser('${user.uid}'); }); return false;">停用</a>`;
                    }
                    if (isOnline) {
                        actionsHtml += `<a href="#" class="op-link btn-action-kick" style="font-size: 12px; padding: 4px 12px; background: #f59e0b; color: white; border-radius: 4px; text-decoration: none; text-align: center;" onclick="window.showConfirmModal('確定要將此會員踢下線嗎？', function(){ window.handleKickOfflineUser('${user.uid}'); }); return false;">踢下线</a>`;
                    }
                    
                    nestedRowHtml += `<td style="text-align: center;">
                        <div style="display:flex; flex-direction:column; gap:6px; align-items:center;">
                            ${statusBadge}
                            ${actionsHtml}
                        </div>
                    </td>`;
                }
                if (nestedColumnVisibility['avatar']) {
                    nestedRowHtml += `<td style="text-align: center;">
                        <div class="user-avatar-circle-grey">
                            <i class="ph-fill ph-user"></i>
                        </div>
                    </td>`;
                }
                if (nestedColumnVisibility['memberInfo']) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">会员ID :</span> ${renderDataState(user.uid, 'copyable')}</div>
                        <div><span class="info-label">会员名 :</span> <a href="#" class="user-detail-link" data-uid="${user.uid}">${renderDataState(user.account, 'copyable')}</a></div>
                        <div><span class="info-label">真实姓名 :</span> ${hasPerm(37) ? renderDataState(user.realName) : window.maskRealName(user.realName)}</div>
                        <div><span class="info-label">昵称 :</span> ${(user.nickname && user.nickname !== '-') ? user.nickname : renderDataState(user.account)}</div>
                        <div><span class="info-label">上级代理 :</span> ${renderDataState(user.agentId)}</div>
                        <div><span class="info-label">信用值 :</span> ${hasPerm(7) ? (user.creditValue || 0) : '***'}</div>
                        <div><span class="info-label">邀请码 :</span> ${user.inviteCode || ''}</div>
                        <div><span class="info-label">设备类型 :</span> ${user.deviceType || ''}</div>
                        <div><span class="info-label">用户币别 :</span> <span style="color: #ef4444;">${user.currency || 'BRL'}</span></div>
                        <div><span class="info-label">国家 :</span> <span style="color: #ef4444;">${user.country || '巴西'}</span></div>
                    </td>`;
                }
                if (nestedColumnVisibility['levelTeam']) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">会员层级 :</span> ${user.level || '默认层'}</div>
                        <div><span class="info-label">成长值 :</span> ${user.growth || 0}</div>
                        <div><span class="info-label">等级 :</span> VIP${user.vipLevel || 0}</div>
                        <div><span class="info-label">账号类型 :</span> ${user.accountType || '普通账号'}</div>
                        <div><span class="info-label">直属会员/团队数 :</span> <a href="#" class="subordinate-link" style="color: var(--primary-color); text-decoration: underline;" data-uid="${user.uid}">${hasPerm(6) ? (user.directTeam || '0/0') : '*/*'}</a></div>
                    </td>`;
                }
                if (nestedColumnVisibility['creditLimit']) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">余额 :</span> ${user.availableCredit || '59,711.53'}</div>
                        <div><span class="info-label">余额宝 :</span> ${user.balanceBuy || '0.00'}</div>
                        <div><span class="info-label">佣金余额 :</span> ${hasPerm(7) ? (user.commissionBal || '0.00') : '***'}</div>
                        <div><span class="info-label">余额宝利息 :</span> ${user.interest || '0.00'}</div>
                        <div><span class="info-label">三方余额 :</span> ${user.thirdBal || '0.00'} <a href="#" class="refresh-link" style="color:#2563eb;font-size:12px;margin-left:4px;text-decoration:none;">刷新</a></div>
                        <div><span class="info-label">会员积分 :</span> ${user.points || '0.00'}</div>
                    </td>`;
                }
                if (nestedColumnVisibility['depositWithdraw'] && hasPerm(7)) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">存款总额 :</span> ${user.deposit || '0.00'}</div>
                        <div><span class="info-label">提款总额 :</span> ${user.withdraw || '0.00'}</div>
                        <div><span class="info-label">存款次数 :</span> ${user.depositCount || 0}</div>
                        <div><span class="info-label">提款次数 :</span> ${user.withdrawCount || 0}</div>
                        <div><span class="info-label">后台加款总额 :</span> ${user.adminAdd || '50,000.00'}</div>
                        <div><span class="info-label">后台扣款总额 :</span> ${user.adminDeduct || '0.00'}</div>
                        <div><span class="info-label">后台活动加款总额 :</span> ${user.adminActivityAdd || '0.00'}</div>
                        <div><span class="info-label">后台加款次数 :</span> ${user.adminAddCount || 1}</div>
                        <div><span class="info-label">后台扣款次数 :</span> ${user.adminDeductCount || 0}</div>
                        <div><span class="info-label">后台活动加款次数 :</span> ${user.adminActivityAddCount || 0}</div>
                        <div><span class="info-label">免提直充充值总额 :</span> ${user.quickDeposit || '0.00'}</div>
                        <div><span class="info-label">免提直充充值次数 :</span> ${user.quickDepositCount || 0}</div>
                        <div><span class="info-label">免提直充提款总额 :</span> ${user.quickWithdraw || '0.00'}</div>
                        <div><span class="info-label">免提直充提款次数 :</span> ${user.quickWithdrawCount || 0}</div>
                    </td>`;
                }
                if (nestedColumnVisibility['tags']) {
                    nestedRowHtml += `<td>
                        <div class="user-tags-container" style="flex-wrap: wrap;">
                        </div>
                    </td>`;
                }
                if (nestedColumnVisibility['status']) {
                    nestedRowHtml += `<td>
                        <span class="user-custom-tag tag-green">正常</span>
                    </td>`;
                }
                if (nestedColumnVisibility['dateInfo']) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">新增时间 :</span> ${renderDataState(user.date || '28-08-18 01:17')}</div>
                        <div><span class="info-label">最后登录 :</span> ${renderDataState(user.lastLogin || '今日 01:22:56')}</div>
                        <div><span class="info-label">离开天数 :</span> ${user.offlineDays !== undefined ? user.offlineDays : 0}天</div>
                        <div><span class="info-label">当前登录IP :</span> ${hasPerm(17) ? renderDataState(user.ip || '54.150.111.152', 'ip') : window.maskIp(user.ip)}</div>
                        <div><span class="info-label">上次登录IP :</span> </div>
                        <div><span class="info-label">注册 IP :</span> ${hasPerm(17) ? renderDataState(user.regIp || '54.150.111.152', 'ip') : window.maskIp(user.regIp)}</div>
                    </td>`;
                }
                if (nestedColumnVisibility['remark'] && hasPerm(21)) {
                    nestedRowHtml += `<td class="nested-cell-info">
                        <div><span class="info-label">备注 :</span> ${renderDataState(user.remark, 'longText')}</div>
                        <div><span class="info-label">回访备注 :</span> ${renderDataState(user.followRemark, 'longText')}</div>
                    </td>`;
                }

                const opLinks = [];
                if (shouldShowOp("编辑用户")) opLinks.push(`<a href="#" class="op-link user-detail-link" data-uid="${user.uid}">编辑用户</a>`);
                if (shouldShowOp("详情")) opLinks.push(`<a href="#" class="op-link user-detail-link" data-uid="${user.uid}">详情</a>`);
                if (shouldShowOp("资金明细")) opLinks.push(`<a href="#" class="op-link">资金明细</a>`);
                if (shouldShowOp("注单明细")) opLinks.push(`<a href="#" class="op-link">注单明细</a>`);
                if (shouldShowOp("体育返水")) opLinks.push(`<a href="#" class="op-link">体育返水</a>`);
                
                nestedRowHtml += `<td style="text-align: right; padding: 12px 16px; width: 1%; white-space: nowrap; vertical-align: middle;">`;
                
                if (opLinks.length > 0) {
                    nestedRowHtml += `<div style="display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: flex-end; max-width: 160px; text-align: right; margin-left: auto;">
                        ${opLinks.join('')}
                    </div>`;
                }
                
                const moreOps = [
                    '编辑提款信息', '修改余额', '积分调整', '变更代理', '第三方游戏',
                    '稽核记录', '备注', '回访备注', '隐藏资金明细', '校验用户任务',
                    '链上地址', '额度修改(链上充值)', '编辑标签', '用户标签编辑记录'
                ].filter(shouldShowOp);

                if (moreOps.length > 0) {
                    nestedRowHtml += `
                    <div class="more-op-dropdown-container" style="margin-top: 8px; text-align: right;">
                        <button class="btn-more-op-wide" style="display: inline-block;">更多...</button>
                        <ul class="more-op-dropdown-menu">
                            ${moreOps.map(op => `<li>${op}</li>`).join('')}
                        </ul>
                    </div>`;
                }
                
                nestedRowHtml += `</td>`;
                tr.innerHTML = nestedRowHtml;
            } else {
                // Compact Mode Layout
                const pinned = [];
                const unpinned = [];
                
                const visibleColumnsConfig = compactColumnsConfig.filter(col => compactColumnVisibility[col.id] && (!col.requirePerm || hasPerm(col.requirePerm)));
                visibleColumnsConfig.forEach(col => {
                    if (pinnedColumnIds.includes(col.id)) pinned.push(col);
                    else unpinned.push(col);
                });

                let cellsHtml = `<td class="sticky-col sticky-col-1" style="left:0;"><input type="checkbox" class="user-checkbox"></td>`;
                
                let currentLeft = 40;
                pinned.forEach(col => {
                    let cellStr = col.render(user);
                    const match = cellStr.match(/^<td([^>]*?)class="([^"]*)"/);
                    if (match) {
                        cellStr = cellStr.replace(/^<td([^>]*?)class="/, `<td$1style="left:${currentLeft}px; min-width:110px;" class="sticky-col `);
                    } else {
                        cellStr = cellStr.replace(/^<td/, `<td style="left:${currentLeft}px; min-width:110px;" class="sticky-col"`);
                    }
                    cellsHtml += cellStr;
                    currentLeft += 110;
                });

                const unpinnedWithoutAction = unpinned.filter(col => col.id !== 'action');
                unpinnedWithoutAction.forEach(col => {
                    cellsHtml += col.render(user);
                });

                const actionCol = visibleColumnsConfig.find(col => col.id === 'action');
                if (actionCol) {
                    cellsHtml += actionCol.render(user);
                }

                tr.innerHTML = cellsHtml;
            }

            userTableBody.appendChild(tr);
        });

        // Bind Header Columns Toggle Button (Image 2 Icon)
        document.querySelectorAll('.btn-header-columns-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns();
                const columnsDrawer = document.getElementById('columnsDrawer');
                if (columnsDrawer) {
                    if (currentTableMode === 'nested') {
                        tempNestedColumnVisibility = { ...nestedColumnVisibility };
                        tempNestedPinnedColumnIds = [ ...nestedPinnedColumnIds ];
                    } else {
                        tempCompactColumnVisibility = { ...compactColumnVisibility };
                        tempPinnedColumnIds = [ ...pinnedColumnIds ];
                    }
                    renderDropdown();
                    columnsDrawer.classList.add('active');
                    if (overlay) overlay.classList.add('active');
                }
            });
        });

        // Bind Compact Mode Row Action Dropdown Events
        userTableBody.querySelectorAll('.btn-op-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                const isShow = menu.classList.contains('show');
                document.querySelectorAll('.op-dropdown-menu').forEach(m => m.classList.remove('show'));
                if (!isShow) {
                    menu.classList.add('show');
                }
            });
        });

        userTableBody.querySelectorAll('.op-dropdown-menu li').forEach(li => {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = li.textContent.trim();
                const tr = li.closest('tr');
                // find user account/id if needed
                const userCell = tr ? tr.querySelector('.user-detail-link') : null;
                const uid = userCell ? userCell.getAttribute('data-uid') : null;
                
                if (text.includes('詳情') || text.includes('详情')) {
                    if (uid) window.openUserDetailsDrawer(uid);
                } else if (text === '編輯用戶' || text === '编辑用户') {
                    if (uid) openUserEditModal(uid);
                } else if (text === '代理變更紀錄' || text === '代理变更记录') {
                    window.openAgentChangeRecordDrawer(uid);
                } else {
                    alert(`觸發操作：${text}`);
                }
                li.parentElement.classList.remove('show');
            });
        });

        userTableBody.querySelectorAll('.more-op-dropdown-menu li').forEach(li => {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = li.textContent.trim();
                const tr = li.closest('tr');
                const userCell = tr ? tr.querySelector('.user-detail-link') : null;
                const uid = userCell ? userCell.getAttribute('data-uid') : null;
                
                if (text === '代理變更紀錄' || text === '代理变更记录') {
                    window.openAgentChangeRecordDrawer(uid);
                } else {
                    alert(`觸發操作：${text}`);
                }
                li.parentElement.classList.remove('show');
            });
        });
        
        // Bind Sort Events
        if (userTableHeader) {
            userTableHeader.querySelectorAll('.sort-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const col = btn.getAttribute('data-sort');
                    if (currentSortColumn === col) {
                        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortColumn = col;
                        currentSortDirection = 'desc';
                    }
                    renderTable();
                });
            });

            // Bind Pin Events
            userTableHeader.querySelectorAll('.icon-pin').forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = icon.getAttribute('data-id');
                    if (pinnedColumnIds.includes(id)) {
                        pinnedColumnIds = pinnedColumnIds.filter(colId => colId !== id);
                    } else {
                        pinnedColumnIds.push(id);
                    }
                    renderTable();
                });
            });
        }

        // Apply column visibility
        applyColumnVisibility();
        }, 400);
    }


    // Column Visibility State
    const columnVisibility = {
        1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true
    };

    function applyColumnVisibility() {
        if (currentTableMode === 'compact') {
            const visibleCount = Object.values(compactColumnVisibility).filter(Boolean).length;
            const visibleColumnsCountSpan = document.getElementById('visibleColumnsCount');
            if (visibleColumnsCountSpan) {
                visibleColumnsCountSpan.textContent = visibleCount;
            }
            return;
        }

        Object.keys(columnVisibility).forEach(index => {
            const idx = parseInt(index, 10);
            const cells = document.querySelectorAll(`table tr th:nth-child(${idx + 1}), table tr td:nth-child(${idx + 1})`);
            cells.forEach(cell => {
                cell.style.display = columnVisibility[idx] ? '' : 'none';
            });
        });
        
        // Update visibility count footer
        const visibleCount = Object.values(columnVisibility).filter(Boolean).length;
        const visibleColumnsCountSpan = document.getElementById('visibleColumnsCount');
        if (visibleColumnsCountSpan) {
            visibleColumnsCountSpan.textContent = visibleCount;
        }
    }

    // Column Toggle Controls
    const btnColumnToggle = document.getElementById('btnColumnToggle');
    const columnToggleDropdown = document.getElementById('columnToggleDropdown');
    const columnSearchInput = document.getElementById('columnSearchInput');
    const columnList = document.getElementById('columnList');
    const resetColumns = document.getElementById('resetColumns');

    function renderDropdown() {
        let html = '';
        let visibleCount = 0;
        
        if (currentTableMode === 'nested') {
            const permCols = nestedColumnsConfig.filter(col => !col.requirePerm || hasPerm(col.requirePerm));
            const allChecked = permCols.every(col => tempNestedColumnVisibility[col.id]);
            const someChecked = permCols.some(col => tempNestedColumnVisibility[col.id]);
            const groupCbHtml = `<input type="checkbox" class="group-cb-nested" ${allChecked ? 'checked' : ''} style="margin-right:8px;">`;
            
            html += `
                <div class="column-group-header" style="display:flex; align-items:center; justify-content:space-between; margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid var(--border-color); font-weight: bold;">
                    <label style="display:flex; align-items:center; cursor:pointer;">
                        ${groupCbHtml}
                        巢狀模式欄位
                    </label>
                </div>
            `;
            html += `<ul class="column-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
            permCols.forEach(col => {
                const isVisible = tempNestedColumnVisibility[col.id];
                if (isVisible) visibleCount++;
                const isPinned = tempNestedPinnedColumnIds.includes(col.id);
                
                const checkboxHtml = `<input type="checkbox" class="compact-col-cb" data-id="${col.id}" ${isVisible ? 'checked' : ''}>`;
                const labelSpanStyle = 'margin-left:8px; font-size:13px;';
                const pinHtml = `<i class="ph ph-push-pin icon-pin ${isPinned ? 'active' : ''}" data-id="${col.id}" title="釘選欄位"></i>`;

                html += `
                    <li>
                        <div class="dropdown-item-flex" style="padding-left: 8px; width: 100%;">
                            <label style="display:flex; align-items:center; flex-grow:1; margin-right:4px;">${checkboxHtml} <span style="${labelSpanStyle}">${col.label}</span></label>
                            ${pinHtml}
                        </div>
                    </li>
                `;
            });
            html += `</ul>`;

            const drawerContent = document.getElementById('columnsDrawerContent');
            if (drawerContent) {
                drawerContent.innerHTML = html;
                const groupCb = drawerContent.querySelector('.group-cb-nested');
                if (groupCb && !allChecked && someChecked) {
                    groupCb.indeterminate = true;
                }
            }
        } else {
            const groupedConfig = {};
            compactColumnsConfig.forEach(col => {
                if (!groupedConfig[col.group]) groupedConfig[col.group] = [];
                groupedConfig[col.group].push(col);
            });
            
            for (const [groupName, cols] of Object.entries(groupedConfig)) {
                const permCols = cols.filter(col => !col.requirePerm || hasPerm(col.requirePerm));
                if (permCols.length === 0) continue;

                const customizableCols = permCols.filter(col => !['uid', 'account', 'action'].includes(col.id));
                const allChecked = customizableCols.length > 0 && customizableCols.every(col => tempCompactColumnVisibility[col.id]);
                const someChecked = customizableCols.some(col => tempCompactColumnVisibility[col.id]);
                
                let groupCbHtml = '';
                if (customizableCols.length > 0) {
                    groupCbHtml = `<input type="checkbox" class="group-cb" data-group="${groupName}" ${allChecked ? 'checked' : ''} style="margin-right:8px;">`;
                }

                html += `
                    <div class="column-group-header" style="display:flex; align-items:center; justify-content:space-between; margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid var(--border-color); font-weight: bold;">
                        <label style="display:flex; align-items:center; ${customizableCols.length > 0 ? 'cursor:pointer;' : ''}">
                            ${groupCbHtml}
                            ${groupName}
                        </label>
                    </div>
                `;
                html += `<ul class="column-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
                permCols.forEach(col => {
                    const isVisible = tempCompactColumnVisibility[col.id];
                    if (isVisible) visibleCount++;
                    const isPinned = tempPinnedColumnIds.includes(col.id);
                    
                    let checkboxHtml = '';
                    let labelSpanStyle = 'margin-left:8px; font-size:13px;';
                    if (['uid', 'account', 'action'].includes(col.id)) {
                        checkboxHtml = `<input type="checkbox" class="compact-col-cb" data-id="${col.id}" data-group="${groupName}" checked style="display:none;">`;
                        labelSpanStyle = 'margin-left:0; font-size:13px; color: var(--text-secondary);';
                    } else {
                        checkboxHtml = `<input type="checkbox" class="compact-col-cb" data-id="${col.id}" data-group="${groupName}" ${isVisible ? 'checked' : ''}>`;
                    }
                    
                    let pinHtml = '';
                    if (col.id !== 'action') {
                        pinHtml = `<i class="ph ph-push-pin icon-pin ${isPinned ? 'active' : ''}" data-id="${col.id}" title="釘選欄位"></i>`;
                    }

                    html += `
                        <li>
                            <div class="dropdown-item-flex" style="padding-left: 8px; width: 100%;">
                                <label style="display:flex; align-items:center; flex-grow:1; margin-right:4px;">${checkboxHtml} <span style="${labelSpanStyle}">${col.label}</span></label>
                                ${pinHtml}
                            </div>
                        </li>
                    `;
                });
                html += `</ul>`;
            }

            const drawerContent = document.getElementById('columnsDrawerContent');
            if (drawerContent) {
                drawerContent.innerHTML = html;
                // Set indeterminate states
                drawerContent.querySelectorAll('.group-cb').forEach(groupCb => {
                    const groupName = groupCb.getAttribute('data-group');
                    const groupCols = groupedConfig[groupName];
                    const customizableCols = groupCols.filter(col => !['uid', 'account', 'action'].includes(col.id));
                    if (customizableCols.length > 0) {
                        const allChecked = customizableCols.every(col => tempCompactColumnVisibility[col.id]);
                        const someChecked = customizableCols.some(col => tempCompactColumnVisibility[col.id]);
                        if (!allChecked && someChecked) {
                            groupCb.indeterminate = true;
                        }
                    }
                });
            }
        }
    }

    // Toggle Dropdown (Nested / Compact Mode)
    if (btnColumnToggle) {
        btnColumnToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            
            if (currentTableMode === 'compact') {
                const columnsDrawer = document.getElementById('columnsDrawer');
                if (columnsDrawer) {
                    // Initialize temp draft state from saved state
                    tempCompactColumnVisibility = { ...compactColumnVisibility };
                    tempPinnedColumnIds = [ ...pinnedColumnIds ];
                    renderDropdown(); // Ensure it renders into the drawer first
                    columnsDrawer.classList.add('active');
                    document.getElementById('overlay').classList.add('active');
                }
            } else {
                const isOpen = columnToggleDropdown.classList.contains('show');
                if (!isOpen) {
                    renderDropdown();
                    columnToggleDropdown.classList.add('show');
                }
            }
        });
    }

    // Delegated Checkbox changed
    if (columnList) {
        columnList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                if (currentTableMode === 'nested') {
                    const colIndex = parseInt(e.target.getAttribute('data-column'), 10);
                    columnVisibility[colIndex] = e.target.checked;
                    applyColumnVisibility();
                } else {
                    const colId = e.target.getAttribute('data-id');
                    compactColumnVisibility[colId] = e.target.checked;
                    renderTable();
                }
                renderDropdown(); // Update count
            }
        });

        // Delegated Pin Click inside dropdown
        columnList.addEventListener('click', (e) => {
            if (e.target.classList.contains('icon-pin')) {
                e.stopPropagation();
                const id = e.target.getAttribute('data-id');
                if (pinnedColumnIds.includes(id)) {
                    pinnedColumnIds = pinnedColumnIds.filter(colId => colId !== id);
                } else {
                    pinnedColumnIds.push(id);
                }
                renderDropdown(); // Update UI in dropdown
                renderTable(); // Update table
            }
        });
    }

    // Reset Defaults
    const resetAction = () => {
        if (currentTableMode === 'nested') {
            Object.keys(columnVisibility).forEach(k => columnVisibility[k] = true);
            applyColumnVisibility();
        } else {
            compactColumnsConfig.forEach(col => compactColumnVisibility[col.id] = true);
            pinnedColumnIds = [];
            renderTable();
        }
        renderDropdown();
    };
    if (resetColumns) resetColumns.addEventListener('click', resetAction);
    const resetIcon = document.querySelector('.reset-icon');
    if (resetIcon) resetIcon.addEventListener('click', resetAction);

    // Column List Search Filter
    if (columnSearchInput && columnList) {
        columnSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            columnList.querySelectorAll('li').forEach(li => {
                const text = li.querySelector('span').textContent.toLowerCase();
                if (text.includes(query)) {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                }
            });
        });
    }

    // Select all logic via delegation
    if (userTableHeader) {
        userTableHeader.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && (e.target.id === 'selectAllCheckbox' || e.target.id === 'selectAllCheckboxCompact')) {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            }
        });
    }

    // Search events
    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            updateFilters();
            renderTable();
        });
    }
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            updateFilters();
            renderTable();
            closeDrawer();
        });
    }

    // Sticky header with collapsible filter card logic
    const filterCard = document.querySelector('.filter-card');
    const tableWrapper = document.querySelector('.table-wrapper');
    
    if (tableWrapper && filterCard) {
        tableWrapper.addEventListener('scroll', () => {
            if (tableWrapper.scrollTop > 10) {
                filterCard.classList.add('collapsed');
            } else {
                filterCard.classList.remove('collapsed');
            }
        });
    }
    // Sidebar Group Collapse/Expand Toggles
    const navHeaders = document.querySelectorAll('.nav-item-header');
    navHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            const arrow = header.querySelector('.toggle-arrow');
            
            // Toggle expanded class
            const isExpanded = group.classList.toggle('expanded');
            
            // Update arrow icon class
            if (arrow) {
                if (isExpanded) {
                    arrow.classList.remove('ph-caret-down');
                    arrow.classList.add('ph-caret-up');
                } else {
                    arrow.classList.remove('ph-caret-up');
                    arrow.classList.add('ph-caret-down');
                }
            }
        });
    });

    // Dynamic local time display
    const timeSpan = document.getElementById('currentLocalTime');
    if (timeSpan) {
        const updateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const date = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeSpan.textContent = `${year}/${month}/${date} ${hours}:${minutes}:${seconds}`;
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Initialize UI
    setTableMode('nested');
    updateFilters();



    // Customize Filter Modal Logic
    const btnCustomizeFilter = document.getElementById('btnCustomizeFilter');
    const customizeFilterModal = document.getElementById('customizeFilterModal');
    const btnCustomizeFilterClose = document.getElementById('btnCustomizeFilterClose');
    const btnCustomizeFilterCancel = document.getElementById('btnCustomizeFilterCancel');
    const btnCustomizeFilterConfirm = document.getElementById('btnCustomizeFilterConfirm');
    
    if (btnCustomizeFilter && customizeFilterModal) {
        const openModal = () => customizeFilterModal.classList.add('show');
        const closeModal = () => customizeFilterModal.classList.remove('show');
        
        btnCustomizeFilter.addEventListener('click', openModal);
        if (btnCustomizeFilterClose) btnCustomizeFilterClose.addEventListener('click', closeModal);
        if (btnCustomizeFilterCancel) btnCustomizeFilterCancel.addEventListener('click', closeModal);
        
        // Handle Confirm
        if (btnCustomizeFilterConfirm) {
            btnCustomizeFilterConfirm.addEventListener('click', () => {
            const checkboxes = customizeFilterModal.querySelectorAll('.checkbox-item input[type="checkbox"]');
            let allChecked = true;
            checkboxes.forEach(cb => {
                const filterId = cb.value;
                const isChecked = cb.checked;
                
                if (!isChecked) {
                    allChecked = false;
                }
                
                // Find all form groups and headers associated with this filter ID
                const elements = document.querySelectorAll(`[data-filter-id="${filterId}"]`);
                elements.forEach(el => {
                    if (isChecked) {
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                    }
                });
            });
            
            const btnAdvanced = document.getElementById('openAdvancedFilter');
            if (btnAdvanced) {
                btnAdvanced.style.display = allChecked ? 'none' : '';
            }
            
            closeModal();
        });
        }
        
        // Optional: Close modal on outside click
        customizeFilterModal.addEventListener('click', (e) => {
            if (e.target === customizeFilterModal) {
                closeModal();
            }
        });
    }

    // User Edit Modal Logic
    const userEditDrawer = document.getElementById('userEditDrawer');
    const btnUserEditClose = document.getElementById('btnUserEditClose');
    const btnUserEditCancel = document.getElementById('btnUserEditCancel');
    const btnUserEditSave = document.getElementById('btnUserEditSave');

    // Tab Switching inside Edit User Drawer
    document.querySelectorAll('.user-edit-tab-item').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.user-edit-tab-item').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            const tabTarget = tabBtn.getAttribute('data-tab');
            const tabBasic = document.getElementById('tabContentBasic');
            const tabSettings = document.getElementById('tabContentSettings');
            if (tabTarget === 'basic') {
                if (tabBasic) tabBasic.style.display = 'block';
                if (tabSettings) tabSettings.style.display = 'none';
            } else {
                if (tabBasic) tabBasic.style.display = 'none';
                if (tabSettings) tabSettings.style.display = 'block';
            }
        });
    });

    // Tab Switching inside User Details Drawer
    document.querySelectorAll('.user-details-tab-item').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.user-details-tab-item').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            const targetId = tabBtn.getAttribute('data-target');
            document.querySelectorAll('.details-tab-content-panel').forEach(panel => {
                if (panel.id === targetId) {
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            });
        });
    });

    function openUserEditModal(uid) {
        if (!userEditDrawer) return;
        const user = (mockUsers || []).find(u => u.uid === uid) || (mockUsers && mockUsers[0]);
        if (!user) return;

        const accountEl = document.getElementById('headerAccount');
        if (accountEl) accountEl.textContent = user.account;
        
        const avatarEl = document.getElementById('headerAvatar');
        if (avatarEl) avatarEl.textContent = user.account.charAt(0).toUpperCase();

        const typeEl = document.getElementById('headerUserType');
        if (typeEl) typeEl.textContent = user.userType || '普通會員';

        const levelEl = document.getElementById('headerUserLevel');
        if (levelEl) levelEl.textContent = user.level || '普通會員';

        const statusBadge = document.getElementById('headerStatusBadge');
        if (statusBadge) {
            if (user.status === '正常') {
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #16a34a;"></div>目前狀態：正常`;
                statusBadge.style.backgroundColor = '#dcfce7';
                statusBadge.style.color = '#16a34a';
            } else if (user.status === '冻结') {
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #eab308;"></div>目前狀態：冻结`;
                statusBadge.style.backgroundColor = '#fef9c3';
                statusBadge.style.color = '#eab308';
            } else {
                statusBadge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background-color: #dc2626;"></div>目前狀態：停用`;
                statusBadge.style.backgroundColor = '#fee2e2';
                statusBadge.style.color = '#dc2626';
            }
        }


        // Bind New Edit Form Fields
        
        // 1. Account & Security
        const accountIn = document.getElementById('editFormAccount');
        if (accountIn) accountIn.value = user.account || '';

        const statusRadios = document.querySelectorAll('input[name="editStatus"]');
        statusRadios.forEach(r => r.checked = (r.value === user.status));

        const loginPwdIn = document.getElementById('editFormLoginPwd');
        if (loginPwdIn) loginPwdIn.value = ''; // Reset password field

        const withdrawPwdIn = document.getElementById('editFormWithdrawPwd');
        if (withdrawPwdIn) withdrawPwdIn.value = ''; // Reset password field

        const loginPwdErrorIn = document.getElementById('editFormLoginPwdErrorCount');
        if (loginPwdErrorIn) loginPwdErrorIn.innerText = (user.loginPwdErrorCount || 0) + '次';

        const withdrawPwdErrorIn = document.getElementById('editFormWithdrawPwdErrorCount');
        if (withdrawPwdErrorIn) withdrawPwdErrorIn.innerText = (user.withdrawPwdErrorCount || 0) + '次';

        // 2. Personal Basic Info
        const realNameIn = document.getElementById('editFormRealName');
        if (realNameIn) {
            if (hasPerm(37)) {
                realNameIn.value = user.realName && user.realName !== '-' ? user.realName : '';
                realNameIn.disabled = false;
            } else {
                realNameIn.value = window.maskRealName(user.realName);
                realNameIn.disabled = true;
            }
        }

        const birthdayIn = document.getElementById('editFormBirthday');
        if (birthdayIn) birthdayIn.value = user.birthday || '';

        const nicknameIn = document.getElementById('editFormNickname');
        if (nicknameIn) nicknameIn.value = user.nickname !== '-' ? user.nickname : '';

        const levelSel = document.getElementById('editFormLevel');
        if (levelSel) levelSel.value = user.level || '普通會員';

        const cpfIn = document.getElementById('editFormCPF');
        if (cpfIn) cpfIn.value = user.cpf || '';

        // 3. Contact & Address Info
        const phoneCodeIn = document.getElementById('editFormPhoneCode');
        if (phoneCodeIn) phoneCodeIn.value = user.phoneCode || '+55';

        const phoneIn = document.getElementById('editFormPhone');
        if (phoneIn) {
            if (hasPerm(85)) {
                phoneIn.value = (user.phone !== '未驗證' && user.phone !== '末綁定' && user.phone !== '-') ? user.phone : '';
                phoneIn.disabled = false;
            } else {
                phoneIn.value = window.maskPhone(user.phone);
                phoneIn.disabled = true;
            }
        }

        const emailIn = document.getElementById('editFormEmail');
        if (emailIn) {
            if (hasPerm(86)) {
                emailIn.value = user.email || '';
                emailIn.disabled = false;
            } else {
                emailIn.value = window.maskEmail(user.email);
                emailIn.disabled = true;
            }
        }

        const addressIn = document.getElementById('editFormAddress');
        if (addressIn) addressIn.value = user.address || '';

        const provinceIn = document.getElementById('editFormProvince');
        if (provinceIn) provinceIn.value = user.province || '';

        const cityIn = document.getElementById('editFormCity');
        if (cityIn) cityIn.value = user.city || '';

        const zipcodeIn = document.getElementById('editFormZipcode');
        if (zipcodeIn) zipcodeIn.value = user.zipcode || '';

        // 4. Social Accounts
        const qqIn = document.getElementById('editFormQQ');
        if (qqIn) {
            if (hasPerm(87)) {
                qqIn.value = user.qq || '';
                qqIn.disabled = false;
            } else {
                qqIn.value = window.maskMiddle(user.qq);
                qqIn.disabled = true;
            }
        }

        const wechatIn = document.getElementById('editFormWechat');
        if (wechatIn) {
            if (hasPerm(88)) {
                wechatIn.value = user.wechat || '';
                wechatIn.disabled = false;
            } else {
                wechatIn.value = window.maskMiddle(user.wechat);
                wechatIn.disabled = true;
            }
        }

        const zaloIn = document.getElementById('editFormZalo');
        if (zaloIn) {
            if (hasPerm(89)) {
                zaloIn.value = user.zalo || '';
                zaloIn.disabled = false;
            } else {
                zaloIn.value = window.maskMiddle(user.zalo);
                zaloIn.disabled = true;
            }
        }

        const whatsappIn = document.getElementById('editFormWhatsapp');
        if (whatsappIn) {
            if (hasPerm(91)) {
                whatsappIn.value = user.whatsapp || '';
                whatsappIn.disabled = false;
            } else {
                whatsappIn.value = window.maskMiddle(user.whatsapp);
                whatsappIn.disabled = true;
            }
        }

        const telegramIn = document.getElementById('editFormTelegram');
        if (telegramIn) {
            if (hasPerm(92)) {
                telegramIn.value = user.telegram || '';
                telegramIn.disabled = false;
            } else {
                telegramIn.value = window.maskMiddle(user.telegram);
                telegramIn.disabled = true;
            }
        }

        const facebookIn = document.getElementById('editFormFacebook');
        if (facebookIn) {
            if (hasPerm(90)) {
                facebookIn.value = user.facebook || '';
                facebookIn.disabled = false;
            } else {
                facebookIn.value = window.maskMiddle(user.facebook);
                facebookIn.disabled = true;
            }
        }

        const lineIn = document.getElementById('editFormLine');
        if (lineIn) lineIn.value = user.line || '';

        const instagramIn = document.getElementById('editFormInstagram');
        if (instagramIn) instagramIn.value = user.instagram || '';

        const tiktokIn = document.getElementById('editFormTikTok');
        if (tiktokIn) tiktokIn.value = user.tiktok || '';

        const twitterIn = document.getElementById('editFormTwitter');
        if (twitterIn) twitterIn.value = user.twitter || '';

        const googleIn = document.getElementById('editFormGoogle');
        if (googleIn) googleIn.value = user.google || '';

        // 5. Financial & Other Settings
        const remarksIn = document.getElementById('editFormRemarks');
        if (remarksIn) remarksIn.value = user.remark && user.remark !== '-' ? user.remark : '';

        const stopThirdPartyRebateIn = document.getElementById('editFormStopThirdPartyRebate');
        if (stopThirdPartyRebateIn) stopThirdPartyRebateIn.checked = !!user.stopThirdPartyRebate;

        const stopSportsRebateIn = document.getElementById('editFormStopSportsRebate');
        if (stopSportsRebateIn) stopSportsRebateIn.checked = !!user.stopSportsRebate;

        const maxDepositRebateCountIn = document.getElementById('editFormMaxDepositRebateCount');
        if (maxDepositRebateCountIn) maxDepositRebateCountIn.value = user.maxDepositRebateCount || 0;

        // Render Withdraw Accounts
        const withdrawTbody = document.getElementById('editFormWithdrawInfoTableBody');
        const btnAddWithdraw = document.getElementById('btnAddWithdrawAccount');
        if (btnAddWithdraw) {
            btnAddWithdraw.style.display = hasPerm(26) ? 'inline-block' : 'none';
        }

        if (withdrawTbody) {
            withdrawTbody.innerHTML = '';
            if (user.withdrawAccounts && user.withdrawAccounts.length > 0) {
                const canEditBank = hasPerm(29);
                const canDeleteBank = hasPerm(30);
                const canDisableBank = hasPerm(46);
                const disabledAttr = canEditBank ? '' : 'disabled';
                const inputStyle = canEditBank ? 'background-color: white;' : 'background-color: #f1f5f9; cursor: not-allowed;';
                const saveBtnStyle = canEditBank ? 'background-color: #3b82f6; border-color: #3b82f6; color: white;' : 'background-color: #cbd5e1; border-color: #cbd5e1; color: white; cursor: not-allowed;';

                user.withdrawAccounts.forEach(acc => {
                    const tr = document.createElement('tr');
                    tr.style.height = '42px';
                    tr.style.borderBottom = '1px solid #e2e8f0';
                    tr.innerHTML = `
                        <td style="padding: 12px; white-space: nowrap;">
                            <select class="form-select" ${disabledAttr} style="width: 100%; min-width: 120px; height: 36px; padding: 0 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; ${inputStyle}">
                                <option value="支付宝" ${acc.type === '支付宝' ? 'selected' : ''}>支付宝</option>
                                <option value="c2cWallet" ${acc.type === 'c2cWallet' ? 'selected' : ''}>c2cWallet</option>
                                <option value="虚拟币" ${acc.type === '虚拟币' ? 'selected' : ''}>虚拟币</option>
                                <option value="ewallet" ${acc.type === 'ewallet' ? 'selected' : ''}>ewallet</option>
                                <option value="银行卡" ${acc.type === '银行卡' ? 'selected' : ''}>银行卡</option>
                            </select>
                        </td>
                        <td style="padding: 12px;">
                            <input type="text" class="form-input" ${disabledAttr} style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box; ${inputStyle}" value="${acc.account}">
                        </td>
                        <td style="padding: 12px; white-space: nowrap;">
                            <select class="form-select" ${disabledAttr} style="width: 100%; min-width: 120px; height: 36px; padding: 0 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; ${inputStyle}">
                                <option value="${acc.bank}" selected>${acc.bank}</option>
                                <option value="Alipay">Alipay</option>
                                <option value="88PAY">88PAY</option>
                                <option value="BSC-USDT">BSC-USDT</option>
                                <option value="testCryptoBank">testCryptoBank</option>
                                <option value="CAKE BY VPBAN">CAKE BY VPBAN</option>
                            </select>
                        </td>
                        <td style="padding: 12px;">
                            <input type="text" class="form-input" ${disabledAttr} style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box; ${inputStyle}" value="${acc.address || ''}">
                        </td>
                        <td style="padding: 12px; white-space: nowrap; text-align: center;">
                            <span style="display: inline-block; background-color: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">啟用</span>
                        </td>
                        <td style="padding: 12px; white-space: nowrap; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                ${canDeleteBank ? `<button type="button" class="btn btn-sm btn-danger" style="padding: 6px 12px; background-color: #f87171; border-color: #f87171; border-radius: 4px; color: white; border: 1px solid transparent; cursor: pointer; font-size: 13px;">刪除</button>` : ''}
                                <button type="button" class="btn btn-sm btn-primary" ${disabledAttr} style="padding: 6px 12px; border-radius: 4px; border: 1px solid transparent; font-size: 13px; ${saveBtnStyle}">儲存</button>
                                ${canDisableBank ? `<button type="button" class="btn btn-sm btn-outline" style="padding: 6px 12px; background-color: white; border: 1px solid #e2e8f0; border-radius: 4px; color: #475569; cursor: pointer; font-size: 13px;">禁用</button>` : ''}
                            </div>
                        </td>
                    `;
                    withdrawTbody.appendChild(tr);
                });
            } else {
                withdrawTbody.innerHTML = `
                    <tr style="height: 60px;">
                        <td colspan="6" style="text-align: center; color: #94a3b8; font-size: 13px;">暂无数据</td>
                    </tr>
                `;
            }
        }

        // Reset to Basic Tab on open
        const basicTabBtn = document.querySelector('.user-edit-tab-item[data-tab="basic"]');
        if (basicTabBtn) basicTabBtn.click();

        userEditDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    function closeUserEditDrawer() {
        if (userEditDrawer) userEditDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // Delegated click listener for user links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.user-detail-link');
        if (link) {
            e.preventDefault();
            const uid = link.getAttribute('data-uid');
            const text = link.textContent.trim();
                        if (text.includes('詳情') || text.includes('详情')) {
                if (window.openUserDetailsDrawer) window.openUserDetailsDrawer(uid);
            } else {
                openUserEditModal(uid);
            }
        }
    });

    if (btnUserEditClose) btnUserEditClose.addEventListener('click', closeUserEditDrawer);
    if (btnUserEditCancel) btnUserEditCancel.addEventListener('click', closeUserEditDrawer);
    if (btnUserEditSave) {
        btnUserEditSave.addEventListener('click', () => {
            showToast('用戶詳情已更新！');
            closeUserEditDrawer();
        });
    }

    const btnClearLoginPwdError = document.getElementById('btnClearLoginPwdError');
    if (btnClearLoginPwdError) {
        btnClearLoginPwdError.addEventListener('click', () => {
            const errorIn = document.getElementById('editFormLoginPwdErrorCount');
            if (errorIn) {
                errorIn.innerText = '0次';
                showToast('登錄密碼錯誤次數已清除');
            }
        });
    }

    const btnClearWithdrawPwdError = document.getElementById('btnClearWithdrawPwdError');
    if (btnClearWithdrawPwdError) {
        btnClearWithdrawPwdError.addEventListener('click', () => {
            const errorIn = document.getElementById('editFormWithdrawPwdErrorCount');
            if (errorIn) {
                errorIn.innerText = '0次';
                showToast('資金密碼錯誤次數已清除');
            }
        });
    }

    const btnUserDetailsClose = document.getElementById('btnUserDetailsClose');
    if (btnUserDetailsClose) {
        btnUserDetailsClose.addEventListener('click', () => {
            const userDetailsDrawer = document.getElementById('userDetailsDrawer');
            if (userDetailsDrawer) userDetailsDrawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    }

// Toast Function
window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.handleAuditAction = function(btn, message) {
    if (message) showToast(message);
    
    // Find the row and remove it
    const row = btn.closest('tr');
    if (row) {
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        setTimeout(() => row.remove(), 300);
    }
}



// IP Event Delegation
document.querySelector('#userTableBody')?.addEventListener('click', function(e) {
    if (e.target.closest('.ip-link')) {
        e.preventDefault();
        const ip = e.target.closest('.ip-link').dataset.ip;
        showToast('前往 IP 統計頁面: ' + ip);
    }
    
    if (e.target.closest('.copy-ip-btn')) {
        const ip = e.target.closest('.copy-ip-btn').dataset.ip;
        navigator.clipboard.writeText(ip).then(() => {
            showToast('已複製 IP: ' + ip);
        }).catch(err => {
            showToast('複製失敗');
        });
    }
    
    // Refresh third party balance in compact mode
    if (e.target.closest('.refresh-icon-compact')) {
        const icon = e.target.closest('.refresh-icon-compact');
        if (icon.classList.contains('icon-spin')) return; // Already refreshing
        
        icon.classList.add('icon-spin');
        
        // Simulate API call
        setTimeout(() => {
            icon.classList.remove('icon-spin');
            showToast('三方餘額刷新成功');
        }, 1000);
    }
});

const drawerContent = document.getElementById('columnsDrawerContent');
if (drawerContent) {
    drawerContent.addEventListener('change', (e) => {
        if (e.target.classList.contains('compact-col-cb')) {
            const colId = e.target.getAttribute('data-id');
            if (currentTableMode === 'nested') {
                tempNestedColumnVisibility[colId] = e.target.checked;
            } else {
                tempCompactColumnVisibility[colId] = e.target.checked;
            }
            renderDropdown(); // Update drawer UI only
        } else if (e.target.classList.contains('group-cb-nested')) {
            const isChecked = e.target.checked;
            nestedColumnsConfig.forEach(col => {
                tempNestedColumnVisibility[col.id] = isChecked;
            });
            renderDropdown();
        } else if (e.target.classList.contains('group-cb')) {
            const groupName = e.target.getAttribute('data-group');
            const isChecked = e.target.checked;
            compactColumnsConfig.forEach(col => {
                if (col.group === groupName && !['uid', 'account', 'action'].includes(col.id)) {
                    tempCompactColumnVisibility[col.id] = isChecked;
                }
            });
            renderDropdown(); // Update drawer UI
        }
    });

    drawerContent.addEventListener('click', (e) => {
        const pinIcon = e.target.closest('.icon-pin');
        if (pinIcon) {
            e.stopPropagation();
            const colId = pinIcon.getAttribute('data-id');
            if (currentTableMode === 'nested') {
                const idx = tempNestedPinnedColumnIds.indexOf(colId);
                if (idx > -1) {
                    tempNestedPinnedColumnIds.splice(idx, 1);
                } else {
                    tempNestedPinnedColumnIds.push(colId);
                }
            } else {
                const idx = tempPinnedColumnIds.indexOf(colId);
                if (idx > -1) {
                    tempPinnedColumnIds.splice(idx, 1);
                } else {
                    tempPinnedColumnIds.push(colId);
                }
            }
            renderDropdown(); // Update drawer UI only
        }
    });
}

// Drawer Save Button Handler
document.getElementById('btnColumnsDrawerSave')?.addEventListener('click', () => {
    if (currentTableMode === 'nested') {
        nestedColumnVisibility = { ...tempNestedColumnVisibility };
        nestedPinnedColumnIds = [ ...tempNestedPinnedColumnIds ];
    } else {
        compactColumnVisibility = { ...tempCompactColumnVisibility };
        pinnedColumnIds = [ ...tempPinnedColumnIds ];
    }
    renderTable();
    closeDrawer();
});

// Global Action Menu for Compact Mode
let globalActionMenu = document.getElementById('globalCompactActionMenu');
if (!globalActionMenu) {
    globalActionMenu = document.createElement('div');
    globalActionMenu.id = 'globalCompactActionMenu';
    globalActionMenu.style.cssText = 'display:none;position:fixed;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:6px;z-index:999999;padding:8px 0;min-width:160px;white-space:nowrap;max-height:300px;overflow-y:auto;text-align:left;';
    
    document.body.appendChild(globalActionMenu);
    renderCompactActionMenu();

    globalActionMenu.addEventListener('click', (e) => {
        const target = e.target.closest('li.compact-menu-item') || e.target.closest('a');
        if (target) {
            e.preventDefault();
            const text = target.textContent.trim();
            const uid = globalActionMenu.getAttribute('data-uid');
            
            if (text === '查看詳情' || text === '查看详情' || text === '详情') {
                if (uid && window.openUserDetailsDrawer) window.openUserDetailsDrawer(uid);
            } else if (text === '編輯用戶' || text === '编辑用户') {
                if (uid) openUserEditModal(uid);
            } else if (text === '代理變更紀錄' || text === '代理变更记录') {
                if (window.openAgentChangeRecordDrawer) {
                    window.openAgentChangeRecordDrawer(uid);
                }
            } else {
                alert(`觸發操作：${text}`);
            }
            hideMenu();
        }
    });

    let hideTimeout;
    const hideMenu = () => {
        hideTimeout = setTimeout(() => {
            globalActionMenu.style.display = 'none';
        }, 150);
    };
    const showMenu = (iconEl) => {
        clearTimeout(hideTimeout);
        const rect = iconEl.getBoundingClientRect();
        globalActionMenu.style.display = 'block';
        globalActionMenu.style.top = (rect.bottom + 4) + 'px';
        globalActionMenu.style.left = (rect.right - globalActionMenu.offsetWidth) + 'px';
    };


    document.addEventListener('mouseover', (e) => {
        const icon = e.target.closest('.compact-action-icon');
        if (icon) {
            const uid = icon.getAttribute('data-uid');
            if (globalActionMenu) {
                globalActionMenu.setAttribute('data-uid', uid);
            }
            showMenu(icon);
        } else if (e.target.closest('#globalCompactActionMenu')) {
            clearTimeout(hideTimeout);
        } else {
            if (globalActionMenu.style.display === 'block') {
                hideMenu();
            }
        }
    });
}

// Sidebar Toggle Logic
const btnSidebarToggle = document.getElementById('btnSidebarToggle');
const mainLayout = document.querySelector('.main-layout');
if (btnSidebarToggle && mainLayout) {
    btnSidebarToggle.addEventListener('click', () => {
        mainLayout.classList.toggle('sidebar-collapsed');
    });
}

// Bottom Stats Bar Toggle Logic
const btnToggleStats = document.getElementById('btnToggleStats');
const bottomStatsBar = document.getElementById('bottomStatsBar');
if (btnToggleStats && bottomStatsBar) {
    btnToggleStats.addEventListener('click', () => {
        bottomStatsBar.classList.toggle('collapsed');
        document.body.classList.toggle('stats-collapsed');
    });
}

// Add Withdraw Account Logic
const btnAddWithdrawAccount = document.getElementById('btnAddWithdrawAccount');
if (btnAddWithdrawAccount) {
    btnAddWithdrawAccount.addEventListener('click', () => {
        const withdrawTbody = document.getElementById('editFormWithdrawInfoTableBody');
        if (withdrawTbody) {
            // Remove the 'no data' row if it exists
            if (withdrawTbody.querySelector('tr td[colspan="6"]')) {
                withdrawTbody.innerHTML = '';
            }

            const tr = document.createElement('tr');
            tr.style.height = '42px';
            tr.style.borderBottom = '1px solid #e2e8f0';
            tr.innerHTML = `
                <td style="padding: 12px; white-space: nowrap;">
                    <select class="form-select" style="width: 100%; min-width: 120px; height: 36px; padding: 0 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none;">
                        <option value="支付宝">支付宝</option>
                        <option value="c2cWallet">c2cWallet</option>
                        <option value="虚拟币">虚拟币</option>
                        <option value="ewallet">ewallet</option>
                        <option value="银行卡">银行卡</option>
                    </select>
                </td>
                <td style="padding: 12px;">
                    <input type="text" class="form-input" style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box;" value="">
                </td>
                <td style="padding: 12px; white-space: nowrap;">
                    <select class="form-select" style="width: 100%; min-width: 120px; height: 36px; padding: 0 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none;">
                        <option value="Alipay">Alipay</option>
                        <option value="88PAY">88PAY</option>
                        <option value="BSC-USDT">BSC-USDT</option>
                        <option value="testCryptoBank">testCryptoBank</option>
                        <option value="CAKE BY VPBAN">CAKE BY VPBAN</option>
                    </select>
                </td>
                <td style="padding: 12px;">
                    <input type="text" class="form-input" style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box;" value="">
                </td>
                <td style="padding: 12px; white-space: nowrap; text-align: center;">
                    <span style="display: inline-block; background-color: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">啟用</span>
                </td>
                <td style="padding: 12px; white-space: nowrap; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button type="button" class="btn btn-sm btn-danger" style="padding: 6px 12px; background-color: #f87171; border-color: #f87171; border-radius: 4px; color: white; border: 1px solid transparent; cursor: pointer; font-size: 13px;" onclick="this.closest('tr').remove();">刪除</button>
                        <button type="button" class="btn btn-sm btn-primary" style="padding: 6px 12px; background-color: #3b82f6; border-color: #3b82f6; border-radius: 4px; color: white; border: 1px solid transparent; cursor: pointer; font-size: 13px;">儲存</button>
                    </div>
                </td>
            `;
            withdrawTbody.appendChild(tr);
        }
    });
}

// Allow clicking anywhere in date range containers to open the native date/time picker
document.querySelectorAll('.date-range-container, .date-range-input').forEach(container => {
    container.addEventListener('click', (e) => {
        const inputs = container.querySelectorAll('input[type="datetime-local"], input[type="date"]');
        if (inputs.length > 0) {
            if (e.target === container || e.target.classList.contains('inline-label') || e.target.classList.contains('date-separator-line') || e.target.classList.contains('separator')) {
                const rect = container.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const targetInput = (clickX > rect.width / 2 && inputs.length > 1) ? inputs[1] : inputs[0];
                if (typeof targetInput.showPicker === 'function') {
                    try {
                        targetInput.showPicker();
                    } catch (err) {
                        console.error("showPicker error: ", err);
                    }
                }
            }
        }
    });
});

document.querySelectorAll('input[type="datetime-local"], input[type="date"]').forEach(input => {
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof input.showPicker === 'function') {
            try {
                input.showPicker();
            } catch (err) {
                console.error("showPicker error: ", err);
            }
        }
    });
});

    // Toggle amount masking in bottom stats bar
    const amountToggles = document.querySelectorAll('.amount-toggle-wrapper');
    amountToggles.forEach(wrapper => {
        const btn = wrapper.querySelector('.amount-toggle-btn');
        const display = wrapper.querySelector('.amount-display');
        const rawValue = wrapper.getAttribute('data-raw-value');
        
        if (btn && display && rawValue) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isMasked = display.textContent === '********';
                if (isMasked) {
                    display.textContent = rawValue;
                    btn.classList.remove('ph-eye-slash');
                    btn.classList.add('ph-eye');
                } else {
                    display.textContent = '********';
                    btn.classList.remove('ph-eye');
                    btn.classList.add('ph-eye-slash');
                }
            });
        }
    });

    // Toggle Decryption Details Submenu
    const toggleDecryptionDetailsBtn = document.getElementById('toggleDecryptionDetailsBtn');
    const decryptionDetailsIcon = document.getElementById('decryptionDetailsIcon');
    const decryptionDetailsChildren = document.getElementById('decryptionDetailsChildren');

    if (toggleDecryptionDetailsBtn && decryptionDetailsIcon && decryptionDetailsChildren) {
        toggleDecryptionDetailsBtn.addEventListener('click', (e) => {
            // Ignore if clicking directly on the checkbox
            if (e.target.tagName.toLowerCase() === 'input') return;

            e.stopPropagation();
            const isExpanded = decryptionDetailsChildren.style.display !== 'none';
            if (isExpanded) {
                decryptionDetailsChildren.style.display = 'none';
                decryptionDetailsIcon.classList.remove('ph-caret-down');
                decryptionDetailsIcon.classList.add('ph-caret-right');
            } else {
                decryptionDetailsChildren.style.display = 'block';
                decryptionDetailsIcon.classList.remove('ph-caret-right');
                decryptionDetailsIcon.classList.add('ph-caret-down');
            }
        });
    }

window.renderTable = renderTable;
window.renderCompactActionMenu = renderCompactActionMenu;

window.filterIpRecords = function(val) {
    const rows = document.querySelectorAll('#ipRecordsBody .ip-record-row');
    rows.forEach(row => {
        if (val === 'all') {
            row.style.display = '';
        } else if (val === 'login') {
            row.style.display = row.classList.contains('login-record') ? '' : 'none';
        } else if (val === 'reg') {
            row.style.display = row.classList.contains('reg-record') ? '' : 'none';
        }
    });
};

// Global Confirm Modal function
window.showConfirmModal = function(message, onConfirm) {
    const modal = document.getElementById('globalConfirmModal');
    const msgEl = document.getElementById('globalConfirmModalMessage');
    const btnOk = document.getElementById('btnGlobalConfirmOk');
    const btnCancel = document.getElementById('btnGlobalConfirmCancel');
    const btnClose = document.getElementById('btnGlobalConfirmClose');
    
    if (!modal) {
        if (confirm(message)) {
            if (onConfirm) onConfirm();
        }
        return;
    }
    
    msgEl.textContent = message;
    modal.style.display = 'flex';
    
    const close = () => {
        modal.style.display = 'none';
        btnOk.onclick = null;
        btnCancel.onclick = null;
        if (btnClose) btnClose.onclick = null;
    };
    
    btnOk.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
        if (onConfirm) onConfirm();
    };
    
    btnCancel.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
    };
    
    if (btnClose) {
        btnClose.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
        };
    }
};

window.handleDisableUser = function(uid) {
    if (window.mockUsers) {
        const user = window.mockUsers.find(u => u.uid === uid);
        if (user) {
            user.status = '停用';
            if (window.showToast) window.showToast('已停用');
            if (typeof renderTable === 'function') renderTable();
        }
    }
};

window.handleKickOfflineUser = function(uid) {
    if (window.mockUsers) {
        const user = window.mockUsers.find(u => u.uid === uid);
        if (user) {
            user.offlineDays = 1;
            if (window.showToast) window.showToast('已踢下線');
            if (typeof renderTable === 'function') renderTable();
        }
    }
};

});