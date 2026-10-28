/**
 * useRazorpay — handles the complete Razorpay payment flow
 *
 * Correct flow:
 *  1. Create DB order (isPaid=false, paymentMethod='razorpay')
 *  2. Create Razorpay order  →  get rpOrder.id + amount
 *  3. Open Razorpay checkout modal
 *  4. On success  → POST /api/payment/verify (HMAC check → marks isPaid=true)
 *  5. Clear cart → navigate to order detail
 *
 * On modal dismiss or payment failure, the DB order stays (isPaid=false)
 * and the user can retry from the orders page.
 */
import { useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function useRazorpay() {
  /**
   * @param {object}   opts
   * @param {number}   opts.total           – total amount in ₹
   * @param {object}   opts.shippingAddress – { street, city, state, pincode, country }
   * @param {object}   opts.user            – { name, email, phone }
   * @param {Function} opts.onSuccess       – called with (orderId) after verified payment
   * @param {Function} opts.onFailure       – called when modal closed without paying
   */
  const pay = useCallback(async ({ total, shippingAddress, user, onSuccess, onFailure }) => {
    // ── Step 1: Create DB order ──────────────────────────
    let dbOrder;
    try {
      const { data } = await api.post('/orders', {
        shippingAddress,
        paymentMethod: 'razorpay'
      });
      dbOrder = data.order;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
      return;
    }

    // ── Step 2: Create Razorpay order ────────────────────
    let rpOrder, key;
    try {
      const { data } = await api.post('/payment/create-order', {
        amount: total,
        orderId: dbOrder._id
      });
      rpOrder = data.rpOrder;
      key     = data.key;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Razorpay not configured. Use your test keys.');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Check your internet connection and refresh.');
      return;
    }

    // ── Step 3: Open Razorpay Checkout modal ─────────────
    const options = {
      key,
      amount:      rpOrder.amount,   // paise
      currency:    rpOrder.currency || 'INR',
      name:        'ShopNow',
      description: `Order #${dbOrder._id.slice(-8).toUpperCase()}`,
      image:       'https://via.placeholder.com/60?text=SN',
      order_id:    rpOrder.id,       // Razorpay order id (NOT our DB id)

      // ── Step 4: On payment success ───────────────────────
      handler: async (response) => {
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        const toastId = toast.loading('Verifying payment…');
        try {
          await api.post('/payment/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            orderId:             dbOrder._id
          });
          toast.dismiss(toastId);
          toast.success('🎉 Payment successful! Order confirmed.');
          onSuccess?.(dbOrder._id);
        } catch (err) {
          toast.dismiss(toastId);
          toast.error(err.response?.data?.message || 'Payment verified on Razorpay but our server failed. Contact support.');
          // Still navigate — we can reconcile via webhook later
          onSuccess?.(dbOrder._id);
        }
      },

      // ── Prefill ──────────────────────────────────────────
      prefill: {
        name:    user?.name  || '',
        email:   user?.email || '',
        contact: user?.phone || ''
      },

      // ── Notes ────────────────────────────────────────────
      notes: {
        orderId: dbOrder._id,
        address: `${shippingAddress.street}, ${shippingAddress.city}`
      },

      // ── Theme ────────────────────────────────────────────
      theme: { color: '#6c63ff' },

      // ── Modal closed without paying ──────────────────────
      modal: {
        ondismiss: () => {
          toast('Payment cancelled. Your order is saved — you can retry from My Orders.', {
            icon: '⚠️',
            duration: 5000
          });
          onFailure?.(dbOrder._id);
        }
      }
    };

    const rzp = new window.Razorpay(options);

    // Handle payment errors from Razorpay (card declined, etc.)
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description || response.error.reason}`);
      onFailure?.(dbOrder._id);
    });

    rzp.open();
  }, []);

  return { pay };
}
