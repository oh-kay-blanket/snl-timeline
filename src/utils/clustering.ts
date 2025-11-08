import type { CastMember } from '../types';

export interface ClusteredPosition {
  member: CastMember;
  x: number;
  y: number;
}

/**
 * Simple force-directed clustering algorithm for organic positioning
 */
export function clusterCastMembers(
  members: CastMember[],
  centerX: number,
  centerY: number,
  iterations: number = 300
): ClusteredPosition[] {
  // Adjust sizing based on viewport
  const isMobile = window.innerWidth < 768;
  const CIRCLE_RADIUS = isMobile ? 30 : 40; // Radius of each cast member circle
  const SPACING = isMobile ? 10 : 15; // Additional spacing between circles

  // Calculate safe cluster radius based on viewport - keep cast members visible
  const viewportPadding = CIRCLE_RADIUS + 50; // Extra padding from edges
  const maxDistanceX = Math.min(centerX - viewportPadding, window.innerWidth - centerX - viewportPadding);
  const maxDistanceY = Math.min(centerY - viewportPadding, window.innerHeight - centerY - viewportPadding);
  const CLUSTER_RADIUS = Math.min(200, maxDistanceX, maxDistanceY); // Keep within bounds

  // Initialize positions randomly within cluster radius
  const positions = members.map((member) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * CLUSTER_RADIUS;

    return {
      member,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
    };
  });

  // Run force simulation with more iterations for better separation
  for (let iter = 0; iter < iterations; iter++) {
    // Reset velocities
    positions.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
    });

    // Apply forces between all pairs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i];
        const p2 = positions[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (CIRCLE_RADIUS + SPACING) * 2;

        // Strong repulsion force if too close
        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance;
          const force = overlap * 3; // Even stronger force to prevent overlap
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          p1.vx -= fx;
          p1.vy -= fy;
          p2.vx += fx;
          p2.vy += fy;
        }
      }

      // Stronger attraction to center (keeps cluster tighter)
      const p = positions[i];
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const force = distance / 400; // Much stronger attraction to center
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }
    }

    // Apply velocities with damping to prevent oscillation
    const damping = 0.8;
    positions.forEach((p) => {
      p.x += p.vx * damping;
      p.y += p.vy * damping;
    });
  }

  // Clamp positions to ensure they stay within viewport bounds
  const minX = CIRCLE_RADIUS + 10;
  const maxX = window.innerWidth - CIRCLE_RADIUS - 10;
  const minY = CIRCLE_RADIUS + 10;
  const maxY = window.innerHeight - CIRCLE_RADIUS - 10;

  return positions.map(({ member, x, y }) => ({
    member,
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y))
  }));
}
