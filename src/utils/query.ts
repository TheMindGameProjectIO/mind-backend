const runQuery = async (callback: any) => {
    try{
        const query = await callback();
    } catch (e) {
        console.log(e);
    }
}

const isModified = (query: any, field: string) => {
    return !!query.getUpdate().$set[field] || !!query.getUpdate()[field];
}

const run = <T = any>(callback: any, defaultValue: T): T => {
    try {
        return callback();
    } catch (e) {
        console.log(e);
        return defaultValue;
    }
} 

export {
    isModified
}