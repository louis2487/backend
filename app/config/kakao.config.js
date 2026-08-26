'use strict';

/**
 * 카카오 REST API 키
 * 배포 스크립트가 .env를 올리지 않으므로 config로 유지.
 * process.env.KAKAO_REST_API_KEY 가 있으면 우선 사용.
 */
module.exports = {
  restApiKey:
    process.env.KAKAO_REST_API_KEY || 'bf8557ea6ed6cd6cb7dd35010c783d8b',
};
