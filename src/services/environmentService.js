// App Lab Agent - Domain, dağıtım ve yayın kanalı yapılandırmalarını koordine eden ortam servis modülü.

const store = require('../data/memoryStore');

function validateDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Alan adı değeri zorunludur.');
  }

  const sanitized = domain.trim().toLowerCase();
  const domainRegex = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;
  if (!domainRegex.test(sanitized)) {
    throw new Error('Geçersiz alan adı formatı.');
  }

  return sanitized;
}

function getEnvironmentSnapshot() {
  const environment = store.getEnvironment();
  const hostinger = store.getConnection('hostinger');

  return {
    domain: environment.domain,
    releaseChannels: environment.releaseChannels,
    updatedAt: environment.updatedAt,
    hostinger: {
      status: hostinger?.status || 'disconnected',
      siteId: hostinger?.metadata?.siteId || null,
      domainLinked: hostinger?.metadata?.domain === environment.domain
    }
  };
}

function updateDomain(domain) {
  const sanitized = validateDomain(domain);
  const environment = store.updateEnvironment({ domain: sanitized });

  const hostinger = store.getConnection('hostinger');
  if (hostinger) {
    store.setConnection('hostinger', {
      ...hostinger,
      metadata: {
        ...hostinger.metadata,
        domain: sanitized
      }
    });
  }

  return environment;
}

function registerReleaseChannel(platform, configuration) {
  if (!platform || typeof platform !== 'string') {
    throw new Error('Platform değeri zorunludur.');
  }

  if (!configuration || typeof configuration !== 'object') {
    throw new Error('Yayın kanalı yapılandırması zorunludur.');
  }

  const allowedPlatforms = ['android', 'ios', 'web'];
  const normalizedPlatform = platform.trim().toLowerCase();
  if (!allowedPlatforms.includes(normalizedPlatform)) {
    throw new Error('Desteklenmeyen yayın platformu.');
  }

  const requiredKeysByPlatform = {
    android: ['packageName', 'track'],
    ios: ['bundleId', 'ascAppId'],
    web: ['deploymentTarget']
  };

  const requiredKeys = requiredKeysByPlatform[normalizedPlatform] || [];
  const missing = requiredKeys.filter((key) => !configuration[key]);
  if (missing.length) {
    throw new Error(`Eksik yapılandırma alanları: ${missing.join(', ')}`);
  }

  return store.upsertReleaseChannel(normalizedPlatform, configuration);
}

module.exports = {
  getEnvironmentSnapshot,
  updateDomain,
  registerReleaseChannel
};
