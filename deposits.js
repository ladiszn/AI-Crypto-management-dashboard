async function fetchAllDeposits() {
  const tableBody = document.querySelector('.deposits-table tbody');
  tableBody.innerHTML = ''; // Clear existing rows if any

  try {
    const usersSnapshot = await firestore.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      const depositsSnapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('deposits')
        .get();

      depositsSnapshot.forEach((doc) => {
        const data = doc.data();
        const statusValue = data.status ? data.status.toLowerCase() : 'pending';

        const row = `
          <tr>
            <td>${userId}</td>
            <td>$${data.amount}</td>
            <td>
              <select class="status-dropdown">
                <option value="pending" ${statusValue === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="approved" ${statusValue === 'approved' ? 'selected' : ''}>Approved</option>
                <option value="declined" ${statusValue === 'declined' ? 'selected' : ''}>Declined</option>
              </select>
            </td>
            <td>${data.type || 'Deposit'}</td>
            <td>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : ''}</td>
            <td><button class="action-btn" data-user="${userId}" data-id="${doc.id}" disabled>Save</button></td>
          </tr>
        `;

        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }

    attachDepositSaveListeners();
  } catch (error) {
    console.error('Error fetching deposits:', error);
  }
}

function attachDepositSaveListeners() {
  const saveDepositButtons = document.querySelectorAll('.deposits-table .action-btn');
  const dropdowns = document.querySelectorAll('.deposits-table .status-dropdown');

  dropdowns.forEach((dropdown) => {
    const initialStatus = dropdown.value.toLowerCase();

    dropdown.addEventListener('change', (e) => {
      const row = e.target.closest('tr');
      const saveBtn = row.querySelector('.action-btn');
      const newStatus = e.target.value.toLowerCase();

      saveBtn.disabled = newStatus === initialStatus ? true : false;
      if (!saveBtn.disabled) saveBtn.classList.add('enabled');
      else saveBtn.classList.remove('enabled');
    });
  });

  saveDepositButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
  const row = e.target.closest('tr');
  const userId = e.target.getAttribute('data-user');
  const depositId = e.target.getAttribute('data-id');
  const status = row.querySelector('.status-dropdown').value;

  console.log('Updating deposit:', { userId, depositId, status }); // Log the values

  try {
    // Update the deposit status in Firestore
    await firestore.collection('users')
      .doc(userId)
      .collection('deposits')
      .doc(depositId)
      .update({ status });

    // Fetch the user's email from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userEmail = userDoc.data().email;

    // Send email using EmailJS
    const templateParams = {
      to_email: userEmail,
      status: status,
      deposit_id: depositId,
      user_id: userId
    };

    emailjs.send('service_dwdj639', 'template_38nwabr', templateParams)
      .then((response) => {
        console.log('Email sent successfully:', response);
        alert('Deposit status updated and email sent successfully!');
      }, (error) => {
        console.error('Failed to send email:', error);
        alert('Deposit status updated, but failed to send email.');
      });

    e.target.disabled = true;
    e.target.classList.remove('enabled');
  } catch (err) {
    console.error('Error updating deposit status:', err);
    alert('Failed to update deposit status.');
  }
});
  });
}

// **Deposit Search Filter Function**
function filterDeposits() {
  const filter = document.getElementById('depositFilter').value.toLowerCase();
  const rows = document.querySelectorAll('.deposits-table tbody tr');

  rows.forEach((row) => {
    const rowText = row.textContent.toLowerCase();
    if (rowText.includes(filter)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

document.getElementById('depositFilter').addEventListener('input', filterDeposits);

window.addEventListener('DOMContentLoaded', fetchAllDeposits);
