// App Lab Agent - Platformun genel durumunu ve son etkinlik özetlerini hesaplayan durum servisi.

const store = require('../data/memoryStore');
const githubConnector = require('../connectors/githubConnector');
const hostingerConnector = require('../connectors/hostingerConnector');
const n8nConnector = require('../connectors/n8nConnector');

function toArray(collection) {
  return Object.values(collection || {});
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item?.[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function resolveTimestamp(item) {
  return (
    item?.updatedAt ||
    item?.completedAt ||
    item?.timestamp ||
    item?.createdAt ||
    null
  );
}

function buildRecentActivityCollection() {
  const activity = [];

  toArray(store.listProjects()).forEach((project) => {
    activity.push({
      type: 'project',
      id: project.id,
      name: project.name,
      status: project.status || 'active',
      updatedAt: resolveTimestamp(project),
      metadata: {
        integrationCount: Object.keys(project.integrations || {}).length,
        taskCount: (project.tasks || []).length
      }
    });
  });

  toArray(store.listWorkflows()).forEach((workflow) => {
    activity.push({
      type: 'workflow',
      id: workflow.id,
      name: workflow.name,
      status: 'configured',
      updatedAt: resolveTimestamp(workflow),
      metadata: {
        projectId: workflow.projectId || null,
        taskCount: (workflow.tasks || []).length
      }
    });
  });

  toArray(store.listTasks()).forEach((task) => {
    activity.push({
      type: 'task',
      id: task.id,
      name: task.id,
      status: task.status || 'registered',
      updatedAt: resolveTimestamp(task),
      metadata: {
        lastRunAt: task.lastRunAt || null
      }
    });
  });

  toArray(store.listAgentProfiles()).forEach((agent) => {
    activity.push({
      type: 'agent',
      id: agent.id,
      name: agent.name,
      status: 'ready',
      updatedAt: resolveTimestamp(agent),
      metadata: {
        provider: agent.provider,
        projectId: agent.projectId || null
      }
    });
  });

  toArray(store.listBuilds()).forEach((build) => {
    activity.push({
      type: 'build',
      id: build.id,
      name: `${build.platform || 'build'}-${build.version || ''}`.trim(),
      status: build.status || 'unknown',
      updatedAt: resolveTimestamp(build),
      metadata: {
        projectId: build.projectId || null,
        platform: build.platform || null
      }
    });
  });

  toArray(store.listReleases()).forEach((release) => {
    activity.push({
      type: 'release',
      id: release.id,
      name: release.version,
      status: release.status || 'draft',
      updatedAt: resolveTimestamp(release),
      metadata: {
        projectId: release.projectId || null,
        platformCount: Object.keys(release.platforms || {}).length
      }
    });
  });

  toArray(store.listPipelineRuns()).forEach((run) => {
    activity.push({
      type: 'pipeline',
      id: run.id,
      name: run.version || run.id,
      status: run.status || 'planned',
      updatedAt: resolveTimestamp(run),
      metadata: {
        projectId: run.projectId || null,
        releaseId: run.releaseId || null
      }
    });
  });

  return activity
    .filter((item) => item.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getRecentActivity(limit = 10) {
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
  return buildRecentActivityCollection().slice(0, normalizedLimit);
}

function buildPlatformSummary() {
  const now = new Date().toISOString();
  const environment = store.getEnvironment();

  const connections = {
    github: githubConnector.getStatus(),
    hostinger: hostingerConnector.getStatus(),
    n8n: n8nConnector.getStatus()
  };

  const projects = toArray(store.listProjects());
  const workflows = toArray(store.listWorkflows());
  const tasks = toArray(store.listTasks());
  const agents = toArray(store.listAgentProfiles());
  const builds = toArray(store.listBuilds());
  const releases = toArray(store.listReleases());
  const pipelineRuns = toArray(store.listPipelineRuns());

  const sortedPipelineRuns = [...pipelineRuns].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );

  return {
    generatedAt: now,
    environment: {
      domain: environment.domain,
      updatedAt: environment.updatedAt,
      releaseChannelCount: Object.keys(environment.releaseChannels || {}).length,
      releaseChannels: environment.releaseChannels || {}
    },
    connections: {
      details: connections,
      connectedProviders: Object.entries(connections)
        .filter(([, status]) => status?.status === 'connected')
        .map(([provider]) => provider),
      disconnectedProviders: Object.entries(connections)
        .filter(([, status]) => status?.status !== 'connected')
        .map(([provider]) => provider)
    },
    projects: {
      total: projects.length,
      withIntegrations: projects.filter((project) => Object.keys(project.integrations || {}).length > 0).length,
      ids: projects.map((project) => project.id)
    },
    automations: {
      workflows: {
        total: workflows.length,
        attachedToProjects: workflows.filter((workflow) => Boolean(workflow.projectId)).length
      },
      tasks: {
        total: tasks.length,
        queued: tasks.filter((task) => task.status === 'queued').length
      }
    },
    agents: {
      total: agents.length,
      byProvider: countBy(agents, 'provider')
    },
    builds: {
      total: builds.length,
      byStatus: countBy(builds, 'status')
    },
    releases: {
      total: releases.length,
      byStatus: countBy(releases, 'status')
    },
    pipelines: {
      total: pipelineRuns.length,
      lastRunAt: sortedPipelineRuns[0]?.updatedAt || null,
      recent: sortedPipelineRuns.slice(0, 3).map((run) => ({
        id: run.id,
        status: run.status,
        updatedAt: run.updatedAt
      }))
    },
    recentActivity: getRecentActivity(5)
  };
}

module.exports = {
  buildPlatformSummary,
  getRecentActivity
};
