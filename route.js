const {
    register,
    login,
    saveTemperature,
    getTemperatureData,
    savehumid,
    gethumid,
    saveTurbidity,
    getTurbidity,
    getTotalTurbidity,
    gettotalhumid,
    getWaterStatus,
    updateWaterStatus,
    getWtempData,
  } = require("./handler");

  const routes = [
    {
      method: "POST",
      path: "/register",
      handler: register,
    },
    {
      method: "POST",
      path: "/login",
      handler: login,
    },
    {
      method: "POST",
      path: "/temp",
      handler: saveTemperature,
    },
    {
      method: "GET",
      path: "/temp1",
      handler: getTemperatureData,
    },
    {
      method: "POST",
      path: "/humid",
      handler: savehumid,
    },
    {
      method: "GET",
      path: "/humid1",
      handler: gethumid,
    },
    {
      method: "GET",
      path: "/humid2",
      handler: gettotalhumid,
    },
    {
      method: "POST",
      path: "/turbid",
      handler: saveTurbidity,
    },
    {
      method: "GET",
      path: "/turbid1",
      handler: getTurbidity,
    },
    {
      method: "GET",
      path: "/turbid2",
      handler: getTotalTurbidity,
    },
    {
      method: 'GET',
      path: '/getWaterStatus',
      handler: getWaterStatus,
  },
  {
    method: 'POST',
    path: '/updateWaterStatus',
    handler: updateWaterStatus,
  },
  {
    method: 'GET',
    path: '/getwtemp1',
    handler: getWtempData,
},

];


module.exports = routes;