async function fetchAllWithdrawals() {
  const tableBody = document.querySelector('.minimalist-table tbody');
  tableBody.innerHTML = ''; // Clear existing rows if any

  try {
    const usersSnapshot = await firestore.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      const withdrawalsSnapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('withdrawals')
        .get();

      withdrawalsSnapshot.forEach((doc) => {
        const data = doc.data();
        const statusValue = data.status ? data.status.toLowerCase() : 'pending';

        const row = `
          <tr data-wallet="${data.walletAddress || ''}">
            <td>${userId}</td>
            <td>$${data.amount}</td>
            <td>
              <select class="status-dropdown">
                <option value="pending" ${statusValue === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="approved" ${statusValue === 'approved' ? 'selected' : ''}>Approved</option>
                <option value="declined" ${statusValue === 'declined' ? 'selected' : ''}>Declined</option>
              </select>
            </td>
            <td>${data.type || 'Withdrawal'}</td>
            <td>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : ''}</td>
            <td>${data.password || '*******'}</td>
            <td><button class="action-btn" data-user="${userId}" data-id="${doc.id}" disabled>Save</button></td>
          </tr>
        `;

        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }

    attachSaveListeners();
    attachRowClickListeners();
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
  }
}

function attachRowClickListeners() {
  const rows = document.querySelectorAll('.minimalist-table tbody tr');
  
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      const walletAddress = row.getAttribute('data-wallet');
      if (walletAddress) {
        navigator.clipboard.writeText(walletAddress)
          .then(() => {
            showCustomMessage(`Wallet Address Copied: ${walletAddress}`);
          })
          .catch((err) => console.error('Error copying wallet address:', err));
      }
    });
  });
}

function showCustomMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('custom-message', 'neon-box');
  messageDiv.textContent = message;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 5000); // Remove message after 5 seconds
}

function attachSaveListeners() {
  const saveButtons = document.querySelectorAll('.minimalist-table .action-btn');
  const dropdowns = document.querySelectorAll('.status-dropdown');

  dropdowns.forEach((dropdown) => {
    const initialStatus = dropdown.value.toLowerCase();

    dropdown.addEventListener('change', (e) => {
      const row = e.target.closest('tr');
      const saveBtn = row.querySelector('.action-btn');
      const newStatus = e.target.value.toLowerCase();

      saveBtn.disabled = newStatus === initialStatus ? true : false;
    });
  });

  saveButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      const userId = e.target.getAttribute('data-user');
      const withdrawalId = e.target.getAttribute('data-id');
      const status = row.querySelector('.status-dropdown').value;

      try {
        await firestore.collection('users')
          .doc(userId)
          .collection('withdrawals')
          .doc(withdrawalId)
          .update({ status });

        alert('Status updated successfully!');
        e.target.disabled = true;
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Failed to update status.');
      }
    });
  });
}

function filterWithdrawals() {
  const filter = document.getElementById('withdrawalFilter').value.toLowerCase();
  const rows = document.querySelectorAll('.minimalist-table tbody tr');

  rows.forEach((row) => {
    const rowText = row.textContent.toLowerCase();
    if (rowText.includes(filter)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

document.getElementById('withdrawalFilter').addEventListener('input', filterWithdrawals);

window.addEventListener('DOMContentLoaded', fetchAllWithdrawals);
