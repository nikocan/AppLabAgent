// App Lab Agent - Sürüm ve dağıtım akışlarını yöneten HTTP yönlendiricisi; platform durumlarını API üzerinden günceller.

const releaseService = require('../services/releaseService');

function route({ method, pathname, body, query }) {
  if (method === 'POST' && pathname === '/api/releases') {
    const release = releaseService.createRelease(body || {});
    return { status: 201, data: release };
  }

  if (method === 'GET' && pathname === '/api/releases') {
    const releases = releaseService.listReleaseSummaries({ projectId: query?.projectId });
    return { status: 200, data: releases };
  }

  const detailMatch = pathname.match(/^\/api\/releases\/([^/]+)$/);
  if (detailMatch && method === 'GET') {
    const releaseId = detailMatch[1];
    return { status: 200, data: releaseService.getReleaseDetail(releaseId) };
  }

  const promoteMatch = pathname.match(/^\/api\/releases\/([^/]+)\/promote$/);
  if (promoteMatch && method === 'POST') {
    const releaseId = promoteMatch[1];
    const { status, actor, message } = body || {};
    const updated = releaseService.promoteRelease(releaseId, status, actor, message);
    return { status: 200, data: updated };
  }

  const platformMatch = pathname.match(/^\/api\/releases\/([^/]+)\/platforms$/);
  if (platformMatch && method === 'POST') {
    const releaseId = platformMatch[1];
    const { platform, buildId, updates = {}, actor } = body || {};

    if (buildId) {
      const platformState = releaseService.assignPlatformBuild(releaseId, platform, buildId, actor);
      return { status: 200, data: platformState };
    }

    const platformState = releaseService.updatePlatformStatus(releaseId, platform, updates, actor);
    return { status: 200, data: platformState };
  }

  const milestoneMatch = pathname.match(/^\/api\/releases\/([^/]+)\/timeline$/);
  if (milestoneMatch && method === 'POST') {
    const releaseId = milestoneMatch[1];
    const updated = releaseService.recordMilestone(releaseId, body || {});
    return { status: 200, data: updated };
  }

  return null;
}

module.exports = { route };
