let Bitmex = function() {
}

Bitmex.prototype.onAction = function(action, tableName, symbol, store, data) {
    // Deltas before the getSymbol() call returns can be safely discarded.
    if (action !== 'partial' && !this.isInitialized(tableName, symbol, store)) return [];
    // Partials initialize the table, so there's a different signature.
    if (action === 'partial') return this._partial(tableName, symbol, store, data);

    // Some tables don't have keys, like 'trade' and 'quote'. They are insert-only tables
    // and you should never see updates or deletes on them.
    const keys = store[tableName];
    if ((action === 'update' || action === 'delete') && keys.length === 0) {
        throw new Error("The data in the store " + tableName + " is not keyed for " + action + "s. ");
    }

    // This dispatches delete/insert/update.

    const f = action === 'update' ? this._update : action === 'partial' ? this._partial : action === 'insert' ? this._insert : action === 'delete' ? this._delete : this._fail;
    return f(store[tableName], symbol, data.data, store[tableName]);
};

Bitmex.prototype.isInitialized = function (tableName, symbol, store) {
    return store[tableName] && store[tableName][symbol];
};

Bitmex.prototype._delete = function (context, key, data, keys) {
    return this.removeFromStore.apply(null, arguments);
};

Bitmex.prototype._insert = function (context, key, data, keys) {
    return this.insertIntoStore.apply(null, arguments);
};

Bitmex.prototype._partial = function (tableName, symbol, store, data) {
    if (!store[tableName]) store[tableName] = {};
    const dataArr = data.data || [];
    // Intitialize data.
    if (!store[tableName][symbol] || dataArr.length) {
        store[tableName][symbol] = dataArr;
    }
    // Initialize keys.
    store[tableName] = data.keys;
    // Return inserted data
    return dataArr;
};

Bitmex.prototype._fail = function () {
    throw new Error("Unknown action dispatched")
};

Bitmex.prototype._update = function (context, key, data, keys) {
    return this.updateStore.apply(null, arguments);
};

Bitmex.prototype.insertIntoStore = function (context, key, newData) {
    const store = context[key] || [];

    // Create a new working object.
    const storeData = [].concat(store).concat(newData);

    return this.replaceStore(context, key, storeData);
};


Bitmex.prototype.updateStore = function (context, key, newData, keys) {
    const store = context[key] || [];

    // Create a new working object.
    const storeData = [].concat(store);

    // Loop through data, updating items in `storeData` when necessary.
    for (let i = 0; i < newData.length; i++) {
        let newDatum = newData[i];

        // Find the item we're updating, if it exists.
        const criteria = _.pick(newDatum, keys);
        const itemToUpdate = _.find(storeData, criteria);

        // If the item exists, replace it with an updated item.
        // This will actually replace the existing store with a new array
        // containing a completely new updated object. A little more GC work
        // but unique object references, for better shouldComponentUpdate.
        if (itemToUpdate) {
            newDatum = bitmex.updateItem(itemToUpdate, newDatum);
            storeData[storeData.indexOf(itemToUpdate)] = newDatum;
        }
        // This is bad - the item didn't exist and we're trying to update it.
        // A lot of bad things can happen here since we basically have an incomplete
        // data set. An insert should have come first, but we can't treat this as an
        // insert because we'd end up with an item that has missing properties.
        else {
            throw new Error("Update for missing item came through on " + key + ". Data: " + JSON.stringify(newDatum));
        }
    }

    return this.replaceStore(context, key, storeData);
};

Bitmex.prototype.removeFromStore = function(context, key, newData, keys) {
    const store = context[key] || [];

    // Create a new working object.
    let storeData = [].concat(store);

    // Loop through incoming data and remove items that match.
    for (let i = 0; i < newData.length; i++) {

        // Find the item to remove and remove it.
        const criteria = _.pick(newData[i], keys);
        const itemToRemove = _.find(storeData, criteria);
        storeData = _.without(storeData, itemToRemove);
    }

    return bitmex.replaceStore(context, key, storeData);
};

Bitmex.prototype.replaceStore = function(context, key, newData) {
    // Store could be an array or singular object/model.
    if (!Array.isArray(context[key])) {
        // Not an array - simply replace with the first item in our new array.
        // This is for single object stores, like margin.
        context[key] = newData[0];
    } else {
        context[key] = newData;
    }
    return context[key];
};

Bitmex.prototype.updateItem = function(item, newData) {
    return _.extend({}, item, newData);
};

Bitmex.prototype.strip = function(book, numOrders) {
    const asks = _.filter(book.data, {'side': 'Sell'});
    const bids = _.filter(book.data, {'side': 'Buy'});
    const topAsks = _.takeRight(asks, numOrders);
    const topBids = _.take(bids, numOrders);
    return {
        bids: _.reverse(topBids),
        asks: _.reverse(topAsks),
        symbol: topBids[0].symbol
    };
};