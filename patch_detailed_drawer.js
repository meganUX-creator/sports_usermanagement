const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

const detailedDrawerJs = `
    window.openDetailedContentDrawer = function(e, type) {
        e.preventDefault();
        const userDetailsDrawer = document.getElementById('userDetailsDrawer');
        const expandPanel = document.getElementById('detailsExpandPanel');
        const contentDiv = document.getElementById('detailsExpandContent');
        
        if (!userDetailsDrawer || !expandPanel || !contentDiv) return;
        
        // Expand width
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
                            <td style="padding: 16px; color: #fcfcfcff;"><i class="ph-fill ph-map-pin"></i> Japan, Tokyo,<br>Tokyo</td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        \`;
    };

    const btnDetailsExpandClose = document.getElementById('btnDetailsExpandClose');
    if (btnDetailsExpandClose) {
        btnDetailsExpandClose.addEventListener('click', () => {
            const userDetailsDrawer = document.getElementById('userDetailsDrawer');
            const expandPanel = document.getElementById('detailsExpandPanel');
            if (userDetailsDrawer) userDetailsDrawer.style.width = '960px';
            if (expandPanel) {
                setTimeout(() => { expandPanel.style.display = 'none'; }, 300); // Wait for transition
            }
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
`;

// Insert the new JS logic before `window.openAgentChangeRecordDrawer`
content = content.replace(
    /window\.openAgentChangeRecordDrawer = function/g,
    detailedDrawerJs + '\n\n    window.openAgentChangeRecordDrawer = function'
);

fs.writeFileSync('script.js', content, 'utf8');
