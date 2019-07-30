import _ from 'lodash';

export function hirschVolumes(orderBook, trimSize, blockSize) {
    let trimmed = orderBook.trim(trimSize)
    let bidH = _hirsch(0, 0, blockSize, trimmed.bids);
    let offerH = _hirsch(0, 0, blockSize, trimmed.offers);
    return [bidH, offerH];
}

function _hirsch(current, max, blockSize, line) {
    if (line.length <= current) {
        return max;
    } else {
        let testSize = (current + 1) * blockSize;
        let firstN = _.take(line, current + 1);
        if (firstN.every((e) => e.amount >= testSize)) {
            let newMax = Math.max(max, current + 1);
            return _hirsch(current + 1, newMax, blockSize, line);
        } else {
            let rest = _.drop(line, current);
            return _hirsch(0, max, blockSize, rest);
        }
    }
}