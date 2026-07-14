/* ==========================================================================
   KHAN HERBAL HUB — script.js (Vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky navbar shrink-on-scroll ---------------- */
  var navbar = document.getElementById('navbar');
  var lastScrollY = window.scrollY;
  function onScrollNav() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Scroll reveal via IntersectionObserver ---------------- */
  var revealEls = document.querySelectorAll('.reveal-up, .reveal-scale');
  // stagger index per parent group for grid children
  var groupSelectors = ['.ingredient-grid', '.benefit-grid', '.review-grid', '.trust-grid', '.accordion'];
  groupSelectors.forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- Parallax floating shapes (hero) ---------------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          el.style.transform = 'translateY(' + (y * speed) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- FAQ Accordion ---------------- */
  var accItems = document.querySelectorAll('.acc-item');
  accItems.forEach(function (item) {
    var trigger = item.querySelector('.acc-trigger');
    var panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;
    panel.style.maxHeight = '0px';
    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      // close all others
      accItems.forEach(function (other) {
        if (other === item) return;
        var otherTrigger = other.querySelector('.acc-trigger');
        var otherPanel = other.querySelector('.acc-panel');
        if (otherTrigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherPanel.style.maxHeight = '0px';
        }
      });
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });

  /* ---------------- Order form: quantity, coupon, summary, WhatsApp submit ---------------- */
  var UNIT_PRICE = 1590;
  var BKASH_PAYMENT_LINK = 'https://shop.bkash.com/khan-shop01608780378/pay/bdt1590/fW59BO';
  var ORDER_WHATSAPP_NUMBER = '8801608780378';

  var qtyInput = document.getElementById('fqty');
  var qtyMinus = document.getElementById('qtyMinus');
  var qtyPlus = document.getElementById('qtyPlus');
  var sumQty = document.getElementById('sumQty');
  var sumSubtotal = document.getElementById('sumSubtotal');
  var sumTotal = document.getElementById('sumTotal');
  var discountRow = document.getElementById('discountRow');
  var sumDiscount = document.getElementById('sumDiscount');
  var couponInput = document.getElementById('fcoupon');
  var applyCouponBtn = document.getElementById('applyCoupon');
  var couponMsg = document.getElementById('couponMsg');

  var appliedDiscountPercent = 0;
  var appliedCouponCode = '';

  var VALID_COUPONS = {
    'KHAN10': 10,
    'POWER15': 15
  };

  function bnDigits(num) {
    var map = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
    return String(num).replace(/[0-9]/g, function (d) { return map[d]; });
  }
  function formatTaka(num) {
    return '৳' + bnDigits(num.toLocaleString('en-US'));
  }

  function updateSummary() {
    var qty = parseInt(qtyInput.value, 10) || 1;
    var subtotal = UNIT_PRICE * qty;
    var discount = Math.round(subtotal * (appliedDiscountPercent / 100));
    var total = subtotal - discount;

    if (sumQty) sumQty.textContent = bnDigits(qty);
    if (sumSubtotal) sumSubtotal.textContent = formatTaka(subtotal);
    if (discountRow && sumDiscount) {
      if (discount > 0) {
        discountRow.hidden = false;
        sumDiscount.textContent = '−' + formatTaka(discount);
      } else {
        discountRow.hidden = true;
      }
    }
    if (sumTotal) sumTotal.textContent = formatTaka(total);
    return { qty: qty, subtotal: subtotal, discount: discount, total: total };
  }

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', function () {
      var v = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
      qtyInput.value = v;
      updateSummary();
    });
    qtyPlus.addEventListener('click', function () {
      var v = Math.min(20, (parseInt(qtyInput.value, 10) || 1) + 1);
      qtyInput.value = v;
      updateSummary();
    });
    qtyInput.addEventListener('input', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.min(20, Math.max(1, v));
      updateSummary();
    });
  }

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', function () {
      var code = ((couponInput && couponInput.value) || '').trim().toUpperCase();
      if (!code) {
        if (couponMsg) {
          couponMsg.textContent = 'একটি কুপন কোড লিখুন।';
          couponMsg.style.color = 'var(--muted)';
        }
        return;
      }
      if (VALID_COUPONS[code]) {
        appliedDiscountPercent = VALID_COUPONS[code];
        appliedCouponCode = code;
        if (couponMsg) {
          couponMsg.textContent = '✓ কুপন প্রয়োগ হয়েছে — ' + bnDigits(VALID_COUPONS[code]) + '% ছাড় পেয়েছেন।';
          couponMsg.style.color = 'var(--success)';
        }
      } else {
        appliedDiscountPercent = 0;
        appliedCouponCode = '';
        if (couponMsg) {
          couponMsg.textContent = 'কুপন কোডটি সঠিক নয়।';
          couponMsg.style.color = '#e28880';
        }
      }
      updateSummary();
    });
  }

  updateSummary();

  /* ---------------- Form validation + checkout payment redirect ---------------- */
  var orderForm = document.getElementById('orderForm');
  var paidConfirmBtn = null;
  var paymentSelect = document.getElementById('fpayment');
  var fields = {
    fname: { el: document.getElementById('fname'), errEl: document.getElementById('err-fname'), validate: function (v) { return v.trim().length >= 2 ? '' : 'পূর্ণ নাম লিখুন।'; } },
    fphone: { el: document.getElementById('fphone'), errEl: document.getElementById('err-fphone'), validate: function (v) { return /^01[3-9][0-9]{8}$/.test(v.trim()) ? '' : 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।'; } },
    faddress: { el: document.getElementById('faddress'), errEl: document.getElementById('err-faddress'), validate: function (v) { return v.trim().length >= 8 ? '' : 'সম্পূর্ণ ঠিকানা লিখুন।'; } }
  };

  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    if (!f.el) return;
    f.el.addEventListener('blur', function () {
      f.el.setAttribute('data-touched', 'true');
      f.errEl.textContent = f.validate(f.el.value);
    });
  });

  if (orderForm) {
    var submitBtn = orderForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      paidConfirmBtn = document.createElement('button');
      paidConfirmBtn.type = 'button';
      paidConfirmBtn.className = 'btn btn-outline btn-block';
      paidConfirmBtn.textContent = 'I Have Paid';
      paidConfirmBtn.addEventListener('click', function () {
        alert('Thank you. We have received your payment confirmation. Our team will verify your payment and contact you soon.');
      });
      submitBtn.insertAdjacentElement('afterend', paidConfirmBtn);
    }

    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (!f.el) return;
        f.el.setAttribute('data-touched', 'true');
        var msg = f.validate(f.el.value);
        f.errEl.textContent = msg;
        if (msg) valid = false;
      });
      if (!valid) {
        var firstInvalid = orderForm.querySelector('.field-error:not(:empty)');
        if (firstInvalid) {
          var target = firstInvalid.previousElementSibling || firstInvalid;
          target.focus({ preventScroll: false });
        }
        return;
      }

      var summary = updateSummary();
      var paymentMethod = (paymentSelect && paymentSelect.value) || 'cod';
      var paymentLabel = 'ক্যাশ অন ডেলিভারি';
      if (paymentMethod === 'bkash') paymentLabel = 'bKash';
      if (paymentMethod === 'rocket') paymentLabel = 'Rocket';
      if (paymentMethod === 'bank') paymentLabel = 'ব্যাংক ট্রান্সফার';

      var orderLines = [
        'আসসালামু আলাইকুম, আমি Natural Power Halwa অর্ডার করতে চাই।',
        '',
        '🛒 *অর্ডার তথ্য*',
        '• নাম: ' + fields.fname.el.value.trim(),
        '• ফোন: ' + fields.fphone.el.value.trim(),
        '• ঠিকানা: ' + fields.faddress.el.value.trim(),
        '• পেমেন্ট মেথড: ' + paymentLabel,
        '• পরিমাণ: ' + summary.qty,
        '• সাবটোটাল: ৳' + summary.subtotal
      ];

      if (summary.discount > 0) {
        orderLines.push('• ছাড়: ৳' + summary.discount + (appliedCouponCode ? ' (কুপন: ' + appliedCouponCode + ')' : ''));
      }

      orderLines.push('• মোট: ৳' + summary.total);

      var whatsappUrl = 'https://wa.me/' + ORDER_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(orderLines.join('\n'));
      window.open(whatsappUrl, '_blank', 'noopener');

      if (paymentMethod === 'bkash') {
        alert('আপনাকে bKash পেমেন্ট পেইজে নেওয়া হচ্ছে।\n\nপেমেন্ট সম্পন্ন হলে এই ওয়েবসাইটে ফিরে এসে "I Have Paid" বাটনে ক্লিক করুন।');
        window.location.href = BKASH_PAYMENT_LINK;
        return;
      }

      if (paymentMethod === 'rocket') {
        alert('Rocket পেমেন্ট নির্দেশনা:\n\nRocket নাম্বার: 01608780378\nপরিমাণ: ৳' + summary.total + '\n\nপেমেন্টের পর "I Have Paid" বাটনে ক্লিক করুন।');
        return;
      }

      if (paymentMethod === 'bank') {
        alert('ব্যাংক ট্রান্সফার তথ্য:\n\nব্যাংক: Dutch-Bangla Bank\nঅ্যাকাউন্ট নাম: Khan Herbal Hub\nঅ্যাকাউন্ট নম্বর: 01608780378\nপরিমাণ: ৳' + summary.total + '\n\nট্রান্সফার শেষে "I Have Paid" বাটনে ক্লিক করুন।');
        return;
      }

      alert('আপনার অর্ডার WhatsApp-এ পাঠানো হয়েছে। ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই।');
    });
  }

  /* ---------------- Sticky mobile order bar visibility ---------------- */
  var stickyBar = document.getElementById('stickyOrderBar');
  var orderSection = document.getElementById('order');
  var heroSection = document.getElementById('home');
  if (stickyBar && 'IntersectionObserver' in window) {
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === heroSection) {
          stickyBar.dataset.pastHero = entry.isIntersecting ? 'false' : 'true';
        }
        if (entry.target === orderSection) {
          stickyBar.dataset.inOrder = entry.isIntersecting ? 'true' : 'false';
        }
        var pastHero = stickyBar.dataset.pastHero === 'true';
        var inOrder = stickyBar.dataset.inOrder === 'true';
        stickyBar.style.transform = (pastHero && !inOrder) ? 'translateY(0)' : 'translateY(110%)';
        stickyBar.style.transition = 'transform .3s ease';
      });
    }, { threshold: 0.1 });
    if (heroSection) barIO.observe(heroSection);
    if (orderSection) barIO.observe(orderSection);
  }

})();
                             
