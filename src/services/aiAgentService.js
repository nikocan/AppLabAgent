// App Lab Agent - Yapay zeka ajan profillerini yöneten servis katmanı.

const {
  upsertAgentProfile,
  getAgentProfile,
  listAgentProfiles,
  linkAgentToProject,
  deleteAgentProfile
} = require('../data/memoryStore');

// Yeni bir ajan profilini kaydeden yardımcı.
function registerAgentProfile(payload) {
  if (!payload || !payload.id) {
    throw new Error('Ajan kaydı için benzersiz bir kimlik gereklidir.');
  }

  return upsertAgentProfile(payload.id, payload);
}

// Mevcut bir ajan profilini güncelleyen yardımcı.
function updateAgentProfile(id, updates) {
  if (!getAgentProfile(id)) {
    throw new Error('Ajan profili bulunamadı.');
  }

  return upsertAgentProfile(id, updates || {});
}

// Ajan profillerini filtreleyerek döndüren yardımcı.
function listAgentProfilesWithFilters(filters = {}) {
  const collection = listAgentProfiles();
  if (!filters.projectId) {
    return collection;
  }

  return Object.fromEntries(
    Object.entries(collection).filter(([, agent]) => agent.projectId === filters.projectId)
  );
}

// Belirli bir ajan profilini döndüren yardımcı.
function getAgentProfileById(id) {
  return getAgentProfile(id);
}

// Bir ajan profilini proje ile eşleyen yardımcı.
function linkProfileToProject(agentId, projectId) {
  const linked = linkAgentToProject(agentId, projectId);
  if (!linked) {
    throw new Error('Ajan profili bulunamadı.');
  }

  return linked;
}

// Bir ajan profilini kaldıran yardımcı.
function removeAgentProfile(id) {
  return deleteAgentProfile(id);
}

module.exports = {
  registerAgentProfile,
  updateAgentProfile,
  listAgentProfilesWithFilters,
  getAgentProfileById,
  linkProfileToProject,
  removeAgentProfile
};
