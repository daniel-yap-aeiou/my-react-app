import "../../util/window";
const temp = process.env.REACT_APP_WEATHER_API_KEY;
const KEY = window.app.decrypt(temp);
export default KEY;