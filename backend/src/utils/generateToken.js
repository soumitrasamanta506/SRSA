import jwt from "jsonwebtoken";
const generateToken = (user, role) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        role
    }, process.env.JWT_KEY);
};

export default generateToken;