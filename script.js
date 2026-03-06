// script.js
// منطق واجهة المستخدم + التكامل مع Google Sheets

// عرض ملخص الدفع في صفحة payment.html
document.addEventListener('DOMContentLoaded', () => {
  const paymentSummary = document.getElementById('paymentSummary');
  if (!paymentSummary) return; // لو مش في صفحة الدفع

  const params = new URLSearchParams(window.location.search);
  const ticket = params.get('ticket');
  const method = params.get('method');
  const name = params.get('name');
  const email = params.get('email');
  const phone = params.get('phone');
  const mealsCount = params.get('mealsCount');

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
    ${
      email || phone || mealsCount
        ? `
    <hr style="margin:0.8rem 0; border:none; border-top:1px solid rgba(255,255,255,0.1);" />
    <p style="font-size:0.9rem; margin:0 0 0.2rem;">بيانات الحجز:</p>
    <ul style="margin:0; padding-right:1.2rem; font-size:0.88rem;">
      ${name ? `<li>الاسم: <strong>${escapeHtml(name)}</strong></li>` : ''}
      ${email ? `<li>البريد الإلكتروني: <strong>${escapeHtml(email)}</strong></li>` : ''}
      ${phone ? `<li>رقم الهاتف: <strong>${escapeHtml(phone)}</strong></li>` : ''}
      ${
        mealsCount
          ? `<li>عدد الوجبات: <strong>${escapeHtml(mealsCount)}</strong> (١٠٠ جنيه لكل وجبة)</li>`
          : ''
      }
    </ul>
    `
        : ''
    }
    <p style="margin-top:0.7rem; font-size:0.9rem;">
      برجاء استخدام رقم التذكرة عند التواصل مع اتحاد الطلبة أو عند الحاجة للتأكيد.
    </p>
  `;
});

// عرض تفاصيل التأكيد في confirmation.html (لو تم تمرير البيانات في الرابط)
document.addEventListener('DOMContentLoaded', () => {
  const confirmationDetails = document.getElementById('confirmationDetails');
  if (!confirmationDetails) return;

  const params = new URLSearchParams(window.location.search);
  const ticket = params.get('ticket');
  const method = params.get('method');
  const name = params.get('name');
  const email = params.get('email');
  const phone = params.get('phone');
  const mealsCount = params.get('mealsCount');

  if (!ticket && !name && !email && !phone && !mealsCount) {
    confirmationDetails.textContent = '';
    return;
  }

  const methodLabel =
    method === 'fawry'
      ? 'فوري'
      : method === 'instapay'
      ? 'InstaPay'
      : method === 'paypal'
      ? 'PayPal'
      : method === 'test_paid'
      ? 'تم الدفع (تجربة)'
      : 'غير محدد';

  confirmationDetails.innerHTML = `
    <div style="font-size:0.95rem;">
      ${ticket ? `<p style="margin:0 0 0.35rem;">رقم التذكرة: <strong>#${escapeHtml(ticket)}</strong></p>` : ''}
      ${name ? `<p style="margin:0 0 0.35rem;">الاسم: <strong>${escapeHtml(name)}</strong></p>` : ''}
      ${email ? `<p style="margin:0 0 0.35rem;">البريد: <strong>${escapeHtml(email)}</strong></p>` : ''}
      ${phone ? `<p style="margin:0 0 0.35rem;">الهاتف: <strong>${escapeHtml(phone)}</strong></p>` : ''}
      ${
        mealsCount
          ? `<p style="margin:0 0 0.35rem;">عدد الوجبات: <strong>${escapeHtml(mealsCount)}</strong></p>`
          : ''
      }
      ${method ? `<p style="margin:0;">طريقة الدفع: <strong>${escapeHtml(methodLabel)}</strong></p>` : ''}
    </div>
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
// منطق نموذج الحجز في الصفحة الرئيسية
// ============================

// عند إرسال نموذج الحجز في index.html نوجّه المستخدم لصفحة الدفع مع تمرير كل البيانات في الـ URL
document.addEventListener('DOMContentLoaded', () => {
  const subscriptionForm = document.getElementById('subscriptionForm');
  if (!subscriptionForm) return;

  subscriptionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(subscriptionForm);
    const params = new URLSearchParams();

    ['name', 'email', 'phone', 'mealsCount', 'paymentMethod', 'notes'].forEach((field) => {
      const value = formData.get(field);
      if (value != null && String(value).trim() !== '') {
        params.set(field, String(value).trim());
      }
    });

    // نوجّه المستخدم لصفحة الدفع مع البيانات
    window.location.href = `payment.html?${params.toString()}`;
  });
});

// ============================
// تكامل Google Sheets (Google Apps Script)
// ============================

// ضع هنا رابط الـ Web App الخاص بـ Google Apps Script بعد النشر
const SHEETS_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbwK27tFXmNfh7mpF1SJtJwxS40OHjn1NT902trWUL79bzMWT1k04JlmnWHg_J1xmYQ6Iw/exec';

function getBookingDetailsFromUrlOrPage() {
  const params = new URLSearchParams(window.location.search);

  const urlName = (params.get('name') || '').trim();
  const urlEmail = (params.get('email') || '').trim();
  const urlPhone = (params.get('phone') || '').trim();
  const urlMealsCount = (params.get('mealsCount') || '').trim();
  const urlPreferredMethod = (params.get('paymentMethod') || '').trim();
  const urlNotes = (params.get('notes') || '').trim();

  // بديل: قراءة من حقول صفحة الدفع (لو المستخدم يكتب هناك مباشرة)
  const pageName = (document.getElementById('buyerName')?.value || '').trim();
  const pagePhone = (document.getElementById('buyerPhone')?.value || '').trim();
  const pageEmail = (document.getElementById('buyerEmail')?.value || '').trim();
  const pageQty = (document.getElementById('buyerQty')?.value || '').trim();

  return {
    name: urlName || pageName,
    email: urlEmail || pageEmail,
    phone: urlPhone || pagePhone,
    mealsCount: urlMealsCount || pageQty || '1',
    preferredMethod: urlPreferredMethod,
    notes: urlNotes,
  };
}

async function sendPaymentToSheet({ method }) {
  // هذا المسار باستخدام fetch غالبًا يفشل على المواقع الثابتة بسبب CORS/Preflight مع Google Apps Script.
  // سنستخدم مسار GET + redirect من داخل Apps Script. أبقينا الدالة لتوافق الاسم، لكنها الآن تعمل redirect.
  redirectToSheetsWebApp({ method });
  return { ticketNumber: '' };
}

// رقم تذكرة محلي احتياطي في حال فشل الاتصال بالـ API
function generateLocalTicketNumber() {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `L-${now}-${rand}`;
}

function navigateToConfirmation({ ticketNumber, method }) {
  const params = new URLSearchParams(window.location.search);
  const urlParams = new URLSearchParams();

  urlParams.set('ticket', ticketNumber);
  urlParams.set('method', method);

  // نعيد تمرير نفس بيانات الحجز في الرابط
  ['name', 'email', 'phone', 'mealsCount', 'paymentMethod', 'notes'].forEach((field) => {
    const value = params.get(field);
    if (value != null && value !== '') {
      urlParams.set(field, value);
    }
  });

  // لو البيانات كانت مدخلة في صفحة الدفع مباشرة بدون URL
  const booking = getBookingDetailsFromUrlOrPage();
  if (booking.name) urlParams.set('name', booking.name);
  if (booking.email) urlParams.set('email', booking.email);
  if (booking.phone) urlParams.set('phone', booking.phone);
  if (booking.mealsCount) urlParams.set('mealsCount', booking.mealsCount);

  window.location.href = `confirmation.html?${urlParams.toString()}`;
}

// دوال الأزرار في صفحة الدفع
async function handleFawryClick() {
  redirectToSheetsWebApp({ method: 'fawry' });
}

async function handleInstapayClick() {
  redirectToSheetsWebApp({ method: 'instapay' });
}

// زر تجريبي: كأنه الدفع اكتمل
async function handleTestPaidClick() {
  redirectToSheetsWebApp({ method: 'test_paid' });
}

function buildConfirmationReturnUrl() {
  const base = new URL('.', window.location.href); // نفس فولدر الموقع (مثلاً /ANuf/)
  return new URL('confirmation.html', base).toString();
}

function redirectToSheetsWebApp({ method }) {
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL.startsWith('PUT_')) {
    alert('لم يتم ضبط رابط Google Apps Script بعد.');
    return;
  }

  const booking = getBookingDetailsFromUrlOrPage();
  const params = new URLSearchParams();

  // أين يرجع بعد التسجيل في الشيت
  params.set('returnUrl', buildConfirmationReturnUrl());

  // البيانات
  params.set('method', method);
  if (booking.name) params.set('name', booking.name);
  if (booking.email) params.set('email', booking.email);
  if (booking.phone) params.set('phone', booking.phone);
  if (booking.mealsCount) params.set('mealsCount', booking.mealsCount);
  if (booking.preferredMethod) params.set('preferredMethod', booking.preferredMethod);
  if (booking.notes) params.set('notes', booking.notes);
  params.set('createdAt', new Date().toISOString());

  window.location.href = `${SHEETS_WEBAPP_URL}?${params.toString()}`;
}

