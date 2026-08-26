import webpush from 'web-push';

webpush.setVapidDetails(
  'https://vercel.com/', // "subject" genérico exigido por el estándar, no necesita ser tuyo
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, secret } = req.body || {};

  // Validación simple del secreto compartido con Apps Script
  if (!process.env.SHARED_SECRET || secret !== process.env.SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let subscriptions = [];
  try {
    subscriptions = JSON.parse(process.env.PUSH_SUBSCRIPTIONS || '[]');
  } catch (err) {
    return res.status(500).json({ error: 'PUSH_SUBSCRIPTIONS mal formado (revisa el JSON)' });
  }

  if (subscriptions.length === 0) {
    return res.status(400).json({ error: 'No hay suscripciones registradas todavía' });
  }

  const payload = JSON.stringify({
    title: title || 'Notificación',
    body: body || '',
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) => webpush.sendNotification(sub, payload))
  );

  const failed = results.filter((r) => r.status === 'rejected').length;

  return res.status(200).json({
    ok: true,
    enviados: subscriptions.length - failed,
    fallidos: failed,
  });
}
