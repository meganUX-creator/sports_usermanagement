const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

// Replace the detailsLogin HTML
content = content.replace(
    /<div style="margin-top: 16px; padding: 12px 24px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">[\s\S]*?點擊展開右側明細<\/div>\n                <\/div>/,
    `<div id="rowIpLoginCount" style="margin-top: 16px; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; border: 1px solid transparent; transition: all 0.2s;">
                    <div style="font-size: 14px; color: var(--text-muted);">
                        同IP登錄人數: <a href="#" onclick="openDetailedContentDrawer(event, 'ip')" style="font-size: 18px; font-weight: 600; color: #3b82f6; text-decoration: underline;">4,703 <i class="ph ph-arrow-square-out" style="font-size: 16px;"></i></a>
                    </div>
                    <div id="btnIpExpand" style="display: none;">
                        <button class="btn btn-primary" onclick="openDetailedContentDrawer(event, 'ip')" style="background-color: #6366f1; border: none; border-radius: 16px; padding: 4px 12px; font-size: 13px;">展開中 &gt;</button>
                    </div>
                    <div id="hintIpExpand" style="font-size: 13px; color: #94a3b8; display: block;">點擊展開右側明細</div>
                </div>
                
                <div id="rowDeviceLoginCount" style="margin-top: 8px; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; border: 1px solid transparent; transition: all 0.2s;">
                    <div style="font-size: 14px; color: var(--text-muted);">
                        同設備登錄人數: <a href="#" onclick="openDetailedContentDrawer(event, 'device')" style="font-size: 18px; font-weight: 600; color: #3b82f6; text-decoration: underline;">28 <i class="ph ph-arrow-square-out" style="font-size: 16px;"></i></a>
                    </div>
                    <div id="btnDeviceExpand" style="display: none;">
                        <button class="btn btn-primary" onclick="openDetailedContentDrawer(event, 'device')" style="background-color: #6366f1; border: none; border-radius: 16px; padding: 4px 12px; font-size: 13px;">展開中 &gt;</button>
                    </div>
                    <div id="hintDeviceExpand" style="font-size: 13px; color: #94a3b8; display: block;">點擊展開右側明細</div>
                </div>`
);

// Replace the openDetailedContentDrawer function logic
const newFunc = `window.openDetailedContentDrawer = function(e, type) {
        e.preventDefault();
        const userDetailsDrawer = document.getElementById('userDetailsDrawer');
        const expandPanel = document.getElementById('detailsExpandPanel');
        const contentDiv = document.getElementById('detailsExpandContent');
        
        if (!userDetailsDrawer || !expandPanel || !contentDiv) return;
        
        // Reset both rows
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
        
        // Highlight active
        const activeRow = type === 'ip' ? rowIp : rowDevice;
        const activeBtn = type === 'ip' ? btnIp : btnDevice;
        const activeHint = type === 'ip' ? hintIp : hintDevice;
        
        if (activeRow) {
            activeRow.style.background = '#f0fdf4';
            activeRow.style.borderColor = '#bbf7d0';
            if (activeBtn) activeBtn.style.display = 'block';
            if (activeHint) activeHint.style.display = 'none';
        }
        
        // Expand width
        userDetailsDrawer.style.maxWidth = '98vw';
        userDetailsDrawer.style.width = '1660px'; // 960 + 700
        expandPanel.style.display = 'flex';
        
        // Render table
        contentDiv.innerHTML = \`
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
                    \${['megan002', 'player_888', 'vip_king99', 'lucky_star7', 'test_user_01', 'dragon_99', 'win_master'].map((u, i) => \`
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px;">\${u}</td>
                            <td style="padding: 16px; font-family: monospace;">2026-07-28<br>\${String(16 - i).padStart(2, '0')}:\${String(30 - i*2).padStart(2, '0')}:\${String(42 + i*3).padStart(2, '0')}</td>
                            <td style="padding: 16px; font-family: monospace; color: #475569;">54.150.111.152 <i class="ph ph-copy" style="color: #94a3b8; cursor: pointer;"></i></td>
                            <td style="padding: 16px; color: #64748b;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo,<br>Tokyo</td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        \`;
    };`;

content = content.replace(/window\.openDetailedContentDrawer = function[\s\S]*?<\/[tT]able>\\n        `;\n    };/m, newFunc);

fs.writeFileSync('script.js', content, 'utf8');
ㄕ