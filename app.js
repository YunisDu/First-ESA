// 日志统计系统 - 应用核心功能

// 全局变量
let logs = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredLogs = [];
let companyName = 'EchoOfCloud'; // 公司名称，默认为"EchoOfCloud"
let currentTimeRange = 7; // 当前时间范围，默认7天
let commonLogs = []; // 常用日志列表

// DOM元素引用
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const logForm = document.getElementById('log-form');
const logItems = document.getElementById('log-items');
const pagination = document.getElementById('pagination');
const todayCount = document.getElementById('today-count');
const monthCount = document.getElementById('month-count');
const yearCount = document.getElementById('year-count');
const totalCount = document.getElementById('total-count');
const exportCsvBtn = document.getElementById('export-csv');
const exportWordBtn = document.getElementById('export-word');
const importCsvInput = document.getElementById('import-csv');
const clearAllDataBtn = document.getElementById('clear-all-data');
const confirmDialog = document.getElementById('confirm-dialog');
const toast = document.getElementById('message-toast');
const toastMessage = document.getElementById('toast-message');

// 初始化应用
function initApp() {
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 如果没有数据，生成一些模拟数据用于测试
    if (logs.length === 0) {
        generateMockData();
    }
    
    // 设置当前日期
    document.getElementById('log-date').valueAsDate = new Date();
    document.getElementById('daily-stats-date').valueAsDate = new Date();
    
    // 设置当前时间
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('log-time').value = `${hours}:${minutes}`;
    
    // 设置当前年份
    const currentYear = now.getFullYear();
    document.getElementById('monthly-stats-year').value = currentYear;
    document.getElementById('yearly-stats-start').value = currentYear - 1;
    document.getElementById('yearly-stats-end').value = currentYear;
    
    // 添加事件监听器
    addEventListeners();
    
    // 更新仪表盘
    updateDashboard();
    
    // 渲染日志列表
    renderLogList();
    
    // 初始化图表
    initChart();
    
    // 显示当日日志列表
    showTodayLogs();
    
    // 初始化常用日志下拉列表
    initCommonLogsSelect();
    
    // 确保在数据加载后更新图表
    setTimeout(() => {
        if (logChart) {
            updateChart();
        }
    }, 100);
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    const storedLogs = localStorage.getItem('workLogs');
    if (storedLogs) {
        logs = JSON.parse(storedLogs);
        console.log('从本地存储加载了', logs.length, '条日志');
    }
    
    // 加载公司名称
    const storedCompanyName = localStorage.getItem('companyName');
    if (storedCompanyName) {
        companyName = storedCompanyName;
        console.log('从本地存储加载了公司名称:', companyName);
    }
    
    // 加载常用日志
    const storedCommonLogs = localStorage.getItem('commonLogs');
    if (storedCommonLogs) {
        commonLogs = JSON.parse(storedCommonLogs);
        console.log('从本地存储加载了', commonLogs.length, '条常用日志');
    }
}

// 生成模拟数据用于测试
function generateMockData() {
    console.log('没有找到现有数据，生成模拟数据用于测试...');
    const categories = ['技术开发', '文档编写', '会议讨论', '客户沟通', '学习培训', '日常工作'];
    
    // 为最近10天生成一些随机日志
    for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // 每天生成1-5条日志
        const logsCount = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < logsCount; j++) {
            const hour = Math.floor(Math.random() * 9) + 9; // 9点到17点
            const minute = Math.floor(Math.random() * 60);
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const timestamp = new Date(date);
            timestamp.setHours(hour, minute);
            
            const category = categories[Math.floor(Math.random() * categories.length)];
            const contents = [
                '完成了项目需求分析和设计',
                '参加了团队周会，讨论了项目进度',
                '编写了API文档和使用说明',
                '修复了系统中的bug和性能问题',
                '学习了新技术框架和开发工具',
                '与客户进行了项目沟通和需求确认'
            ];
            const content = contents[Math.floor(Math.random() * contents.length)];
            
            logs.push({
                id: generateId(),
                date: dateStr,
                time: time,
                content: content,
                category: category,
                tags: [],
                timestamp: timestamp.toISOString(),
                sequenceNumber: j + 1,
                created: timestamp.getTime()
            });
        }
    }
    
    // 保存模拟数据到本地存储
    saveToLocalStorage();
    console.log('已生成', logs.length, '条模拟日志数据');
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('workLogs', JSON.stringify(logs));
}

// 保存公司名称到本地存储
function saveCompanyName(name) {
    companyName = name;
    localStorage.setItem('companyName', name);
}

// 保存常用日志到本地存储
function saveCommonLogs() {
    localStorage.setItem('commonLogs', JSON.stringify(commonLogs));
}

// 添加常用日志
function addCommonLog(content, category, tags) {
    const newCommonLog = {
        id: generateId(),
        content: content,
        category: category || '日常工作',
        tags: tags || []
    };
    commonLogs.push(newCommonLog);
    saveCommonLogs();
    return newCommonLog;
}

// 从统计页面添加到常用日志
function addToCommonLogsFromStats(content) {
    if (!content || content.trim() === '') {
        showToast('日志内容不能为空', 'warning');
        return;
    }
    
    const trimmedContent = content.trim();
    
    if (commonLogs.some(log => log.content === trimmedContent)) {
        showToast('该日志已在常用日志中', 'warning');
        return;
    }
    
    addCommonLog(trimmedContent, '日常工作', []);
    showToast('已添加到常用日志', 'success');
    
    // 重新渲染常用日志列表和下拉选择
    renderCommonLogsList();
    initCommonLogsSelect();
    
    // 重新显示常用日志统计，以更新按钮状态
    showCommonStats();
}

// 删除常用日志
function deleteCommonLog(id) {
    commonLogs = commonLogs.filter(log => log.id !== id);
    saveCommonLogs();
}

// 更新常用日志
function updateCommonLog(id, content, category, tags) {
    const index = commonLogs.findIndex(log => log.id === id);
    if (index !== -1) {
        commonLogs[index] = {
            ...commonLogs[index],
            content: content,
            category: category || '日常工作',
            tags: tags || []
        };
        saveCommonLogs();
    }
}

// 上移常用日志
function moveCommonLogUp(id) {
    const index = commonLogs.findIndex(log => log.id === id);
    if (index > 0) {
        [commonLogs[index], commonLogs[index - 1]] = [commonLogs[index - 1], commonLogs[index]];
        saveCommonLogs();
    }
}

// 下移常用日志
function moveCommonLogDown(id) {
    const index = commonLogs.findIndex(log => log.id === id);
    if (index < commonLogs.length - 1) {
        [commonLogs[index], commonLogs[index + 1]] = [commonLogs[index + 1], commonLogs[index]];
        saveCommonLogs();
    }
}

// 初始化常用日志下拉列表
function initCommonLogsSelect() {
    const commonLogsSelect = document.getElementById('common-logs-select');
    if (!commonLogsSelect) return;
    
    commonLogsSelect.innerHTML = '<option value="">选择常用日志...</option>';
    
    commonLogs.forEach(commonLog => {
        const option = document.createElement('option');
        option.value = commonLog.id;
        option.textContent = commonLog.content.substring(0, 50) + (commonLog.content.length > 50 ? '...' : '');
        option.dataset.content = commonLog.content;
        option.dataset.category = commonLog.category;
        option.dataset.tags = commonLog.tags.join(',');
        commonLogsSelect.appendChild(option);
    });
}

// 选择常用日志
function selectCommonLog(id) {
    const commonLog = commonLogs.find(log => log.id === id);
    if (!commonLog) return;
    
    const contentInput = document.getElementById('log-content');
    const currentContent = contentInput.value;
    
    if (currentContent.trim() === '') {
        contentInput.value = commonLog.content;
    } else {
        contentInput.value = currentContent + '\n' + commonLog.content;
    }
    
    document.getElementById('log-category').value = commonLog.category;
    document.getElementById('log-tags').value = commonLog.tags.join(', ');
    
    showToast('已加载常用日志');
}

// 添加事件监听器
function addEventListeners() {
    // 初始化公司名称输入框
    const companyNameInput = document.getElementById('company-name');
    if (companyNameInput) {
        companyNameInput.value = companyName;
    }
    
    // 时间范围选择器事件监听
    const timeRangeBtns = document.querySelectorAll('.time-range-btn');
    if (timeRangeBtns && timeRangeBtns.length > 0) {
        timeRangeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 更新按钮状态
                timeRangeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 更新当前时间范围
                currentTimeRange = parseInt(btn.getAttribute('data-range'));
                
                // 更新图表
                updateChart();
            });
        });
    }
    
    // 保存公司名称按钮事件监听
    const saveCompanyNameBtn = document.getElementById('save-company-name');
    if (saveCompanyNameBtn) {
        saveCompanyNameBtn.addEventListener('click', function() {
            const companyNameInput = document.getElementById('company-name');
            if (companyNameInput) {
                const newCompanyName = companyNameInput.value.trim() || 'EchoOfCloud';
                saveCompanyName(newCompanyName);
                showToast('公司名称已保存');
            }
        });
    }
    
    // 日期选择器事件监听，更新当日日志列表
    const logDateInput = document.getElementById('log-date');
    if (logDateInput) {
        logDateInput.addEventListener('change', showTodayLogs);
    }
    
    // 常用日志下拉选择事件监听
    const commonLogsSelect = document.getElementById('common-logs-select');
    if (commonLogsSelect) {
        commonLogsSelect.addEventListener('change', function() {
            const selectedId = this.value;
            if (selectedId) {
                selectCommonLog(selectedId);
            }
        });
    }
    
    // 导航切换
    if (navLinks && navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                switchSection(targetId);
            });
        });
    }
    
    // 日志表单提交
    if (logForm) logForm.addEventListener('submit', handleLogFormSubmit);
    
    // 取消编辑
    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetLogForm);
    
    // 筛选功能
    const applyFilterBtn = document.getElementById('apply-filter');
    const clearFilterBtn = document.getElementById('clear-filter');
    
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', applyFilter);
    if (clearFilterBtn) clearFilterBtn.addEventListener('click', clearFilter);
    
    // 统计标签页
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns && tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                switchStatsTab(tabId);
            });
        });
    }
    
    // 统计查看按钮
    const showDailyStatsBtn = document.getElementById('show-daily-stats');
    const showMonthlyStatsBtn = document.getElementById('show-monthly-stats');
    const showYearlyStatsBtn = document.getElementById('show-yearly-stats');
    const showCategoryStatsBtn = document.getElementById('show-category-stats');
    const showCommonStatsBtn = document.getElementById('show-common-stats');
    
    if (showDailyStatsBtn) showDailyStatsBtn.addEventListener('click', showDailyStats);
    if (showMonthlyStatsBtn) showMonthlyStatsBtn.addEventListener('click', showMonthlyStats);
    if (showYearlyStatsBtn) showYearlyStatsBtn.addEventListener('click', showYearlyStats);
    if (showCategoryStatsBtn) showCategoryStatsBtn.addEventListener('click', showCategoryStats);
    if (showCommonStatsBtn) showCommonStatsBtn.addEventListener('click', showCommonStats);
    
    // 统计选择器自动触发统计
    const dailyStatsDate = document.getElementById('daily-stats-date');
    const monthlyStatsYear = document.getElementById('monthly-stats-year');
    const yearlyStatsStart = document.getElementById('yearly-stats-start');
    const yearlyStatsEnd = document.getElementById('yearly-stats-end');
    const categoryStatsPeriod = document.getElementById('category-stats-period');
    const commonStatsPeriod = document.getElementById('common-stats-period');
    
    // 每日统计 - 日期选择后自动触发
    if (dailyStatsDate) dailyStatsDate.addEventListener('change', showDailyStats);
    
    // 月度统计 - 年份选择后自动触发
    if (monthlyStatsYear) monthlyStatsYear.addEventListener('change', showMonthlyStats);
    
    // 年度统计 - 年份范围选择后自动触发
    if (yearlyStatsStart) yearlyStatsStart.addEventListener('change', showYearlyStats);
    if (yearlyStatsEnd) yearlyStatsEnd.addEventListener('change', showYearlyStats);
    
    // 类别统计 - 周期选择后自动触发
    if (categoryStatsPeriod) categoryStatsPeriod.addEventListener('change', showCategoryStats);
    
    // 常用日志统计 - 周期选择后自动触发
    if (commonStatsPeriod) commonStatsPeriod.addEventListener('change', showCommonStats);
    
    // 数据管理
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToCSV);
    if (exportWordBtn) exportWordBtn.addEventListener('click', exportAllToWord);
    if (importCsvInput) importCsvInput.addEventListener('change', importFromCSV);
    if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', () => {
        showConfirmDialog('确认清空所有数据', '此操作不可恢复，确定要清空所有日志数据吗？', clearAllData);
    });
    
    // 常用日志管理
    const addCommonLogBtn = document.getElementById('add-common-log');
    if (addCommonLogBtn) {
        addCommonLogBtn.addEventListener('click', handleAddCommonLog);
    }
    
    // 确认对话框
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    if (confirmYesBtn) confirmYesBtn.addEventListener('click', confirmYes);
    if (confirmNoBtn) confirmNoBtn.addEventListener('click', confirmNo);
    
    // 关于对话框
    const aboutBtn = document.getElementById('about-btn');
    const aboutDialog = document.getElementById('about-dialog');
    const aboutOkBtn = document.getElementById('about-ok');
    
    if (aboutBtn && aboutDialog && aboutOkBtn) {
        aboutBtn.addEventListener('click', () => {
            aboutDialog.style.display = 'flex';
        });
        
        aboutOkBtn.addEventListener('click', () => {
            aboutDialog.style.display = 'none';
        });
        
        // 点击对话框外部关闭
        aboutDialog.addEventListener('click', (e) => {
            if (e.target === aboutDialog) {
                aboutDialog.style.display = 'none';
            }
        });
    }
}

// 切换显示的区域
function switchSection(sectionId) {
    // 更新导航样式
    if (navLinks && navLinks.length > 0) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // 更新显示的区域
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // 特定区域的更新
    if (sectionId === 'dashboard') {
        updateDashboard();
        updateChart();
    } else if (sectionId === 'log-list') {
        renderLogList();
    } else if (sectionId === 'statistics') {
        // 自动触发当前激活标签页的统计功能
        const activeTab = document.querySelector('.stats-tabs .tab-btn.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            switch(tabId) {
                case 'daily':
                    // 设置默认日期为今天
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('daily-stats-date').value = today;
                    showDailyStats();
                    break;
                case 'monthly':
                    // 设置默认年份为今年
                    document.getElementById('monthly-stats-year').value = new Date().getFullYear();
                    showMonthlyStats();
                    break;
                case 'yearly':
                    // 设置默认年份范围
                    const currentYear = new Date().getFullYear();
                    document.getElementById('yearly-stats-start').value = currentYear - 1;
                    document.getElementById('yearly-stats-end').value = currentYear;
                    showYearlyStats();
                    break;
                case 'category':
                    showCategoryStats();
                    break;
            }
        }
    } else if (sectionId === 'data-management') {
        // 渲染常用日志列表
        renderCommonLogsList();
    }
    } else {
        console.warn(`未找到ID为${sectionId}的区域`);
    }
}

// 处理日志表单提交
function handleLogFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('log-id').value;
    const date = document.getElementById('log-date').value;
    const time = document.getElementById('log-time').value;
    let content = document.getElementById('log-content').value.trim();
    
    // 自动清除符号功能
    const autoClearEnabled = document.getElementById('auto-clear-symbols').checked;
    
    // 确保类别不能为空，默认为"日常工作"
    let category = document.getElementById('log-category').value;
    if (!category) {
        category = '日常工作';
    }
    const tags = document.getElementById('log-tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const timestamp = new Date(`${date}T${time}`).getTime();
    
    if (id) {
        // 编辑现有日志
        const index = logs.findIndex(log => log.id === id);
        if (index !== -1) {
            // 检查是否包含分号分隔符（中文或英文）或换行符
            const logParts = content.split(/[；;\n]/).map(part => part.trim()).filter(part => part);
            
            if (logParts.length > 1) {
                // 如果包含多个条目，更新为第一个条目
                logs[index] = {
                    ...logs[index],
                    date,
                    time,
                    content: logParts[0],
                    category,
                    tags,
                    timestamp,
                    sequenceNumber: 1 // 添加序列号
                };
                
                // 添加剩余的条目
                for (let i = 1; i < logParts.length; i++) {
                    const newLogItem = {
                        id: generateId(),
                        date,
                        time,
                        content: logParts[i],
                        category,
                        tags,
                        timestamp,
                        sequenceNumber: i + 1, // 设置序列号
                        created: new Date().getTime()
                    };
                    logs.unshift(newLogItem);
                }
                recalculateSequenceNumbers(); // 重新计算序号
            } else {
                // 单个条目，直接更新
                logs[index] = {
                    ...logs[index],
                    date,
                    time,
                    content,
                    category,
                    tags,
                    timestamp,
                    sequenceNumber: logs[index].sequenceNumber || 1 // 保留原有序列号或设置为1
                };
            }
            recalculateSequenceNumbers(); // 重新计算序号
            showToast('日志更新成功');
        }
    } else {
        // 添加新日志
        // 检查是否包含分号分隔符（中文或英文）或换行符
        let logParts = content.split(/[；;\n]/).map(part => part.trim()).filter(part => part);
        
        // 计算当天已有的最大序列号
        const sameDayLogs = logs.filter(log => log.date === date);
        
        // 确保所有现有日志都有序号，防止序号混乱
        let maxSequenceNumber = 0;
        if (sameDayLogs.length > 0) {
            // 先确保所有日志都有序号
            sameDayLogs.forEach(log => {
                if (!log.sequenceNumber) {
                    log.sequenceNumber = 1;
                }
            });
            // 再计算最大序号
            maxSequenceNumber = Math.max(...sameDayLogs.map(log => log.sequenceNumber));
        }
        
        // 对每条分割后的日志应用自动清除规则
        if (autoClearEnabled) {
            logParts = logParts.map(part => {
                let processedPart = part.trim();
                
                // 规则1：清除最后一个字符是；;或。.的符号
                if (processedPart) {
                    const lastChar = processedPart.slice(-1);
                    if (['；', ';', '。', '.'].includes(lastChar)) {
                        processedPart = processedPart.slice(0, -1).trim();
                    }
                }
                
                // 规则2：清除前几个字符是数字或者.的字符，如2.
                if (processedPart) {
                    // 匹配开头的数字和符号组合，如 "1."、"2.参加"、"3：会议" 等
                    processedPart = processedPart.replace(/^\d+[\.。:：；;]\s*/, '');
                }
                
                return processedPart;
            }).filter(part => part.trim()); // 过滤空条目
        }
        
        // 处理单个日志的情况
        if (logParts.length === 1) {
            // 如果是单个日志，直接使用处理后的内容
            content = logParts[0];
        }
        
        if (logParts.length > 1) {
            // 添加多个日志条目
            for (let i = 0; i < logParts.length; i++) {
                const newLogItem = {
                    id: generateId(),
                    date,
                    time,
                    content: logParts[i],
                    category,
                    tags,
                    timestamp,
                    sequenceNumber: maxSequenceNumber + i + 1, // 从当天最大序号+1开始分配
                    created: new Date().getTime()
                };
                logs.unshift(newLogItem);
            }
            showToast(`成功添加 ${logParts.length} 条日志`);
        } else {
            // 添加单个日志条目
            const newLog = {
                id: generateId(),
                date,
                time,
                content: content.trim(),
                category,
                tags,
                timestamp,
                sequenceNumber: maxSequenceNumber + 1, // 在当天最大序号基础上加1
                created: new Date().getTime()
            };
            logs.unshift(newLog);
            showToast('日志添加成功');
        }
    }
    
    saveToLocalStorage();
    resetLogForm();
    updateDashboard();
    renderLogList();
    showTodayLogs();
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 显示当日日志列表
function showTodayLogs() {
    const today = document.getElementById('log-date').value;
    if (!today) return;
    
    // 获取当日日志并按序列号排序
    const todayLogs = logs
        .filter(log => log.date === today)
        .sort((a, b) => (a.sequenceNumber || 1) - (b.sequenceNumber || 1));
    
    const todayLogsList = document.getElementById('today-logs-list');
    if (!todayLogsList) return;
    
    if (todayLogs.length === 0) {
        todayLogsList.innerHTML = '<div class="log-item-empty">今日暂无日志记录</div>';
        return;
    }
    
    let html = '';
    
    // 添加复制当日日志按钮
    html += `
        <div class="today-logs-header">
            <h4>当日日志 (${todayLogs.length}条)</h4>
            <button type="button" onclick="copyDateLogs('${today}')" class="copy-date-btn">复制当日日志</button>
        </div>
    `;
    
    todayLogs.forEach((log, index) => {
        html += `
            <div class="log-item" data-log-id="${log.id}">
                <input type="checkbox" class="log-item-checkbox" data-log-id="${log.id}">
                <span class="log-item-sequence">${log.sequenceNumber || 1}</span>
                <span class="log-item-date">${log.date} ${log.time}</span>
                <span class="log-item-category">${log.category}</span>
                <div class="log-item-content">${log.content}</div>
                <div class="log-item-actions">
                    <button type="button" onclick="moveLogUp('${log.id}')" class="move-btn">上移</button>
                    <button type="button" onclick="moveLogDown('${log.id}')" class="move-btn">下移</button>
                    <button type="button" onclick="copyLog('${log.id}')" class="copy-btn">复制</button>
                    <button type="button" onclick="editTodayLog('${log.id}')">编辑</button>
                    <button type="button" onclick="deleteTodayLog('${log.id}')">删除</button>
                </div>
            </div>
        `;
    });
    
    todayLogsList.innerHTML = html;
}

// 编辑当日日志
function editTodayLog(id) {
    // 复用现有的editLog函数
    editLog(id);
    // 重新显示当日日志列表
    showTodayLogs();
}

// 删除当日日志
function deleteTodayLog(id) {
    // 显示确认对话框并删除日志
    showConfirmDialog('确认删除', '确定要删除这条日志吗？', () => {
        logs = logs.filter(log => log.id !== id);
        recalculateSequenceNumbers(); // 重新计算序号
        saveToLocalStorage();
        updateDashboard();
        renderLogList();
        showTodayLogs(); // 在删除后立即更新当日日志列表
        showToast('日志已删除');
    });
}

// 上移当日日志
function moveTodayLogUp(id) {
    // 复用现有的moveLogUp函数
    moveLogUp(id);
    // 重新显示当日日志列表
    showTodayLogs();
}

// 下移当日日志
function moveTodayLogDown(id) {
    // 复用现有的moveLogDown函数
    moveLogDown(id);
    // 重新显示当日日志列表
    showTodayLogs();
}

// 复制当日日志
function copyTodayLog(id) {
    // 复用现有的copyLog函数
    copyLog(id);
}

// 重置日志表单
function resetLogForm() {
    logForm.reset();
    document.getElementById('log-id').value = '';
    document.getElementById('log-date').valueAsDate = new Date();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('log-time').value = `${hours}:${minutes}`;
    document.getElementById('submit-log').textContent = '保存日志';
    document.getElementById('cancel-edit').style.display = 'none';
    // 重置后重新显示当日日志
    showTodayLogs();
}

// 编辑日志
function editLog(id) {
    const log = logs.find(log => log.id === id);
    if (log) {
        document.getElementById('log-id').value = log.id;
        document.getElementById('log-date').value = log.date;
        document.getElementById('log-time').value = log.time;
        document.getElementById('log-content').value = log.content;
        document.getElementById('log-category').value = log.category;
        document.getElementById('log-tags').value = log.tags.join(', ');
        document.getElementById('submit-log').textContent = '更新日志';
        document.getElementById('cancel-edit').style.display = 'inline-block';
        
        // 切换到日志记录区域
        switchSection('log-entry');
        // 滚动到表单
        logForm.scrollIntoView({ behavior: 'smooth' });
        // 更新当日日志列表，确保显示编辑的日志的日期对应的日志
        showTodayLogs();
    }
}

// 删除日志
// 重新计算所有日志的序号，确保每个日期内的序号连贯
function recalculateSequenceNumbers() {
    // 按日期和时间排序
    logs.sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }
        // 对于相同日期，按原始顺序或时间排序
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    // 为每个日期的日志重新分配序号
    const dateSequenceMap = {};
    logs.forEach(log => {
        if (!dateSequenceMap[log.date]) {
            dateSequenceMap[log.date] = 1;
        }
        log.sequenceNumber = dateSequenceMap[log.date];
        dateSequenceMap[log.date]++;
    });
}

function deleteLog(id) {
    showConfirmDialog('确认删除', '确定要删除这条日志吗？', () => {
        logs = logs.filter(log => log.id !== id);
        recalculateSequenceNumbers(); // 重新计算序号
        saveToLocalStorage();
        updateDashboard();
        renderLogList();
        showTodayLogs();
        showToast('日志已删除');
    });
}

// 应用筛选
function applyFilter() {
    const keyword = document.getElementById('search-keyword').value.toLowerCase();
    const startDate = document.getElementById('filter-date-start').value;
    const endDate = document.getElementById('filter-date-end').value;
    const category = document.getElementById('filter-category').value;
    
    filteredLogs = logs.filter(log => {
        // 关键词筛选
        const matchesKeyword = !keyword || 
            log.content.toLowerCase().includes(keyword) ||
            log.tags.some(tag => tag.toLowerCase().includes(keyword));
        
        // 日期范围筛选
        const matchesDateRange = (!startDate || log.date >= startDate) && 
            (!endDate || log.date <= endDate);
        
        // 类别筛选
        const matchesCategory = !category || log.category === category;
        
        return matchesKeyword && matchesDateRange && matchesCategory;
    });
    
    currentPage = 1;
    renderLogList();
}

// 清除筛选
function clearFilter() {
    document.getElementById('search-keyword').value = '';
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    document.getElementById('filter-category').value = '';
    filteredLogs = [];
    currentPage = 1;
    renderLogList();
}

// 批量删除日志
function batchDeleteLogs() {
    const selectedCheckboxes = document.querySelectorAll('.log-item-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.logId);
    
    if (selectedIds.length === 0) return;
    
    showConfirmDialog('确认删除', `确定要删除选中的 ${selectedIds.length} 条日志吗？`, () => {
        logs = logs.filter(log => !selectedIds.includes(log.id));
        recalculateSequenceNumbers(); // 重新计算序号
        saveToLocalStorage();
        updateDashboard();
        renderLogList();
        showTodayLogs();
        showToast(`已删除 ${selectedIds.length} 条日志`);
    });
}

// 更新批量删除按钮状态
function updateBatchDeleteButton() {
    const selectedCheckboxes = document.querySelectorAll('.log-item-checkbox:checked');
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    
    batchDeleteBtn.disabled = selectedCheckboxes.length === 0;
    
    const allCheckboxes = document.querySelectorAll('.log-item-checkbox');
    const isAllSelected = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(checkbox => checkbox.checked);
    selectAllBtn.textContent = isAllSelected ? '取消全选' : '全选';
}

// 渲染日志列表
function renderLogList() {
    const displayLogs = filteredLogs.length > 0 ? filteredLogs : logs;
    
    // 按日期和序列号排序
    const sortedLogs = [...displayLogs].sort((a, b) => {
        // 首先按日期排序（降序）
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        // 对于相同日期，按序列号排序（升序）
        const seqA = a.sequenceNumber || 1;
        const seqB = b.sequenceNumber || 1;
        return seqA - seqB;
    });
    
    // 分页计算
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = sortedLogs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
    
    // 清空现有内容
    logItems.innerHTML = '';
    
    if (paginatedLogs.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无日志记录';
        logItems.appendChild(emptyMessage);
        pagination.innerHTML = '';
        return;
    }
    
    // 按日期分组，以便添加日期标题和复制按钮
    const logsByDate = {};
    paginatedLogs.forEach(log => {
        if (!logsByDate[log.date]) {
            logsByDate[log.date] = [];
        }
        logsByDate[log.date].push(log);
    });
    
    // 添加批量删除按钮区域
    const batchActions = document.createElement('div');
    batchActions.className = 'batch-actions';
    batchActions.innerHTML = `
        <div class="batch-controls">
            <button id="select-all-btn" class="select-all-btn">全选</button>
            <button id="batch-delete-btn" class="batch-delete-btn" disabled>批量删除</button>
        </div>
    `;
    logItems.appendChild(batchActions);
    
    // 为全选和批量删除按钮添加事件监听
    document.getElementById('select-all-btn').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.log-item-checkbox');
        const isAllSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const newState = !isAllSelected;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = newState;
        });
        
        // 同步更新所有日期的全选复选框状态
        const dateCheckboxes = document.querySelectorAll('.select-date-checkbox');
        dateCheckboxes.forEach(checkbox => {
            checkbox.checked = newState;
            checkbox.indeterminate = false;
        });
        
        updateBatchDeleteButton();
        this.textContent = newState ? '取消全选' : '全选';
    });
    
    document.getElementById('batch-delete-btn').addEventListener('click', batchDeleteLogs);
    
    // 渲染按日期分组的日志
    Object.keys(logsByDate).forEach(date => {
        const dateLogs = logsByDate[date];
        
        // 创建日期标题行
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        
        // 格式化日期为 YYYY.MM.DD
        const formattedDateHeader = date.replace(/-/g, '.');
        
        // 获取星期几
        const dateObj = new Date(date);
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[dateObj.getDay()];
        
        dateHeader.innerHTML = `
            <div class="date-header-left">
                <input type="checkbox" class="select-date-checkbox" data-date="${date}" id="select-date-${date}">
                <label for="select-date-${date}"><h3>${formattedDateHeader} <span class="weekday">${weekday}</span></h3></label>
            </div>
            <div class="date-header-actions">
                <button type="button" onclick="copyDateLogs('${date}')" class="copy-date-btn">复制当日日志</button>
                <button type="button" onclick="deleteDateLogs('${date}')" class="delete-date-btn">删除当日日志</button>
            </div>
        `;
        logItems.appendChild(dateHeader);
        
        // 为日期全选复选框添加事件监听
        const dateCheckbox = dateHeader.querySelector('.select-date-checkbox');
        dateCheckbox.addEventListener('change', function() {
            const date = this.dataset.date;
            const isChecked = this.checked;
            
            // 选中或取消选中该日期的所有日志复选框
            const dateLogsContainer = dateHeader.nextElementSibling;
            const logCheckboxes = dateLogsContainer.querySelectorAll('.log-item-checkbox');
            
            logCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            
            // 更新批量删除按钮状态
            updateBatchDeleteButton();
            
            // 更新全选按钮状态
            const allCheckboxes = document.querySelectorAll('.log-item-checkbox');
            const isAllSelected = Array.from(allCheckboxes).every(checkbox => checkbox.checked);
            const selectAllBtn = document.getElementById('select-all-btn');
            if (selectAllBtn) {
                selectAllBtn.textContent = isAllSelected ? '取消全选' : '全选';
            }
        });
        
        // 创建日期组容器，将同一天的日志放在一个框内
        const dateLogsContainer = document.createElement('div');
        dateLogsContainer.className = 'date-logs-container';
        logItems.appendChild(dateLogsContainer);
        
        // 渲染该日期的所有日志条目
        dateLogs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            
            // 检查是否为当天的日志
            const today = new Date().toISOString().split('T')[0];
            const isToday = log.date === today;
            if (isToday) {
                logItem.classList.add('today-log');
            }
            
            logItem.dataset.logId = log.id;
            logItem.dataset.date = log.date;
            
            const formattedDate = formatDate(log.date, log.time);
            const sequenceNumber = log.sequenceNumber || 1;
            
            const categoryElement = log.category ? `<span class="log-item-category">${log.category}</span>` : '';
            
            logItem.innerHTML = `
                <input type="checkbox" class="log-item-checkbox" data-log-id="${log.id}">
                <span class="log-item-sequence">${sequenceNumber}</span>
                <span class="log-item-date">${formattedDate}</span>
                ${categoryElement}
                <div class="log-item-content">${log.content}</div>
                ${log.tags.length > 0 ? `
                    <div class="log-item-tags">
                        ${log.tags.map(tag => `<span class="log-item-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="log-item-actions">
                    <button type="button" onclick="moveLogUp('${log.id}')" class="move-btn">上移</button>
                    <button type="button" onclick="moveLogDown('${log.id}')" class="move-btn">下移</button>
                    <button type="button" onclick="copyLog('${log.id}')" class="copy-btn">复制</button>
                    <button type="button" onclick="editLog('${log.id}')">编辑</button>
                    <button type="button" onclick="deleteLog('${log.id}')">删除</button>
                </div>
            `;
            
            dateLogsContainer.appendChild(logItem);
            
            // 为复选框添加事件监听
            const checkbox = logItem.querySelector('.log-item-checkbox');
            checkbox.addEventListener('change', function() {
                updateBatchDeleteButton();
                
                // 更新对应日期的全选复选框状态
                const logDate = logItem.dataset.date;
                const dateCheckbox = document.querySelector(`.select-date-checkbox[data-date="${logDate}"]`);
                if (dateCheckbox) {
                    const dateLogsContainer = logItem.closest('.date-logs-container');
                    const logCheckboxes = dateLogsContainer.querySelectorAll('.log-item-checkbox');
                    const allChecked = Array.from(logCheckboxes).every(cb => cb.checked);
                    const anyChecked = Array.from(logCheckboxes).some(cb => cb.checked);
                    
                    dateCheckbox.checked = allChecked;
                    dateCheckbox.indeterminate = anyChecked && !allChecked;
                }
            });
        });
    });
    
    // 渲染分页
    renderPagination(totalPages);
}

// 复制单条日志
function copyLog(logId) {
    const log = logs.find(log => log.id === logId);
    if (!log) return;
    
    const sequenceNumber = log.sequenceNumber || 1;
    const content = `${sequenceNumber}.${log.content}`;
    
    navigator.clipboard.writeText(content).then(() => {
        showToast('日志已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制', 'error');
    });
}

// 复制当日所有日志
function copyDateLogs(date) {
    // 获取该日期的所有日志并按序列号排序
    const dateLogs = logs
        .filter(log => log.date === date)
        .sort((a, b) => (a.sequenceNumber || 1) - (b.sequenceNumber || 1));
    
    if (dateLogs.length === 0) return;
    
    // 格式化日期为 YYYY.MM.DD
    const formattedDate = date.replace(/-/g, '.');
    
    // 构建复制内容，格式为：2025.11.14公司名称 + 换行 + 日志条目
    let copyContent = `${formattedDate}${companyName}\n`;
    
    dateLogs.forEach((log, index) => {
        const sequenceNumber = index + 1; // 使用顺序索引而不是可能存在的序列号
        if (index === dateLogs.length - 1) {
            // 最后一条日志，添加句号
            copyContent += `${sequenceNumber}.${log.content}。`;
        } else {
            // 非最后一条日志，添加分号和换行
            copyContent += `${sequenceNumber}.${log.content}；\n`;
        }
    });
    
    navigator.clipboard.writeText(copyContent).then(() => {
        showToast('当日日志已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制', 'error');
    });
}

// 删除当日所有日志
function deleteDateLogs(date) {
    // 获取该日期的日志数量
    const dateLogsCount = logs.filter(log => log.date === date).length;
    if (dateLogsCount === 0) {
        showToast('该日期没有日志可删除', 'warning');
        return;
    }
    
    // 显示确认对话框
    showConfirmDialog(
        '确认删除当日日志',
        `确定要删除 ${dateLogsCount} 条日志吗？此操作不可恢复！`,
        () => {
            // 删除该日期的所有日志
            logs = logs.filter(log => log.date !== date);
            
            // 重新计算序列号
            recalculateSequenceNumbers();
            
            // 保存到本地存储
            saveToLocalStorage();
            
            // 更新界面
            updateDashboard();
            renderLogList();
            showTodayLogs();
            
            // 显示成功消息
            showToast(`已删除 ${dateLogsCount} 条日志`, 'success');
        }
    );
}

// 上移日志条目
function moveLogUp(logId) {
    const logIndex = logs.findIndex(log => log.id === logId);
    if (logIndex === -1) return;
    
    const currentLog = logs[logIndex];
    const currentDate = currentLog.date;
    const currentSeq = currentLog.sequenceNumber || 1;
    
    // 查找相同日期的所有日志
    const sameDateLogs = logs.filter(log => log.date === currentDate);
    
    // 按序列号排序
    sameDateLogs.sort((a, b) => (a.sequenceNumber || 1) - (b.sequenceNumber || 1));
    
    // 找到当前日志在相同日期日志中的索引
    const sameDateIndex = sameDateLogs.findIndex(log => log.id === logId);
    
    // 如果不是第一条，则可以上移
    if (sameDateIndex > 0) {
        const prevLog = sameDateLogs[sameDateIndex - 1];
        const prevSeq = prevLog.sequenceNumber || 1;
        
        // 交换序列号
        currentLog.sequenceNumber = prevSeq;
        prevLog.sequenceNumber = currentSeq;
        
        saveToLocalStorage();
        renderLogList();
        showTodayLogs();
        showToast('日志已上移');
    }
}

// 下移日志条目
function moveLogDown(logId) {
    const logIndex = logs.findIndex(log => log.id === logId);
    if (logIndex === -1) return;
    
    const currentLog = logs[logIndex];
    const currentDate = currentLog.date;
    const currentSeq = currentLog.sequenceNumber || 1;
    
    // 查找相同日期的所有日志
    const sameDateLogs = logs.filter(log => log.date === currentDate);
    
    // 按序列号排序
    sameDateLogs.sort((a, b) => (a.sequenceNumber || 1) - (b.sequenceNumber || 1));
    
    // 找到当前日志在相同日期日志中的索引
    const sameDateIndex = sameDateLogs.findIndex(log => log.id === logId);
    
    // 如果不是最后一条，则可以下移
    if (sameDateIndex < sameDateLogs.length - 1) {
        const nextLog = sameDateLogs[sameDateIndex + 1];
        const nextSeq = nextLog.sequenceNumber || 1;
        
        // 交换序列号
        currentLog.sequenceNumber = nextSeq;
        nextLog.sequenceNumber = currentSeq;
        
        saveToLocalStorage();
        renderLogList();
        showTodayLogs();
        showToast('日志已下移');
    }
}

// 格式化日期
function formatDate(dateStr, timeStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${timeStr}`;
}

// 渲染分页控件
function renderPagination(totalPages) {
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // 上一页按钮
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLogList();
        }
    });
    pagination.appendChild(prevBtn);
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderLogList();
        });
        pagination.appendChild(pageBtn);
    }
    
    // 下一页按钮
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderLogList();
        }
    });
    pagination.appendChild(nextBtn);
}

// 更新仪表盘数据
function updateDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);
    const yearStr = todayStr.substring(0, 4);
    
    // 今日日志数
    const todayLogs = logs.filter(log => log.date === todayStr);
    if (todayCount) todayCount.textContent = todayLogs.length;
    
    // 本月日志数
    const monthLogs = logs.filter(log => log.date.startsWith(monthStr));
    if (monthCount) monthCount.textContent = monthLogs.length;
    
    // 本年日志数
    const yearLogs = logs.filter(log => log.date.startsWith(yearStr));
    if (yearCount) yearCount.textContent = yearLogs.length;
    
    // 总日志数
    if (totalCount) totalCount.textContent = logs.length;
}

// 初始化图表
let logChart;
function initChart() {
    // 确保Chart对象已定义
    if (typeof Chart === 'undefined') {
        console.error('Chart.js未加载，请检查网络连接或CDN链接');
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML += '<p class="error-message">图表加载失败，请刷新页面重试</p>';
        }
        return;
    }
    
    const logChartCanvas = document.getElementById('logChart');
    if (!logChartCanvas) {
        console.error('未找到图表Canvas元素');
        return;
    }
    
    const ctx = logChartCanvas.getContext('2d');
    logChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '日志数量',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '最近7天日志统计',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    
    updateChart();
}

// 更新图表数据
function updateChart() {
    // 确保logChart已初始化
    if (!logChart) {
        console.warn('图表未初始化，请先调用initChart');
        return;
    }
    
    const labels = [];
    const data = [];
    const today = new Date();
    
    // 根据当前时间范围生成数据
    if (currentTimeRange === 365) {
        // 最近一年，按月统计
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(today.getMonth() - i);
            date.setDate(1);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const monthStr = `${year}-${month}`;
            const formattedDate = `${year}-${month}`;
            
            labels.push(formattedDate);
            // 统计当月的日志数量
            const monthLogs = logs.filter(log => log.date.startsWith(monthStr));
            data.push(monthLogs.length);
        }
    } else {
        // 最近7天或30天，按天统计
        for (let i = currentTimeRange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            labels.push(formattedDate);
            // 统计当天的日志数量
            const dayLogs = logs.filter(log => log.date === dateStr);
            data.push(dayLogs.length);
        }
    }
    
    // 更新图表数据
    logChart.data.labels = labels;
    logChart.data.datasets[0].data = data;
    
    // 更新图表标题
    let chartTitle = '';
    switch(currentTimeRange) {
        case 7:
            chartTitle = '最近7天日志统计';
            break;
        case 30:
            chartTitle = '最近30天日志统计';
            break;
        case 365:
            chartTitle = '最近一年日志统计';
            break;
    }
    logChart.options.plugins.title.text = chartTitle;
    
    logChart.update();
    console.log('图表数据已更新:', { labels, data, currentTimeRange });
}

// 切换统计标签页
function switchStatsTab(tabId) {
    // 更新标签按钮样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabId}-stats`).style.display = 'block';
    
    // 自动触发对应统计函数
    switch(tabId) {
        case 'daily':
            showDailyStats();
            break;
        case 'monthly':
            showMonthlyStats();
            break;
        case 'yearly':
            showYearlyStats();
            break;
        case 'category':
            showCategoryStats();
            break;
        case 'common':
            showCommonStats();
            break;
    }
}

// 显示每日统计
function showDailyStats() {
    const date = document.getElementById('daily-stats-date').value;
    if (!date) {
        showToast('请选择日期', 'warning');
        return;
    }
    
    const resultDiv = document.getElementById('daily-stats-result');
    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // 模拟加载延迟，提升用户体验
    setTimeout(() => {
        const dayLogs = logs.filter(log => log.date === date);
        
        if (dayLogs.length === 0) {
            resultDiv.innerHTML = '<div class="empty-state"><p>该日期没有日志记录</p></div>';
            return;
        }
        
        // 按类别统计
        const categoryStats = {};
        dayLogs.forEach(log => {
            categoryStats[log.category] = (categoryStats[log.category] || 0) + 1;
        });
        

        
        // 格式化日期显示
        const dateObj = new Date(date);
        const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[dateObj.getDay()];
        
        // 准备类别数据用于图表
        const categories = Object.keys(categoryStats);
        const categoryCounts = Object.values(categoryStats);
        
        let html = `
            <div class="daily-stats-container">
                <div class="stats-header">
                    <h3>${formattedDate} <span class="weekday">${weekday}</span></h3>
                    <div class="date-badge">${date}</div>
                </div>
                
                <!-- 统计概览卡片 -->
                <div class="stats-overview-cards">
                    <div class="stat-card daily">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <div class="stat-label">日志总数</div>
                            <div class="stat-number">${dayLogs.length}</div>
                            <div class="stat-unit">条</div>
                        </div>
                    </div>

                    <div class="stat-card category">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-label">类别数量</div>
                            <div class="stat-number">${categories.length}</div>
                            <div class="stat-unit">个</div>
                        </div>
                    </div>
                </div>
                
                <!-- 类别分布 -->
                <div class="category-distribution">
                    <h4>类别分布</h4>
                    <div class="category-list">
        `;
        
        // 计算每个类别的百分比
        for (const [category, count] of Object.entries(categoryStats)) {
            const percentage = Math.round((count / dayLogs.length) * 100);
            html += `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-count">
                        <span class="stats-value">${count}</span> 条 (${percentage}%)
                    </div>
                </div>
            `;
        }
        
        html += `
                    </div>
                </div>
                

            </div>
        `;
        
        resultDiv.innerHTML = html;
        
        // 创建类别分布图表
        const canvas = document.getElementById('dailyCategoryChart');
        
        // 确保canvas元素存在
        if (canvas) {
            // 销毁现有图表
            if (window.dailyCategoryChart) {
                window.dailyCategoryChart.destroy();
            }
            
            // 获取canvas上下文
            const ctx = canvas.getContext('2d');
            
            // 确保Chart对象可用
            if (typeof Chart !== 'undefined') {
                // 创建新图表
                window.dailyCategoryChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: categories,
                        datasets: [{
                            data: categoryCounts,
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(139, 92, 246, 0.8)',
                                'rgba(236, 72, 153, 0.8)'
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const percentage = Math.round((value / dayLogs.length) * 100);
                                        return `${label}: ${value} 条 (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '70%',
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                });
            }
        }
    }, 300);
}

// 显示每月统计
function showMonthlyStats() {
    const year = document.getElementById('monthly-stats-year').value;
    if (!year) {
        showToast('请输入年份', 'warning');
        return;
    }
    
    const resultDiv = document.getElementById('monthly-stats-result');
    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // 模拟加载延迟
    setTimeout(() => {
        // 获取该年每个月的日志数量
        const monthStats = new Array(12).fill(0);
        const yearStr = year.toString();
        
        logs.forEach(log => {
            if (log.date.startsWith(yearStr)) {
                const month = parseInt(log.date.substring(5, 7)) - 1;
                monthStats[month]++;
            }
        });
        
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        
        let html = `<h4>${year}年 每月日志统计</h4><ul>`;
        let total = 0;
        
        monthStats.forEach((count, index) => {
            total += count;
            html += `<li>${monthNames[index]}: <span class="stats-value">${count}</span> 条</li>`;
        });
        
        html += `</ul><p>年度总计：<span class="stats-value">${total}</span> 条</p>`;
        resultDiv.innerHTML = html;
        

    }, 300);
}



// 显示每年统计
function showYearlyStats() {
    const startYear = parseInt(document.getElementById('yearly-stats-start').value);
    const endYear = parseInt(document.getElementById('yearly-stats-end').value);
    
    if (!startYear || !endYear || startYear > endYear) {
        showToast('请输入有效的年份范围', 'warning');
        return;
    }
    
    const resultDiv = document.getElementById('yearly-stats-result');
    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // 模拟加载延迟
    setTimeout(() => {
        const yearStats = {};
        for (let year = startYear; year <= endYear; year++) {
            yearStats[year] = 0;
        }
        
        logs.forEach(log => {
            const logYear = parseInt(log.date.substring(0, 4));
            if (logYear >= startYear && logYear <= endYear) {
                yearStats[logYear]++;
            }
        });
        
        let html = `<h4>${startYear}-${endYear}年 日志统计</h4><ul>`;
        let total = 0;
        
        for (const [year, count] of Object.entries(yearStats)) {
            total += count;
            html += `<li>${year}年: <span class="stats-value">${count}</span> 条</li>`;
        }
        
        html += `</ul><p>期间总计：<span class="stats-value">${total}</span> 条</p>`;
        resultDiv.innerHTML = html;
        

    }, 300);
}



// 显示类别统计
function showCategoryStats() {
    const period = document.getElementById('category-stats-period').value;
    const resultDiv = document.getElementById('category-stats-result');
    
    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // 模拟加载延迟
    setTimeout(() => {
        let periodLogs = logs;
        
        // 根据选择的周期筛选日志
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yearStr = todayStr.substring(0, 4);
        const monthStr = todayStr.substring(0, 7);
        
        switch (period) {
            case 'today':
                periodLogs = logs.filter(log => log.date === todayStr);
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                periodLogs = logs.filter(log => log.date >= weekAgoStr);
                break;
            case 'month':
                periodLogs = logs.filter(log => log.date.startsWith(monthStr));
                break;
            case 'year':
                periodLogs = logs.filter(log => log.date.startsWith(yearStr));
                break;
        }
        
        if (periodLogs.length === 0) {
            resultDiv.innerHTML = '<p>该时间段没有日志记录</p>';
            return;
        }
        
        // 按类别统计
        const categoryStats = {};
        periodLogs.forEach(log => {
            categoryStats[log.category] = (categoryStats[log.category] || 0) + 1;
        });
        
        let html = `<h4>${getPeriodText(period)} 类别分布</h4>
                    <p>总计日志：<span class="stats-value">${periodLogs.length}</span> 条</p>
                    
                    <!-- 类别列表 -->
                    <div class="category-list">`;
        
        for (const [category, count] of Object.entries(categoryStats)) {
            const percentage = Math.round((count / periodLogs.length) * 100);
            html += `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-count">
                        <span class="stats-value">${count}</span> 条 (${percentage}%)
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        resultDiv.innerHTML = html;
        
        // 更新图表
        updateCategoryChart(Object.values(categoryStats), Object.keys(categoryStats));
    }, 300);
}

// 获取周期文本
function getPeriodText(period) {
    const texts = {
        today: '今日',
        week: '本周',
        month: '本月',
        year: '本年',
        all: '全部'
    };
    return texts[period] || period;
}

// 显示常用日志统计
function showCommonStats() {
    const period = document.getElementById('common-stats-period').value;
    const resultDiv = document.getElementById('common-stats-result');
    
    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // 模拟加载延迟
    setTimeout(() => {
        let periodLogs = logs;
        
        // 根据选择的周期筛选日志
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yearStr = todayStr.substring(0, 4);
        const monthStr = todayStr.substring(0, 7);
        
        switch (period) {
            case 'today':
                periodLogs = logs.filter(log => log.date === todayStr);
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                periodLogs = logs.filter(log => log.date >= weekAgoStr);
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                const monthAgoStr = monthAgo.toISOString().split('T')[0];
                periodLogs = logs.filter(log => log.date >= monthAgoStr);
                break;
            case 'year':
                periodLogs = logs.filter(log => log.date.startsWith(yearStr));
                break;
        }
        
        if (periodLogs.length === 0) {
            resultDiv.innerHTML = '<p>该时间段没有日志记录</p>';
            return;
        }
        
        // 统计每条日志内容出现的频率
        const contentStats = {};
        periodLogs.forEach(log => {
            const content = log.content.trim();
            if (content) {
                contentStats[content] = (contentStats[content] || 0) + 1;
            }
        });
        
        // 转换为数组并按频率排序
        const sortedContentStats = Object.entries(contentStats)
            .map(([content, count]) => ({ content, count }))
            .sort((a, b) => b.count - a.count);
        
        // 取前20条最常用的日志
        const topCommonLogs = sortedContentStats.slice(0, 20);
        
        let html = `<h4>${getPeriodText(period)} 最常用日志</h4>
                    <p>总计日志：<span class="stats-value">${periodLogs.length}</span> 条，去重后：<span class="stats-value">${sortedContentStats.length}</span> 条
                    
                    <!-- 常用日志列表 -->
                    <div class="common-stats-list">`;
        
        topCommonLogs.forEach((item, index) => {
            const percentage = Math.round((item.count / periodLogs.length) * 100);
            const isAlreadyInCommonLogs = commonLogs.some(log => log.content === item.content);
            const escapedContent = item.content.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
            
            html += `
                <div class="common-stats-item">
                    <div class="common-stats-rank">${index + 1}</div>
                    <div class="common-stats-content">
                        <div class="common-stats-text">${item.content}</div>
                        <div class="common-stats-meta">
                            <span class="common-stats-count">
                                <span class="stats-value">${item.count}</span> 次
                            </span>
                            <span class="common-stats-percentage">(${percentage}%)</span>
                        </div>
                    </div>
                    <div class="common-stats-bar">
                        <div class="common-stats-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <button type="button" 
                            onclick="addToCommonLogsFromStats('${escapedContent}')"
                            class="add-to-common-btn"
                            ${isAlreadyInCommonLogs ? 'disabled' : ''}>
                        ${isAlreadyInCommonLogs ? '已添加' : '添加'}
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
        resultDiv.innerHTML = html;
    }, 300);
}


// 更新类别统计图表
function updateCategoryChart(data, labels) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // 销毁现有图表
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(56, 161, 105, 0.7)',
                        'rgba(229, 62, 62, 0.7)',
                        'rgba(250, 204, 21, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(236, 72, 153, 0.7)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(56, 161, 105, 1)',
                        'rgba(229, 62, 62, 1)',
                        'rgba(250, 204, 21, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(236, 72, 153, 1)'
                    ],
                    borderWidth: 1
                }]
            },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '类别分布统计',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} 条 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 导出为CSV
function exportToCSV() {
    if (logs.length === 0) {
        showToast('没有数据可导出', 'warning');
        return;
    }
    
    // CSV头部
    const headers = ['日期', '时间', '内容', '类别', '标签'];
    const csvContent = [];
    csvContent.push(headers.join(','));
    
    // 添加数据行
    logs.forEach(log => {
        const row = [
            log.date,
            log.time,
            `"${log.content.replace(/"/g, '""')}"`, // 转义双引号
            log.category,
            `"${log.tags.join(', ').replace(/"/g, '""')}"`
        ];
        csvContent.push(row.join(','));
    });
    
    // 创建并下载文件
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `工作日志_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('CSV文件导出成功');
}

function exportAllToWord() {
    if (logs.length === 0) {
        showToast('没有数据可导出', 'warning');
        return;
    }
    
    // 按日期分组并排序所有日志
    const dateGroups = {};
    
    // 收集所有日期
    logs.forEach(log => {
        if (!dateGroups[log.date]) {
            dateGroups[log.date] = [];
        }
        dateGroups[log.date].push(log);
    });
    
    // 获取所有日期并排序（最新的在前）
    const sortedDates = Object.keys(dateGroups).sort((a, b) => 
        new Date(b) - new Date(a)
    );
    
    // 创建纯文本内容
    let textContent = '';
    
    // 添加公司名称和标题
    textContent += companyName + '工作日志汇总\n\n';
    
    // 按日期处理每组日志
    sortedDates.forEach(date => {
        const dateLogs = dateGroups[date].sort((a, b) => 
            (a.sequenceNumber || 1) - (b.sequenceNumber || 1)
        );
        
        // 格式化日期并添加日期标题
        const formattedDate = date.replace(/-/g, '.');
        textContent += formattedDate + '\n';
        
        // 添加每条日志
        dateLogs.forEach((log, index) => {
            const sequenceNumber = index + 1;
            textContent += sequenceNumber + '.' + log.content + '；\n';
        });
        
        // 每个日期后添加空行
        textContent += '\n';
    });
    
    // 创建Blob并下载
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '工作日志汇总_' + new Date().toISOString().split('T')[0] + '.txt');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('日志导出成功', 'success');
    }, 100);
}



// 格式化日期显示
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// 从CSV导入
function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showToast('CSV文件格式错误，没有数据行', 'error');
                return;
            }
            
            // 跳过头部行
            const dataLines = lines.slice(1);
            const importedLogs = [];
            
            // 先将所有日志添加到数组中
            dataLines.forEach(line => {
                // 简单的CSV解析，处理引号内的逗号
                const cells = parseCSVLine(line);
                if (cells.length >= 4) {
                    const newLog = {
                        id: generateId(),
                        date: cells[0],
                        time: cells[1],
                        content: cells[2],
                        category: cells[3],
                        tags: cells[4] ? cells[4].split(',').map(tag => tag.trim()) : [],
                        timestamp: new Date(`${cells[0]}T${cells[1]}`).getTime(),
                        created: new Date().getTime()
                    };
                    importedLogs.push(newLog);
                }
            });
            
            // 按日期和时间排序，然后为每个日期分配正确的序列号
            importedLogs.sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.time.localeCompare(b.time);
            });
            
            // 为每个日期的日志分配递增的序列号
            const dateSequenceMap = {};
            importedLogs.forEach(log => {
                if (!dateSequenceMap[log.date]) {
                    dateSequenceMap[log.date] = 1;
                }
                log.sequenceNumber = dateSequenceMap[log.date];
                dateSequenceMap[log.date]++;
            });
            
            if (importedLogs.length > 0) {
                // 添加导入的数据
                logs = [...importedLogs, ...logs];
                saveToLocalStorage();
                updateDashboard();
                renderLogList();
                showToast(`成功导入 ${importedLogs.length} 条日志`);
                
                // 显示导入结果
                const importResult = document.getElementById('import-result');
                importResult.className = 'import-result success';
                importResult.textContent = `成功导入 ${importedLogs.length} 条日志`;
                setTimeout(() => {
                    importResult.textContent = '';
                }, 3000);
            } else {
                showToast('没有成功导入任何数据', 'warning');
            }
            
            // 清空文件输入，允许重新选择同一文件
            event.target.value = '';
        } catch (error) {
            console.error('导入CSV失败:', error);
            showToast('导入失败，请检查文件格式', 'error');
        }
    };
    reader.readAsText(file, 'UTF-8');
}

// 简单的CSV行解析
function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // 处理双引号转义
                current += '"';
                i++; // 跳过下一个引号
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    cells.push(current.trim());
    return cells;
}

// 清空所有数据
function clearAllData() {
    logs = [];
    saveToLocalStorage();
    updateDashboard();
    renderLogList();
    showSuccessDialog('数据操作成功', '所有数据已清空');
}

// 确认对话框
let confirmCallback = null;

function showConfirmDialog(title, message, callback) {
    console.log('显示确认对话框:', { title, message });
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = callback;
    confirmDialog.style.display = 'flex';
}

function confirmYes() {
    if (confirmCallback) {
        confirmCallback();
    }
    confirmDialog.style.display = 'none';
    confirmCallback = null;
}

function confirmNo() {
    confirmDialog.style.display = 'none';
    confirmCallback = null;
}

// 显示消息提示
function showSuccessDialog(title, message) {
    const successDialog = document.getElementById('success-dialog');
    const successTitle = document.getElementById('success-title');
    const successMessage = document.getElementById('success-message');
    const successOkBtn = document.getElementById('success-ok');
    
    if (!successDialog || !successTitle || !successMessage || !successOkBtn) {
        console.warn('成功对话框元素未找到');
        return;
    }
    
    successTitle.textContent = title;
    successMessage.textContent = message;
    successDialog.style.display = 'flex';
    
    // 移除之前的事件监听器（如果有）
    const newOkBtn = successOkBtn.cloneNode(true);
    successOkBtn.parentNode.replaceChild(newOkBtn, successOkBtn);
    
    // 添加确定按钮点击事件
    newOkBtn.addEventListener('click', () => {
        successDialog.style.display = 'none';
    });
}

function showToast(message, type = 'success') {
    // 检查元素是否存在
    if (!toast || !toastMessage) {
        console.warn('提示元素未找到，无法显示消息:', message);
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.style.display = 'block';
    
    setTimeout(() => {
        if (toast) {
            toast.style.display = 'none';
        }
    }, 3000);
}

// 暴露函数到全局
window.editLog = editLog;
window.deleteLog = deleteLog;
window.moveLogUp = moveLogUp;
window.moveLogDown = moveLogDown;
window.copyLog = copyLog;
window.copyDateLogs = copyDateLogs;
window.batchDeleteLogs = batchDeleteLogs;
window.updateBatchDeleteButton = updateBatchDeleteButton;
window.saveCompanyName = saveCompanyName;
window.exportAllToWord = exportAllToWord;
window.addToCommonLogsFromStats = addToCommonLogsFromStats;
window.editCommonLog = editCommonLog;
window.deleteCommonLogConfirm = deleteCommonLogConfirm;
window.moveCommonLogUp = moveCommonLogUp;
window.moveCommonLogDown = moveCommonLogDown;

// 处理添加常用日志
function handleAddCommonLog() {
    const contentInput = document.getElementById('new-common-log-content');
    const categoryInput = document.getElementById('new-common-log-category');
    const tagsInput = document.getElementById('new-common-log-tags');
    
    const content = contentInput.value.trim();
    const category = categoryInput.value;
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (!content) {
        showToast('请输入日志内容', 'warning');
        return;
    }
    
    addCommonLog(content, category, tags);
    
    // 清空输入框
    contentInput.value = '';
    tagsInput.value = '';
    
    // 重新渲染列表
    renderCommonLogsList();
    
    // 更新日志记录页面的下拉列表
    initCommonLogsSelect();
    
    showToast('常用日志添加成功');
}

// 渲染常用日志列表
function renderCommonLogsList() {
    const commonLogsList = document.getElementById('common-logs-list');
    if (!commonLogsList) return;
    
    if (commonLogs.length === 0) {
        commonLogsList.innerHTML = '<div class="empty-message">暂无常用日志</div>';
        return;
    }
    
    let html = '<div class="common-logs-items">';
    
    commonLogs.forEach((commonLog, index) => {
        html += `
            <div class="common-log-item" data-id="${commonLog.id}">
                <div class="common-log-content">
                    <div class="common-log-text">${commonLog.content}</div>
                    <div class="common-log-meta">
                        <span class="common-log-category">${commonLog.category}</span>
                        ${commonLog.tags.length > 0 ? `
                            <span class="common-log-tags">${commonLog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="common-log-actions">
                    <button type="button" onclick="moveCommonLogUp('${commonLog.id}')" class="move-btn" ${index === 0 ? 'disabled' : ''}>上移</button>
                    <button type="button" onclick="moveCommonLogDown('${commonLog.id}')" class="move-btn" ${index === commonLogs.length - 1 ? 'disabled' : ''}>下移</button>
                    <button type="button" onclick="editCommonLog('${commonLog.id}')" class="edit-btn">编辑</button>
                    <button type="button" onclick="deleteCommonLogConfirm('${commonLog.id}')" class="delete-btn">删除</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    commonLogsList.innerHTML = html;
}

// 编辑常用日志
function editCommonLog(id) {
    const commonLog = commonLogs.find(log => log.id === id);
    if (!commonLog) return;
    
    const contentInput = document.getElementById('new-common-log-content');
    const categoryInput = document.getElementById('new-common-log-category');
    const tagsInput = document.getElementById('new-common-log-tags');
    
    contentInput.value = commonLog.content;
    categoryInput.value = commonLog.category;
    tagsInput.value = commonLog.tags.join(', ');
    
    // 更改按钮为更新模式
    const addBtn = document.getElementById('add-common-log');
    addBtn.textContent = '更新';
    addBtn.dataset.editId = id;
    
    // 移除旧的事件监听器
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    
    newBtn.addEventListener('click', function() {
        const editId = this.dataset.editId;
        const content = contentInput.value.trim();
        const category = categoryInput.value;
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!content) {
            showToast('请输入日志内容', 'warning');
            return;
        }
        
        updateCommonLog(editId, content, category, tags);
        
        // 清空输入框
        contentInput.value = '';
        tagsInput.value = '';
        
        // 重置按钮为添加模式
        this.textContent = '添加';
        delete this.dataset.editId;
        
        // 重新渲染列表
        renderCommonLogsList();
        
        // 更新日志记录页面的下拉列表
        initCommonLogsSelect();
        
        showToast('常用日志更新成功');
    });
}

// 删除常用日志确认
function deleteCommonLogConfirm(id) {
    const commonLog = commonLogs.find(log => log.id === id);
    if (!commonLog) return;
    
    showConfirmDialog('确认删除', `确定要删除常用日志"${commonLog.content.substring(0, 30)}..."吗？`, () => {
        deleteCommonLog(id);
        renderCommonLogsList();
        initCommonLogsSelect();
        showToast('常用日志已删除');
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);