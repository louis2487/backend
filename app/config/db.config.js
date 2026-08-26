module.exports = {
  HOST: "192.168.50.192",
  USER: "jangsucrops",
  PASSWORD: "jangsucrops123",
  DB: "jangsucropsdb",
  dialect: "postgres",
  PORT: 60039,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
