// script.js
// منطق بسيط لقراءة رقم التذكرة وطريقة الدفع من الـ URL في صفحة الدفع فقط

document.addEventListener('DOMContentLoaded', () => {
  const paymentSummary = document.getElementById('paymentSummary');
  if (!paymentSummary) return; // لو مش في صفحة الدفع

  const params = new URLSearchParams(window.location.search);
  const ticket = params.get('ticket');
  const method = params.get('method');
  const name = params.get('name');

  if (!ticket) {
    paymentSummary.textContent = 'لم يتم العثور على رقم تذكرة. برجاء الرجوع لصفحة الحجز والمحاولة مرة أخرى.';
    return;
  }

  const methodLabel =
    method === 'fawry'
      ? 'فوري'
      : method === 'instapay'
      ? 'InstaPay'
      : method === 'paypal'
      ? 'PayPal'
      : 'غير محدد';

  paymentSummary.innerHTML = `
    <p>مرحباً ${name ? `<strong>${escapeHtml(name)}</strong>` : ''}</p>
    <p>رقم التذكرة الخاصة بك: <strong>#${escapeHtml(ticket)}</strong></p>
    <p>طريقة الدفع التي اخترتها: <strong>${escapeHtml(methodLabel)}</strong></p>
    <p style="margin-top:0.5rem; font-size:0.9rem;">
      برجاء استخدام رقم التذكرة عند التواصل مع اتحاد الطلبة أو عند الحاجة للتأكيد.
    </p>
  `;
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

