// App Lab Agent - Proje, derleme, sürüm ve dağıtım adımlarını uçtan uca koordine eden pipeline servis modülü.

const store = require('../data/memoryStore');
const projectService = require('./projectService');
const buildService = require('./buildService');
const releaseService = require('./releaseService');
const environmentService = require('./environmentService');
const automationRunner = require('./automationRunner');
const githubConnector = require('../connectors/githubConnector');
const hostingerConnector = require('../connectors/hostingerConnector');
const n8nConnector = require('../connectors/n8nConnector');

function ensureIntegrationsConnected() {
  const integrations = {
    github: githubConnector.getStatus(),
    hostinger: hostingerConnector.getStatus(),
    n8n: n8nConnector.getStatus()
  };

  const missing = Object.entries(integrations)
    .filter(([, status]) => status?.status !== 'connected')
    .map(([provider]) => provider);

  if (missing.length) {
    throw new Error(`Eksik entegrasyon bağlantıları: ${missing.join(', ')}`);
  }

  return integrations;
}

function normalizePlatforms(input, environment) {
  if (Array.isArray(input) && input.length) {
    return input.map((platform) => platform.trim().toLowerCase());
  }

  if (input && typeof input === 'object') {
    return Object.keys(input).map((platform) => platform.trim().toLowerCase());
  }

  const configured = Object.keys(environment?.releaseChannels || {});
  if (configured.length) {
    return configured;
  }

  return ['web'];
}

function deriveReleaseChannel(platform, environment, overrides = {}) {
  if (overrides?.releaseChannel) {
    return overrides.releaseChannel;
  }

  const envChannel = environment?.releaseChannels?.[platform] || {};
  return (
    overrides?.track ||
    overrides?.deploymentTarget ||
    envChannel.track ||
    envChannel.deploymentTarget ||
    envChannel.ascAppId ||
    envChannel.packageName ||
    null
  );
}

function appendRunStep(runId, step) {
  const current = store.getPipelineRun(runId) || {};
  const steps = [
    ...(current.steps || []),
    {
      ...step,
      timestamp: step?.timestamp || new Date().toISOString()
    }
  ];

  store.upsertPipelineRun(runId, { steps });
  return store.getPipelineRun(runId);
}

function planDelivery(options = {}) {
  const { projectId, version = '1.0.0', platforms, workflowId, releaseChannels = {}, notes } = options;
  if (!projectId) {
    throw new Error('Pipeline planı için projectId değeri zorunludur.');
  }

  const project = projectService.getProject(projectId);
  const integrations = ensureIntegrationsConnected();
  const environment = environmentService.getEnvironmentSnapshot();
  const normalizedPlatforms = normalizePlatforms(platforms, environment);

  const release = releaseService.createRelease({
    projectId: project.id,
    version,
    platforms: normalizedPlatforms,
    notes: notes || `${project.name || project.id} ${version} pipeline planı`
  });

  const builds = normalizedPlatforms.map((platform) => {
    const platformConfig = !Array.isArray(platforms) && platforms?.[platform] ? platforms[platform] : {};
    const releaseChannel = deriveReleaseChannel(platform, environment, {
      ...platformConfig,
      releaseChannel: releaseChannels?.[platform]
    });

    return buildService.createBuild({
      projectId: project.id,
      platform,
      version,
      workflowId: platformConfig?.workflowId || workflowId || null,
      releaseChannel,
      notes: platformConfig?.notes || notes || `Pipeline ${platform} derlemesi`
    });
  });

  builds.forEach((build) => {
    releaseService.assignPlatformBuild(release.id, build.platform, build.id, 'pipeline');
  });

  const pipelineId = `pipeline_${Date.now()}`;
  const record = store.upsertPipelineRun(pipelineId, {
    projectId: project.id,
    version,
    status: 'planned',
    releaseId: release.id,
    builds: builds.map((build) => ({ id: build.id, platform: build.platform })),
    integrations,
    domain: environment.domain,
    notes: notes || null
  });

  const plannedRecord = appendRunStep(record.id, {
    type: 'planned',
    message: 'Pipeline planı oluşturuldu'
  });

  return {
    pipelineId: plannedRecord.id,
    status: plannedRecord.status,
    project,
    release: releaseService.getReleaseDetail(release.id),
    builds,
    environment,
    integrations,
    steps: plannedRecord.steps
  };
}

function executeDelivery(options = {}) {
  const { pipelineId, automationWorkflowId, autoDeploy = false, deploymentTarget = 'production', processQueue = true } = options;

  let planRecord = pipelineId ? store.getPipelineRun(pipelineId) : null;
  if (!planRecord) {
    const plan = planDelivery(options);
    planRecord = store.getPipelineRun(plan.pipelineId);
  }

  if (!planRecord) {
    throw new Error('Pipeline planı bulunamadı.');
  }

  const triggeredBuilds = [];
  const processedBuilds = [];

  planRecord.builds.forEach((entry) => {
    const triggered = buildService.triggerBuild(entry.id, {
      notes: `Pipeline ${planRecord.id} build tetiklemesi`,
      completionNotes: `Pipeline ${planRecord.id} build tamamlandı`
    });
    triggeredBuilds.push(triggered);
  });

  if (processQueue) {
    let processed;
    do {
      processed = automationRunner.processNext();
      if (processed && planRecord.builds.some((entry) => entry.id === processed.id)) {
        processedBuilds.push(processed);
      }
    } while (processed);
  }

  const platformUpdates = planRecord.builds.map((entry) =>
    releaseService.updatePlatformStatus(
      planRecord.releaseId,
      entry.platform,
      {
        status: processQueue ? 'ready_for_submission' : 'waiting_for_build',
        storeStatus: processQueue ? 'ready' : 'pending'
      },
      'pipeline'
    )
  );

  const promoted = releaseService.promoteRelease(
    planRecord.releaseId,
    processQueue ? 'in_review' : 'planned',
    'pipeline',
    processQueue
      ? 'Otomatik pipeline sürümü inceleme aşamasına taşıdı'
      : 'Pipeline planı oluşturuldu'
  );

  let deploymentResult = null;
  if (autoDeploy) {
    deploymentResult = hostingerConnector.triggerDeployment(deploymentTarget);
  }

  let automationTrigger = null;
  if (automationWorkflowId) {
    automationTrigger = n8nConnector.triggerWorkflow(automationWorkflowId, {
      projectId: planRecord.projectId,
      releaseId: planRecord.releaseId,
      builds: planRecord.builds
    });
  }

  const completed = store.upsertPipelineRun(planRecord.id, {
    status: processQueue ? 'completed' : 'queued',
    completedAt: processQueue ? new Date().toISOString() : null,
    lastExecution: {
      triggeredBuilds: triggeredBuilds.map((build) => build.id),
      processedBuilds: processedBuilds.map((build) => build.id),
      releaseStatus: promoted.status,
      deployment: deploymentResult,
      automationTrigger
    }
  });

  const executedRecord = appendRunStep(planRecord.id, {
    type: 'executed',
    message: processQueue ? 'Pipeline çalıştırması tamamlandı' : 'Pipeline kuyruğa alındı'
  });

  const environment = environmentService.getEnvironmentSnapshot();

  return {
    pipelineId: executedRecord.id,
    status: executedRecord.status,
    release: releaseService.getReleaseDetail(planRecord.releaseId),
    builds: planRecord.builds.map((entry) => buildService.getBuildById(entry.id)),
    releasePlatforms: platformUpdates,
    environment,
    integrations: planRecord.integrations,
    deployment: deploymentResult,
    automationTrigger,
    steps: executedRecord.steps
  };
}

function listPipelineRuns() {
  const runs = store.listPipelineRuns();
  return Object.values(runs).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getPipelineRunDetail(id) {
  if (!id) {
    throw new Error('Pipeline detayı için id değeri zorunludur.');
  }
  const run = store.getPipelineRun(id);
  if (!run) {
    throw new Error(`Pipeline kaydı bulunamadı: ${id}`);
  }
  return run;
}

module.exports = {
  planDelivery,
  executeDelivery,
  listPipelineRuns,
  getPipelineRunDetail
};
