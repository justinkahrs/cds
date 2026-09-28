import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex, circularOffset, searchMatches, slotOrder, casePose, CASE_WIDTH, surpriseDistance, spinProgress } from '../src/lib/carousel.mjs';

test('selection wraps in both directions and across multiple revolutions', () => {
  assert.equal(wrapIndex(-1, 170), 169);
  assert.equal(wrapIndex(170, 170), 0);
  assert.equal(wrapIndex(-341, 170), 169);
  assert.equal(wrapIndex(12, 1), 0);
  assert.equal(wrapIndex(12, 0), 0);
});
test('neighbors stay adjacent at both ends of the ring', () => {
  assert.equal(circularOffset(169, 0, 170), -1);
  assert.equal(circularOffset(0, 169, 170), 1);
  assert.equal(circularOffset(10, 10, 170), 0);
  assert.equal(circularOffset(0, 2, 3), 1);
});
test('search is case insensitive and retains multi-disc locations', () => {
  assert.ok(searchMatches('Radiohead In Rainbows 106', '  RAINBOWS '));
  assert.ok(searchMatches('Box set 173,174,175', '174'));
  assert.ok(searchMatches('Album', ''));
  assert.equal(searchMatches('Album 17', '173'), false);
});

test('physical slot order handles multiple discs, double digits, and unassigned albums', () => {
  const slots = ['140', null, '173,174,175', '4', '25', '2'];
  assert.deepEqual(slots.sort((left, right) => slotOrder(left) - slotOrder(right)), ['2', '4', '25', '140', '173,174,175', null]);
});

test('case clearance remains positive throughout rotation and for short filtered lists', () => {
  for (const count of [2, 3, 6, 12, 170]) {
    for (let frame = 0; frame <= 100; frame++) {
      const left = casePose(-frame / 100, count);
      const right = casePose(1 - frame / 100, count);
      const separation = Math.hypot(left.x - right.x, left.z - right.z);
      assert.ok(separation > CASE_WIDTH + 30, `Cases intersect for count ${count}, frame ${frame}`);
    }
  }
});

test('surprise spin takes the long path and lands on its preselected destination', () => {
  for (const count of [2, 6, 170]) {
    for (const start of [0, count - 1]) {
      for (let target = 0; target < count; target++) {
        const distance = surpriseDistance(start, target, count);
        assert.ok(distance >= 24);
        assert.equal(wrapIndex(start + distance, count), target);
      }
    }
  }
  assert.equal(surpriseDistance(0, 0, 1), 0);
});

test('spin easing advances monotonically and slows near the destination', () => {
  assert.equal(spinProgress(0), 0);
  assert.equal(spinProgress(1), 1);
  for (let frame = 1; frame <= 100; frame++) assert.ok(spinProgress(frame / 100) >= spinProgress((frame - 1) / 100));
  assert.ok(spinProgress(0.02) < 0.001);
  assert.ok(1 - spinProgress(0.98) < 0.001);
});
