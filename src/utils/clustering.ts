import type { CastMember } from '../types';

export interface ClusteredPosition {
  member: CastMember;
  x: number;
  y: number;
}

/**
 * Calculate safe bounds for cast members considering UI elements
 */
export function getSafeBounds(circleRadius: number) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const isMobile = windowWidth < 768;

  // Base margin from screen edges
  const edgeMargin = isMobile ? 40 : 80;

  // Extra clearance for SVG curved text around photo
  const nameClearance = isMobile ? 20 : 25;

  // Timeline on left side (20px position + 40px width + padding)
  const timelineWidth = isMobile ? 30 : 40;
  const timelineLeft = isMobile ? 10 : 20;
  const timelineRight = timelineLeft + timelineWidth + (isMobile ? 20 : 30);

  // Season title area (top-left)
  const seasonTitleTop = isMobile ? 30 : 60;
  const seasonTitleLeft = isMobile ? 30 : 60;
  const seasonTitleWidth = isMobile ? 200 : 350;
  const seasonTitleHeight = isMobile ? 80 : 150;

  // Keep cast below the season title area entirely
  const seasonTitleBottom = seasonTitleTop + seasonTitleHeight;

  return {
    minX: Math.max(edgeMargin, timelineRight) + circleRadius,
    maxX: windowWidth - edgeMargin - circleRadius,
    minY: Math.max(edgeMargin + circleRadius, seasonTitleBottom + circleRadius + 20), // Keep below season title across entire width
    maxY: windowHeight - edgeMargin - circleRadius - nameClearance, // Account for circular text clearance
    seasonTitleBox: {
      left: seasonTitleLeft,
      right: seasonTitleLeft + seasonTitleWidth,
      top: seasonTitleTop,
      bottom: seasonTitleBottom
    }
  };
}

/**
 * Check if a position overlaps with the season title area
 */
export function overlapsSeasonTitle(x: number, y: number, circleRadius: number, bounds: ReturnType<typeof getSafeBounds>): boolean {
  const { seasonTitleBox } = bounds;

  // Check if circle overlaps with season title rectangle
  const closestX = Math.max(seasonTitleBox.left, Math.min(x, seasonTitleBox.right));
  const closestY = Math.max(seasonTitleBox.top, Math.min(y, seasonTitleBox.bottom));

  const distanceX = x - closestX;
  const distanceY = y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < (circleRadius * circleRadius);
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
  // Adjust sizing based on viewport and cast count
  const isMobile = window.innerWidth < 768;
  const castCount = members.length;

  // Circle radius matches photo sizing in CastMember component
  const CIRCLE_RADIUS = isMobile ? 25 : 40;
  const NAME_CLEARANCE = isMobile ? 25 : 32; // Extra clearance for SVG curved text around photo
  const HORIZONTAL_SPACING = isMobile ? 6 : 8; // Horizontal spacing between circles
  const VERTICAL_SPACING = isMobile ? 8 : 12; // Vertical spacing to account for text above/below

  // Get safe bounds
  const bounds = getSafeBounds(CIRCLE_RADIUS);

  // Increase base radius for very large casts to prevent overcrowding
  const baseRadius = isMobile ? 150 : 200;
  const scaleFactor = Math.sqrt(castCount / 10); // Scale based on cast density
  const looseness = castCount < 6 ? 1.3 : (castCount > 15 ? 1.2 : 1.0); // More space for large groups

  const viewportPadding = CIRCLE_RADIUS + 30; // Reduced padding for more space
  const maxDistanceX = Math.min(centerX - viewportPadding, window.innerWidth - centerX - viewportPadding);
  const maxDistanceY = Math.min(centerY - viewportPadding, window.innerHeight - centerY - viewportPadding);

  // Create organic ellipse (wider than tall) for better space usage
  const CLUSTER_RADIUS_X = Math.min(baseRadius * scaleFactor * looseness * 1.3, maxDistanceX);
  const CLUSTER_RADIUS_Y = Math.min(baseRadius * scaleFactor * looseness * 1.0, maxDistanceY);

  // Scale iterations with cast size for better convergence
  const adjustedIterations = Math.max(iterations, castCount * 20);

  // Initialize positions randomly within elliptical cluster
  const positions = members.map((member) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random();

    // Add subtle random offset to prevent perfect grid alignment
    const randomOffsetX = (Math.random() - 0.5) * 10;
    const randomOffsetY = (Math.random() - 0.5) * 10;

    return {
      member,
      x: centerX + Math.cos(angle) * distance * CLUSTER_RADIUS_X + randomOffsetX,
      y: centerY + Math.sin(angle) * distance * CLUSTER_RADIUS_Y + randomOffsetY,
      vx: 0,
      vy: 0,
    };
  });

  // Run force simulation with more iterations for better separation
  for (let iter = 0; iter < adjustedIterations; iter++) {
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

        // Use circular collision detection for more accurate overlap checking
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (CIRCLE_RADIUS * 2) + NAME_CLEARANCE + Math.max(HORIZONTAL_SPACING, VERTICAL_SPACING);

        if (distance < minDistance && distance > 0) {
          // Calculate repulsion force inversely proportional to distance
          const overlap = minDistance - distance;
          const force = overlap * 3.0; // Stronger force for better separation

          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          p1.vx -= normalizedDx * force;
          p1.vy -= normalizedDy * force;
          p2.vx += normalizedDx * force;
          p2.vy += normalizedDy * force;
        }
      }

      // Attraction to center (keeps cluster together but not too rigid)
      const p = positions[i];
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Gentler attraction for more organic feel, stronger for small groups
        const attractionStrength = castCount < 6 ? 80 : 120;
        const force = distance / attractionStrength;
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }

      // Repulsion from season title area
      if (overlapsSeasonTitle(p.x, p.y, CIRCLE_RADIUS, bounds)) {
        const { seasonTitleBox } = bounds;
        const titleCenterX = (seasonTitleBox.left + seasonTitleBox.right) / 2;
        const titleCenterY = (seasonTitleBox.top + seasonTitleBox.bottom) / 2;
        const awayX = p.x - titleCenterX;
        const awayY = p.y - titleCenterY;
        const awayDistance = Math.sqrt(awayX * awayX + awayY * awayY);

        if (awayDistance > 0) {
          const pushForce = 50; // Strong push away from title
          p.vx += (awayX / awayDistance) * pushForce;
          p.vy += (awayY / awayDistance) * pushForce;
        }
      }
    }

    // Apply velocities with damping to prevent oscillation
    const damping = 0.8;
    positions.forEach((p) => {
      p.x += p.vx * damping;
      p.y += p.vy * damping;
    });
  }

  // Clamp positions to ensure they stay within safe bounds
  return positions.map(({ member, x, y }) => {
    let clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, x));
    let clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, y));

    // If still overlapping season title after clamping, push it away
    if (overlapsSeasonTitle(clampedX, clampedY, CIRCLE_RADIUS, bounds)) {
      const { seasonTitleBox } = bounds;
      // Push to the right of the season title
      clampedX = Math.max(clampedX, seasonTitleBox.right + CIRCLE_RADIUS + 20);
    }

    return {
      member,
      x: clampedX,
      y: clampedY
    };
  });
}
