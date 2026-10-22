/**
 * 包装异步路由处理函数，捕获 Promise 异常并交给 Express 错误中间件。
 */
function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = {
  asyncHandler
};
