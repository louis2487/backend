// const crypto = require('crypto');

// // const key = process.env.CRYPTO_KEY // 대칭형 키
// const key = "dosiwa" // 대칭형 키

// // 양뱡한
// // 암호화 & 복호화

// // 암호화 메서드
// const cipher = (password, key) => {
//     return new Promise((resolve, reject) => {
//         const encrypt = crypto.createCipher('des', key) // des알고리즘과 키를 설정
//         const encryptResult = encrypt.update(password, 'utf8', 'base64') // 암호화
//             + encrypt.final('base64') // 인코딩
//         resolve(encryptResult)
//     })
// }

// // 복호화 메서드
// const decipher = (password, key) => {
//     return new Promise((resolve, reject) => {
//         const decode = crypto.createDecipher('des', key)
//         const decodeResult = decode.update(password, 'base64', 'utf8') // 암호화된 문자열, 암호화 했던 인코딩 종류, 복호화 할 인코딩 종류 설정
//             + decode.final('utf8') // 복호화 결과의 인코딩

//         resolve(decodeResult)
//     })
// }
// module.exports = {
//     cipher,
//     decipher
// }

'use strict';

const crypto = require('crypto');
const util = require('util');

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

const createSalt = async () => {
    const buf = await randomBytesPromise(64);

    return buf.toString("base64");
};


const createHashedPassword = async (password) => {
    const salt = await createSalt();
    const key = await pbkdf2Promise(password, salt, 104906, 64, "sha512");
    const hashedPassword = key.toString("base64");
    return { hashedPassword, salt };
};

const createHashedPinNum = async (password) => {
    const pinSalt = await createSalt();
    const key = await pbkdf2Promise(password, pinSalt, 104906, 64, "sha512");
    const hashedPinNum = key.toString("base64");
    return { hashedPinNum, pinSalt };
};

const verifyPassword = async (password, userSalt, userPassword) => {
    const key = await pbkdf2Promise(password, userSalt, 104906, 64, "sha512");
    const hashedPassword = key.toString("base64");
    if (hashedPassword === userPassword) return true;
    return false;
};

// const algorithm = 'aes-256-cbc';
// const key = crypto.scryptSync('dosiwa', 'specialSalt', 32); // 나만의 암호화키. password, salt, byte 순인데 password와 salt는 본인이 원하는 문구로~ 
// const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음
// function encrypt(text) {
//     // const cipher = crypto.createCipheriv(algorithm, key, iv); //key는 32바이트, iv는 16바이트
//     // let result = cipher.update(text, 'utf8', 'base64');
//     // result += cipher.final('base64');
//     // // console.log('암호화: ', result);
//     // return result;


//     const cipher = crypto.createCipheriv(algorithm, key, iv); //key는 32바이트, iv는 16바이트
//     // const cipher = crypto.createCipheriv('aes-256-cbc', '열쇠');
//     let result = cipher.update(text, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
//     result += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

//     return result;


// }
// const makePasswordHashed = (userId, plainPassword) =>
//     new Promise(async (resolve, reject) => {
//         // salt를 가져오는 부분은 각자의 DB에 따라 수정
//         const salt = await models.user
//             .findOne({
//                 attributes: ['salt'],
//                 raw: true,
//                 where: {
//                     userId,
//                 },
//             })
//             .then((result) => result.salt);
//         crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
//             if (err) reject(err);
//             resolve(key.toString('base64'));
//         });
//     });

// function decrypt(result) {
//     const deciper = crypto.createDecipheriv(algorithm, key, iv);
//     let result2 = deciper.update(result, 'base64', 'utf8');
//     result2 += deciper.final('utf8');
//     // console.log('복호화: ', result2);
//     return result2
// }

module.exports = {
    createHashedPassword,
    createHashedPinNum,
    verifyPassword
};
