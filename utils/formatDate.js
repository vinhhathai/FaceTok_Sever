const  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
    const year = date.getFullYear();
    
    return `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
  };
  
  // Example usage
  const birthday = "2003-04-29T00:00:00.000Z";
  const formattedBirthday = formatDate(birthday);
  
  console.log(formattedBirthday); // Output: 29-04-2003
  module.exports = formatDate;
  