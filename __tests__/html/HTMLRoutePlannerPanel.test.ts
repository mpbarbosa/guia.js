/**
 * @jest-environment jsdom
 */

import { beforeEach, describe, expect, test } from '@jest/globals';
import HTMLRoutePlannerPanel from '../../src/html/HTMLRoutePlannerPanel.js';

describe('HTMLRoutePlannerPanel', () => {
  let panel: HTMLRoutePlannerPanel;

  beforeEach(() => {
    document.body.innerHTML = '<div id="route-planner-panel" hidden></div>';
    panel = new HTMLRoutePlannerPanel();
  });

  test('shows a loading state', () => {
    panel.showLoading();

    const container = document.getElementById('route-planner-panel');
    expect(container?.hidden).toBe(false);
    expect(container?.getAttribute('aria-busy')).toBe('true');
    expect(container?.textContent).toContain('Calculando a melhor rota');
  });

  test('renders route details and action links', () => {
    panel.render({
      origin: {
        displayName: 'Recife Antigo, Recife - PE',
        latitude: -8.063149,
        longitude: -34.871139,
      },
      destination: {
        displayName: 'Praça do Carmo, Olinda - PE',
        latitude: -8.008889,
        longitude: -34.855278,
      },
      distanceMeters: 14500,
      durationSeconds: 1800,
      steps: [
        {
          instruction: 'Saia em Rua da Aurora',
          distanceMeters: 800,
          durationSeconds: 120,
        },
      ],
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1',
      openStreetMapUrl: 'https://www.openstreetmap.org/directions',
    });

    const container = document.getElementById('route-planner-panel');
    expect(container?.textContent).toContain('Recife Antigo');
    expect(container?.textContent).toContain('Praça do Carmo');
    expect(container?.textContent).toContain('14,5 km');
    expect(container?.textContent).toContain('30 min');
    expect(container?.querySelectorAll('a')).toHaveLength(2);
  });

  test('escapes error messages', () => {
    panel.showError('<script>alert("xss")</script>');

    const container = document.getElementById('route-planner-panel');
    expect(container?.innerHTML).not.toContain('<script>');
    expect(container?.textContent).toContain('alert("xss")');
  });
});
