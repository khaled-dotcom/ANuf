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

// ============================
// تكامل Google Sheets (Google Apps Script)
// ============================

// ضع هنا رابط الـ Web App الخاص بـ Google Apps Script بعد النشر
const SHEETS_WEBAPP_URL = 'PUT_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE';

async function sendPaymentToSheet({ name, method }) {
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL.startsWith('PUT_')) {
    console.warn('لم يتم ضبط رابط Google Apps Script بعد.');
    return { ticketNumber: generateLocalTicketNumber() };
  }

  const payload = {
    name: name || 'غير محدد',
    method,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('خطأ في استدعاء Google Apps Script', await res.text());
      return { ticketNumber: generateLocalTicketNumber() };
    }

    const data = await res.json();
    // نتوقع أن يرجع الـ API قيمة ticketNumber
    if (data && data.ticketNumber) {
      return { ticketNumber: String(data.ticketNumber) };
    }

    return { ticketNumber: generateLocalTicketNumber() };
  } catch (err) {
    console.error('خطأ في الاتصال بـ Google Sheets:', err);
    return { ticketNumber: generateLocalTicketNumber() };
  }
}

// رقم تذكرة محلي احتياطي في حال فشل الاتصال بالـ API
function generateLocalTicketNumber() {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `L-${now}-${rand}`;
}

// دوال الأزرار في صفحة الدفع
async function handleFawryClick() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || '';

  const { ticketNumber } = await sendPaymentToSheet({
    name,
    method: 'fawry',
  });

  // بعد حفظ البيانات في Google Sheet نعيد تحميل الصفحة نفسها مع باراميترات
  const urlParams = new URLSearchParams();
  urlParams.set('ticket', ticketNumber);
  urlParams.set('method', 'fawry');
  if (name) urlParams.set('name', name);

  window.location.search = urlParams.toString();
}

async function handleInstapayClick() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || '';

  const { ticketNumber } = await sendPaymentToSheet({
    name,
    method: 'instapay',
  });

  const urlParams = new URLSearchParams();
  urlParams.set('ticket', ticketNumber);
  urlParams.set('method', 'instapay');
  if (name) urlParams.set('name', name);

  window.location.search = urlParams.toString();
}

