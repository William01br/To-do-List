export const createUsername = (name) => {
  console.log(name);
  const newName = name.split(" ")[0].toLowerCase();
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const newTimeString = timeString
    .replace(/:/g, "")
    .replace(/ /g, "")
    .replace("PM" || "AM", "");
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return `${newName}${newTimeString}${randomNumber}`;
};

// const name = "william santos";
// const username = createUsername(name);
// console.log(username);
