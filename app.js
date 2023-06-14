const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server is running at port:3000");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
  }
};
initializeDbAndServer();

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT *
    FROM state;`;
  const states_list = await db.all(getStatesQuery);
  response.send(states_list);
});

//API 2
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  console.log(stateId);
  const getStateQuery = `
  SELECT *
  FROM state
  WHERE state_id=${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//API 3
app.use(express.json());
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
  INSERT INTO 
  district (district_name,state_id,cases,cured,active,deaths)
  VALUES('${districtName}',
  ${stateId},
  ${cases},
  ${cured},
  ${active},
  ${deaths}
    );`;
  const dbResponse = await db.run(addDistrictQuery);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
  console.log(districtId);
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  console.log(districtId);
  const getDistrictQuery = `
  SELECT *
  FROM district
  WHERE district_id=${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
  console.log(district);
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district
    WHERE district_id=${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
  console.log("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
    UPDATE district
    SET district_name ='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE district_id=${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  console.log(stateId);
  const getStatsQuery = `
  SELECT 
  SUM(cases) AS totalCases,
  SUM(cured) AS totalCured,
  SUM(active) AS totalActive,
  SUM(deaths) AS totalDeaths
  FROM 
  district
  WHERE 
  state_id=${stateId};`;
  const dbResponse = await db.get(getStatsQuery);
  response.send(dbResponse);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  console.log(districtId);
  const getStateNameQuery = `
  SELECT state_name
  FROM state 
  INNER JOIN district
  ON state.state_id=district.state_id
  WHERE district.district_id=${districtId};`;
  const state = await db.get(getStateNameQuery);
  response.send(state);
});

module.exports = app;
