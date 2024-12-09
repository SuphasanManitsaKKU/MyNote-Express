const { PrismaClient } = require('@prisma/client');
console.log("++++++++++++++++");

const prisma = new PrismaClient();

console.log("----------------");

module.exports = prisma;
