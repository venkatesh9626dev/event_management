export let categoryColors = {"tech" : "rgb(59 130 246)","Sports" : "rgb(239 68 68)","Culturals": "rgb(168 85 247)","Education" : "rgb(34 197 94)"}
export const radius = 40000;

export function expiryCheck(eventDate, eventTime) {
    let currentDate = new Date();
  
    let [year, month, day] = eventDate.split("-").map(Number);
    let [hours, minutes] = eventTime.split(":").map(Number);
    let eventDateTime = new Date(year, month - 1, day, hours, minutes);
    let expiryState = "past";
    let formattedTime = formatTime([hours, minutes],eventDateTime);
    if (eventDateTime > currentDate) {
      expiryState = "upcoming"
    }
  
    return [expiryState,formattedTime]
  }
  
  // format time
  
  export function formatTime(timeArr,eventDate) {
    let timeUnit = timeArr[0] >= 12 ? "PM" : "AM";
    let hours = timeArr[0] % 12;
    let correctTime = hours ? `${hours}` : "12";
    let options = { weekday: 'long', day: 'numeric', month: 'long' };
    let formatDate = new Intl.DateTimeFormat('en-US', options).format(eventDate);
    return [`${correctTime}:${timeArr[1] || "00"} ${timeUnit}`,formatDate];
  }

  
  
  