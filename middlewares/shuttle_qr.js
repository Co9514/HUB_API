const crypto = require("crypto");
const moment = require("moment");
const dateutils = require("date-utils");

const DECRYPTION_KEY = "HUBHUBHUBHUBHUBHUBHUBHUBHUBHUBHU"; // Must be 256 bits (32 characters)
const iv = "1234567890123456";
const deciphercheck = async (id, key) => {
  try {
    let decipher = crypto.createDecipheriv("aes-256-cbc", DECRYPTION_KEY, iv);
    let decrypted = decipher.update(id, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.log(err);
  }
};
const onError = error => {
  res.status(500).json({
    message: err.message,
    error: err
  });
};

const ShuttleQRMiddleware = async (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  try {
    const student = await deciphercheck(id, DECRYPTION_KEY);
    console.log("기존 문자열: " + id);
    console.log("복호화된 문자열" + student);
    const studentNumber = student.substring(0, 8);
    console.log("학번 : " + studentNumber);

    const time = student.substring(8, 22); // 복호화 된 값에서 시간 값을 추출
    const year = time.substring(0, 4);
    const month = time.substring(4, 6);
    const day = time.substring(6, 8);
    const hour = time.substring(8, 10);
    const minute = time.substring(10, 12);
    const second = time.substring(12, 14);

    const timef = new Date(year, month - 1, day, hour, minute, second, 0); //받은 시간의 날짜를 데이트 객체로 포맷
    const limitTime = new Date(timef.setSeconds(timef.getSeconds() + 60)); //받은 시간의 날짜 기준 리미트 60초
    const serverTime = new Date(); //서버의 현재시간

    console.log(limitTime);
    console.log(serverTime);
    console.log(serverTime < limitTime); //현재시간과 리미트 시간을 비교하여 true/false 반환

    if (serverTime < limitTime) {
      let data = new Object();
      data.student = studentNumber;
      data.station = req.body.station;
      data.type = req.body.type;
      const jsonData = JSON.stringify(data);
      req.jsonData = jsonData;
      next();
    } else res.Error(403);
  } catch {
    next(new Error("복호화 에러"));
  }
};
module.exports = ShuttleQRMiddleware;
