import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();
const treasuryAddress = process.env.BNB_TREASURY_ADDRESS || '0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b';
const network = process.env.BNB_NETWORK || 'BSC';
const explorerBaseUrl = network === 'BSC_TESTNET'
  ? 'https://testnet.bscscan.com'
  : 'https://bscscan.com';

router.get('/config', (_req, res) => {
  res.json({
    network,
    asset: 'BNB',
    treasuryAddress,
    explorerUrl: `${explorerBaseUrl}/address/${treasuryAddress}`,
    warning: 'Send only BNB on the selected BNB Smart Chain network. Never send private keys or seed phrases.'
  });
});

router.get('/account', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'crypto_deposit' THEN amount ELSE 0 END), 0) AS deposits,
        COALESCE(SUM(CASE WHEN type = 'crypto_payment' THEN amount ELSE 0 END), 0) AS payments
      FROM transactions
      WHERE user_id = ${req.user?.id} AND category = 'BNB'
    `;

    const deposits = Number(rows[0]?.deposits || 0);
    const payments = Number(rows[0]?.payments || 0);

    res.json({
      asset: 'BNB',
      network,
      availableBalance: Math.max(0, deposits - payments),
      treasuryAddress,
      explorerUrl: `${explorerBaseUrl}/address/${treasuryAddress}`
    });
  } catch (error) {
    console.error('Wallet account error:', error);
    res.status(500).json({ message: 'Failed to load wallet account' });
  }
});

router.post('/payment-intent', requireAuth, async (req: AuthRequest, res) => {
  const amount = Number(req.body?.amount);
  const reference = String(req.body?.reference || '').trim();

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    return res.status(400).json({ message: 'Amount must be a valid positive BNB value.' });
  }

  if (reference.length < 3 || reference.length > 100) {
    return res.status(400).json({ message: 'A valid payment reference is required.' });
  }

  // This endpoint creates an internal payment record only. Blockchain confirmation
  // must be performed by a trusted BSC indexer before crediting a deposit.
  const result = await db`
    INSERT INTO transactions (user_id, type, amount, category, description, reference_id)
    VALUES (${req.user?.id}, 'crypto_payment', ${amount}, 'BNB', ${'BNB payment intent'}, ${reference})
    RETURNING id, amount, category, reference_id, created_at
  `;

  res.status(201).json({
    payment: result[0],
    network,
    destination: treasuryAddress,
    explorerUrl: `${explorerBaseUrl}/address/${treasuryAddress}`,
    status: 'pending_confirmation'
  });
});

export default router;
