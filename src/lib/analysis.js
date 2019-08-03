import _ from 'lodash';

function _hirsch(current, max, blockSize, line) {
  if (line.length <= current) {
    return max;
  }

  const testSize = (current + 1) * blockSize;
  const firstN = _.take(line, current + 1);

  if (firstN.every(e => e.amount >= testSize)) {
    const newMax = Math.max(max, current + 1);
    return _hirsch(current + 1, newMax, blockSize, line);
  } else {
    const rest = _.drop(line, current + 1);
    return _hirsch(0, max, blockSize, rest);
  }
}

export function hirschVolumes(orderBook, trimSize, blockSize) {
  const trimmed = orderBook.trim(trimSize); // eslint-disable-line

  const bidH = _hirsch(0, 0, blockSize, trimmed.bids);

  const offerH = _hirsch(0, 0, blockSize, trimmed.offers);

  return [[bidH], [offerH]];
}
