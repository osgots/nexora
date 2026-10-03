import test from 'node:test'
import assert from 'node:assert/strict'
import { freshState, parseState, buildPlan, gradeAnswer, recordAnswer, rankTopics, readiness } from '../src/lib/learning.ts'
test('clean judge demo begins at 68% with Booth weakest and no fabricated attempts', () => {
  const state = freshState(); assert.equal(readiness(state.topics), 68); assert.equal(rankTopics(state.topics)[0].name, 'Booth algorithm'); assert.equal(state.attempts.length, 0)
})
test('a correct answer persists and makes Cache the next priority', () => {
  const { state, attempt } = recordAnswer(freshState(), 'Booth algorithm', 'It detects transitions between runs and selects add or subtract operations.', 'one', '2026-10-03T10:00:00Z')
  assert.equal(attempt.score, 100); assert.equal(attempt.after, 63); assert.equal(rankTopics(state.topics)[0].name, 'Cache mapping'); assert.equal(readiness(state.topics), 71)
  assert.deepEqual(parseState(JSON.stringify(state)), state)
})
test('partial and unrelated answers produce inspectable feedback', () => {
  assert.equal(gradeAnswer('Cache mapping', 'The index selects the line.').score, 50)
  assert.equal(gradeAnswer('Cache mapping', 'indexing tagged unrelated').score, 0)
  assert.equal(gradeAnswer('Cache mapping', 'The index selects the line and the tag identifies the block.').score, 100)
  assert.equal(gradeAnswer('Memory hierarchy', 'Faster access reduces latency.').score, 100)
})
test('plan respects the requested time budget across supported durations', () => {
  for (const minutes of [15, 30, 48, 60, 84, 90, 180]) {
    const plan = buildPlan(freshState().topics, minutes)
    assert.equal(plan.reduce((n, p) => n + p.minutes, 0), minutes)
    assert.equal(plan[0].topic, 'Booth algorithm')
  }
})
test('malformed local storage cannot crash or poison the dashboard', () => {
  for (const raw of ['{bad', 'null', '{}', '{"version":2,"topics":[]}', JSON.stringify({ ...freshState(), topics: [{ name: '__proto__', mastery: 999 }] })]) assert.deepEqual(parseState(raw), freshState())
  const state = freshState(); state.attempts = [null]; assert.deepEqual(parseState(JSON.stringify(state)).attempts, [])
})
test('legacy mastery migrates and seed state is never mutated', () => {
  const legacy = freshState().topics; legacy[0].mastery = 40
  assert.equal(parseState(null, JSON.stringify(legacy)).topics[0].mastery, 40)
  assert.equal(freshState().topics[0].mastery, 86)
})
