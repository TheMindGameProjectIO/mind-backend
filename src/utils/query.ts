const runQuery = async (callback: any) => {
    try{
        const query = await callback();
    } catch (e) {
        console.log(e);
    }
}