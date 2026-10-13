import assert from 'node:assert/strict';
import { guidedProgress } from '../../lib/pilot/guided';

const record = [
 { id:'one', state:'done' as const },
 { id:'two', state:'ready' as const },
 { id:'three', state:'skipped' as const },
 { id:'four', state:'proposed' as const },
 { id:'five', state:'rejected' as const }
];
const s=guidedProgress(record);
assert.deepEqual(s,{ total:3,done:1,skipped:1,handled:2,proposed:1,currentId:'two',percentHandled:67 });
console.log('PASS GL-01 proposed/declined steps do not count as execution progress');
const blank=guidedProgress([]);
assert.equal(blank.percentHandled,0);
assert.equal(blank.currentId,null);
console.log('PASS GL-02 a new task has no inferred progress');
const finished=guidedProgress([{id:'x',state:'done' as const},{id:'y',state:'skipped' as const}]);
assert.equal(finished.currentId,null);
assert.equal(finished.done,1);
assert.equal(finished.handled,2);
console.log('PASS GL-03 skipped work is not reported as completed');
const proposalOnly=guidedProgress([{id:'p',state:'proposed' as const}]);
assert.equal(proposalOnly.total,0);
assert.equal(proposalOnly.proposed,1);
console.log('PASS GL-04 agent suggestions await the resident and are not treated as a plan');
