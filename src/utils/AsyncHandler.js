const asyncHandler = (fun) => {
    return (req, res, next) => {
        Promise.resolve(fun(req, res, next)).catch(next);
    };
};
// app.get("/users", asyncHandler(async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// }));

