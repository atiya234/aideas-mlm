const users = [];

export const registerUser = (userData) => {
    users.push({
        name:userData.name,
        email:userData.email.trim().toLowerCase(),
        password:userData.password,
        referralCode:userData.referralCode
    });
};

export const  loginUser = (email, password) => {
    return users.find((user)=>user.email === email.trim().toLowerCase() && user.password === password)
};