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

export {
    isModified
}