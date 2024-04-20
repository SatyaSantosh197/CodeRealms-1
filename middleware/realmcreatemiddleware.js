function generateRealmId(name) {
    return name + Math.random().toString(36).substr(2, 9); 
}

module.exports = generateRealmId;