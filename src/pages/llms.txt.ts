import type { APIRoute } from 'astro';
import { automatonePedals, classicPedals } from '../pedals';
import { buildLlmsTxt } from '../site/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(buildLlmsTxt({ origin: site?.href ?? 'https://pedalzombie.com', classic: classicPedals, automatone: automatonePedals }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
