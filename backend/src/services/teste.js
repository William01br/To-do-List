const daysToMilliseconds = (days) => days * 24 * 60 * 60 * 1000;
const expiresAt = Date.now() + daysToMilliseconds(14);

console.log(expiresAt);
console.log(new Date(expiresAt));
console.log(new Date(1737200188167));
