// Function to fetch and update pool data in real-time for ongoing pools with search filtering
function populatePoolTable(snapshot) {
    const tableBody1 = document.getElementById('pool-table-1-body').getElementsByTagName('tbody')[0];
    const tableBody2 = document.getElementById('pool-table-2-body').getElementsByTagName('tbody')[0];
    tableBody1.innerHTML = '';
    tableBody2.innerHTML = '';

    const usersData = snapshot.val();
    let ongoingPools = false;

    if (usersData) {
        for (const userId in usersData) {
            if (usersData.hasOwnProperty(userId)) {
                const userPools = usersData[userId].pools;
                if (userPools) {
                    for (const poolId in userPools) {
                        if (userPools.hasOwnProperty(poolId)) {
                            const pool = userPools[poolId];
                            const createdAt = new Date(pool.timestamp);
                            const timeframe = pool.timeframe * 1000;
                            const now = new Date();
                            const diff = timeframe - (now - createdAt);

                            if (diff > 0) { 
                                ongoingPools = true;
                                const row1 = document.createElement('tr');
                                row1.className = 'pool-row';
                                row1.innerHTML = `
                                    <td class="pool-td">${userId}</td>
                                    <td class="pool-td">$${pool.amount || 0}</td>
                                    <td class="pool-td">${createdAt.toLocaleString()}</td>
                                    <td class="pool-td countdown"></td>
                                    <td class="pool-td"><button class="pool-button">Status: ${pool.win ? 'win' : 'lose'}</button></td>
                                `;
                                tableBody1.appendChild(row1);

                                row1.querySelector('.pool-button').addEventListener('click', () => {
                                    const newStatus = !pool.win;
                                    firebase.database().ref(`Pools/${userId}/pools/${poolId}`).update({ win: newStatus });
                                });

                                const countdownInterval = setInterval(() => {
                                    const nowUpdate = new Date();
                                    const newDiff = timeframe - (nowUpdate - createdAt);
                                    if (newDiff > 0) {
                                        row1.querySelector('.countdown').textContent = `${Math.floor(newDiff / 1000)}s`;
                                    } else {
                                        clearInterval(countdownInterval);
                                        row1.remove();
                                    }
                                }, 1000);
                            }

                            const row2 = document.createElement('tr');
                            row2.className = 'pool-row';
                            row2.innerHTML = `
                                <td class="pool-td">${userId}</td>
                                <td class="pool-td">$${pool.amount || 0}</td>
                                <td class="pool-td">${createdAt.toLocaleString()}</td>
                                <td class="pool-td">${pool.win ? 'Won' : 'Lost'}</td>
                            `;
                            tableBody2.appendChild(row2);
                        }
                    }
                }
            }
        }
    }

    if (!ongoingPools) {
        const noPoolRow = document.createElement('tr');
        noPoolRow.className = 'pool-row';
        noPoolRow.innerHTML = '<td class="pool-td" colspan="5">No active pools at the moment. Explore the vault.</td>';
        tableBody1.appendChild(noPoolRow);
    }

    // Search filter functionality
    const searchInput = document.getElementById('searchFilter');
    searchInput.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        document.querySelectorAll('.pool-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });
}

firebase.database().ref('Pools').on('value', populatePoolTable);
