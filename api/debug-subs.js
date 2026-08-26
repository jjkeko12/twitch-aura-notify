export default function handler(req, res) {
  const raw = process.env.PUSH_SUBSCRIPTIONS || '';

  let parsedCount = null;
  let parseError = null;

  try {
    const parsed = JSON.parse(raw || '[]');
    parsedCount = Array.isArray(parsed) ? parsed.length : 'no es un arreglo';
  } catch (err) {
    parseError = err.message;
  }

  res.status(200).json({
    variableExiste: raw.length > 0,
    largoDelTexto: raw.length,
    primeros30Caracteres: raw.slice(0, 30),
    ultimos30Caracteres: raw.slice(-30),
    cantidadDeSuscripciones: parsedCount,
    errorDeParseo: parseError,
  });
}
