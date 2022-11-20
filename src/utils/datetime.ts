const getExpireDate = (seconds: number) => {
    return new Date(Date.now() + seconds * 1000);
}

const getCurrentDate = () => {
    return new Date();
}

export {
    getExpireDate,
    getCurrentDate
}