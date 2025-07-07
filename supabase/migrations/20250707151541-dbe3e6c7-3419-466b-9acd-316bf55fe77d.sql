-- Return funds to account LT068073532464
SELECT atomic_balance_update(
  '801b080c-a4c4-4724-a052-52e47a66c5cc'::uuid,
  2000000.00,
  'admin_credit',
  'Pinigų grąžinimas - 2M LT grąžinimas sąskaitai LT068073532464'
);