const { nanoid } = require('nanoid');

const generateId = (params) => `${params}-${nanoid()}`;

module.exports = { generateId };
