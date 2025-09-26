// App Lab Agent - Yapay zeka ajan servisini doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const agentService = require('../src/services/aiAgentService');

test.beforeEach(() => {
  store.reset();
});

test('ajan profili oluşturma ve güncelleme', () => {
  const created = agentService.registerAgentProfile({
    id: 'agent-1',
    name: 'Mobil Uzmanı',
    provider: 'openai',
    model: 'gpt-4.1',
    capabilities: ['build', 'deploy']
  });

  assert.strictEqual(created.id, 'agent-1');
  assert.deepStrictEqual(created.capabilities, ['build', 'deploy']);

  const updated = agentService.updateAgentProfile('agent-1', {
    capabilities: ['build', 'deploy', 'qa'],
    instructions: 'Tüm testleri çalıştır ve raporla.'
  });

  assert.strictEqual(updated.instructions, 'Tüm testleri çalıştır ve raporla.');
  assert.deepStrictEqual(updated.capabilities, ['build', 'deploy', 'qa']);
});

test('ajan profillerini projeye göre filtreleme', () => {
  agentService.registerAgentProfile({ id: 'agent-a', projectId: 'proj-1' });
  agentService.registerAgentProfile({ id: 'agent-b', projectId: 'proj-2' });

  const all = agentService.listAgentProfilesWithFilters();
  assert.strictEqual(Object.keys(all).length, 2);

  const filtered = agentService.listAgentProfilesWithFilters({ projectId: 'proj-1' });
  assert.deepStrictEqual(Object.keys(filtered), ['agent-a']);
});

test('ajanı projeye bağlama ve silme', () => {
  agentService.registerAgentProfile({ id: 'agent-x' });

  const linked = agentService.linkProfileToProject('agent-x', 'proj-9');
  assert.strictEqual(linked.projectId, 'proj-9');

  const removed = agentService.removeAgentProfile('agent-x');
  assert.strictEqual(removed, true);
  assert.strictEqual(agentService.getAgentProfileById('agent-x'), null);
});
