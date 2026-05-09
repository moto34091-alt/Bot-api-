let history = [];

function addHistory(signal, price) {

    history.push({
        signal,
        price,
        time: new Date()
    });
}

function getHistory() {
    return history;
}

module.exports = {
    addHistory,
    getHistory
};
